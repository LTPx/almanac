import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  AlmanacTopicData,
  getAvailableTopics,
  getTopicById,
} from "./almanac-db-service";
import { getTutorConfig, TutorConfigData } from "./tutor-config-service";

// --- TYPES ---
interface ChatMessage {
  role: "user" | "model";
  parts: { text: string }[];
}

export interface UserContext {
  name?: string;
  completedCurriculums?: Array<{
    title: string;
    completedAt: Date;
  }>;
  completedUnits?: Array<{
    title: string;
    curriculumTitle: string;
  }>;
  totalExperience?: number;
}

// --- THE AGENT CLASS ---
export class AlmanacAgent {
  private chatHistory: ChatMessage[];
  private currentTopicId: string | null;
  private genAI: GoogleGenerativeAI;
  private availableTopics: Map<string, AlmanacTopicData> | null;
  private tutorConfig: TutorConfigData | null;
  private userContext: UserContext | null;

  constructor(apiKey: string, userContext?: UserContext) {
    this.chatHistory = [];
    this.currentTopicId = null;
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.availableTopics = null;
    this.tutorConfig = null;
    this.userContext = userContext || null;
  }

  // Lazy loading de la configuración del tutor desde la DB
  private async getConfig(): Promise<TutorConfigData> {
    if (!this.tutorConfig) {
      this.tutorConfig = await getTutorConfig();
    }
    return this.tutorConfig;
  }

  // Lazy loading de los topics desde la DB
  private async getTopics(): Promise<Map<string, AlmanacTopicData>> {
    if (!this.availableTopics) {
      this.availableTopics = await getAvailableTopics();
    }
    return this.availableTopics;
  }

  // Helper to format history for the Router's context (plain text)
  private getHistoryText(): string {
    return this.chatHistory
      .slice(-6) // Look at last 3 turns
      .map((msg) => `${msg.role.toUpperCase()}: ${msg.parts[0].text}`)
      .join("\n");
  }

  // Helper to format user context for personalization
  private getUserContextText(): string {
    if (!this.userContext) return "";

    const parts: string[] = [];

    if (this.userContext.name) {
      parts.push(`STUDENT NAME: ${this.userContext.name}`);
    }

    if (this.userContext.totalExperience) {
      parts.push(`TOTAL EXPERIENCE POINTS: ${this.userContext.totalExperience}`);
    }

    if (this.userContext.completedCurriculums && this.userContext.completedCurriculums.length > 0) {
      const curriculums = this.userContext.completedCurriculums
        .map(c => c.title)
        .join(", ");
      parts.push(`COMPLETED CURRICULUMS: ${curriculums}`);
    }

    if (this.userContext.completedUnits && this.userContext.completedUnits.length > 0) {
      const units = this.userContext.completedUnits
        .map(u => `${u.title} (${u.curriculumTitle})`)
        .join(", ");
      parts.push(`COMPLETED UNITS: ${units}`);
    }

    return parts.length > 0 ? `\n\nSTUDENT CONTEXT:\n${parts.join("\n")}` : "";
  }

  // --- STEP A: THE ROUTER ---
  private async routeTopic(userInput: string): Promise<string | null> {
    const topics = await this.getTopics();
    const config = await this.getConfig();

    if (topics.size === 0) {
      console.warn("⚠️ No active topics found in database");
      return null;
    }

    // Crear la lista de topics disponibles para el router
    const topicList = Array.from(topics.entries())
      .map(([id, topic]) => {
        // Crear un ID más legible combinando el nombre del curriculum y lesson
        const displayName = topic.curriculumTitle
          ? `${topic.curriculumTitle} - ${topic.title}`
          : topic.title;
        return `${id}: ${displayName} (${topic.description.substring(0, 100)})`;
      })
      .join("\n");

    // Usar instrucciones personalizables desde la DB
    const routerInstruction = `
      ${config.routerInstructions}

      AVAILABLE TOPICS:
      ${topicList}

      CURRENT TOPIC: ${this.currentTopicId || "null"}
    `;

    // Initialize Router Model (Flash is fast/cheap)
    const model = this.genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: routerInstruction,
      generationConfig: { responseMimeType: "application/json" },
    });

    const prompt = `
      HISTORY:
      ${this.getHistoryText()}

      LATEST INPUT: "${userInput}"

      Return strictly JSON: { "topic_id": "string_id_or_null" }
    `;

    try {
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      const response = JSON.parse(responseText);
      return response.topic_id;
    } catch (e: any) {
      console.error("Router Error:", e);

      // Si es un error de Gemini (429, 500, etc), propagarlo
      if (e.status === 429) {
        throw new Error("⚠️ Rate limit exceeded. Please wait a moment and try again.");
      }
      if (e.status >= 500) {
        throw new Error("⚠️ Gemini service is temporarily unavailable. Please try again later.");
      }
      if (e.message?.includes("API key")) {
        throw new Error("⚠️ API configuration error. Please contact support.");
      }

      // Para otros errores, retornar null para que el flujo continúe
      return null;
    }
  }

  // --- STEP B: THE TUTOR ---
  private async generateTutorResponse(userInput: string): Promise<string> {
    if (!this.currentTopicId) {
      throw new Error("No topic selected");
    }

    // Obtener el topic actual desde la DB
    const topicData = await getTopicById(this.currentTopicId);
    const config = await this.getConfig();

    if (!topicData) {
      throw new Error("Topic not found in database");
    }

    const displayName = topicData.curriculumTitle
      ? `${topicData.curriculumTitle} - ${topicData.title}`
      : topicData.title;

    // Usar instrucciones personalizables desde la DB
    const tutorInstruction = `
      ${config.tutorInstructions}

      CURRENT TOPIC: ${displayName}
      ${topicData.unitName ? `Unit: ${topicData.unitName}` : ""}

      SOURCE MATERIAL:
      ${topicData.content}
      ${this.getUserContextText()}
    `;

    // We instantiate a new model every time so we can inject the specific System Instruction
    const model = this.genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: tutorInstruction,
    });

    // We send the full history to the model so it has context
    const fullConversation = [
      ...this.chatHistory,
      { role: "user" as const, parts: [{ text: userInput }] },
    ];

    try {
      const result = await model.generateContent({ contents: fullConversation });
      const responseText = result.response.text();
      return responseText;
    } catch (e: any) {
      console.error("Tutor Generation Error:", e);

      // Propagar errores de Gemini con mensajes claros
      if (e.status === 429) {
        throw new Error("⚠️ Too many requests. Please wait a moment before asking another question.");
      }
      if (e.status >= 500) {
        throw new Error("⚠️ AI service is temporarily unavailable. Please try again in a few moments.");
      }
      if (e.message?.includes("API key")) {
        throw new Error("⚠️ API configuration error. Please contact support.");
      }

      // Error genérico
      throw new Error("⚠️ An error occurred while generating the response. Please try again.");
    }
  }

  // --- MAIN CHAT FUNCTION ---
  async chat(userInput: string): Promise<string> {
    // 1. Route
    const detectedTopic = await this.routeTopic(userInput);
    const topics = await this.getTopics();

    // 2. Logic: Handle "Sticky" Topics
    if (detectedTopic && detectedTopic !== "null") {
      if (topics.has(detectedTopic)) {
        this.currentTopicId = detectedTopic;
      } else {
        console.warn(`Topic ${detectedTopic} not found in topics map`);
      }
    }

    // 3. Handle "No Topic Selected" Case
    if (!this.currentTopicId) {
      // Generar una lista de topics disponibles para mostrar al usuario
      const topicNames = Array.from(topics.values())
        .slice(0, 5) // Mostrar solo los primeros 5
        .map((t) => t.title)
        .join(", ");

      const fallback = topics.size > 0
        ? `I'm your Almanac Tutor! I can help you learn about: ${topicNames}${topics.size > 5 ? ", and more" : ""}. What would you like to learn about?`
        : "I'm your Almanac Tutor! However, there are no topics available in the database yet. Please ask an administrator to add some lessons.";

      this.chatHistory.push({ role: "user", parts: [{ text: userInput }] });
      this.chatHistory.push({ role: "model", parts: [{ text: fallback }] });
      return fallback;
    }

    // 4. Generate Answer
    const responseText = await this.generateTutorResponse(userInput);

    // 5. Update History
    this.chatHistory.push({ role: "user", parts: [{ text: userInput }] });
    this.chatHistory.push({ role: "model", parts: [{ text: responseText }] });

    return responseText;
  }

  // Helper methods for session management
  getHistory(): ChatMessage[] {
    return this.chatHistory;
  }

  restoreHistory(messages: Array<{ role: "user" | "model"; content: string }>): void {
    this.chatHistory = messages.map((msg) => ({
      role: msg.role,
      parts: [{ text: msg.content }],
    }));
  }

  getCurrentTopic(): string | null {
    return this.currentTopicId;
  }

  async getCurrentTopicData(): Promise<AlmanacTopicData | null> {
    if (!this.currentTopicId) return null;
    return await getTopicById(this.currentTopicId);
  }

  // Método para refrescar los topics (útil si se agregan nuevos durante la sesión)
  async refreshTopics(): Promise<void> {
    this.availableTopics = await getAvailableTopics();
  }
}
