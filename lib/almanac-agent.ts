import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  AlmanacTopicData,
  getAvailableTopics,
  getTopicById,
} from "./almanac-db-service";

// --- TYPES ---
interface ChatMessage {
  role: "user" | "model";
  parts: { text: string }[];
}

// --- THE AGENT CLASS ---
export class AlmanacAgent {
  private chatHistory: ChatMessage[];
  private currentTopicId: string | null;
  private genAI: GoogleGenerativeAI;
  private availableTopics: Map<string, AlmanacTopicData> | null;

  constructor(apiKey: string) {
    this.chatHistory = [];
    this.currentTopicId = null;
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.availableTopics = null;
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

  // --- STEP A: THE ROUTER ---
  private async routeTopic(userInput: string): Promise<string | null> {
    const topics = await this.getTopics();

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

    const routerInstruction = `
      You are the Intent Router for an educational app called Almanac.

      TASK:
      Analyze the conversation history and latest input.
      Determine which topic from the list below the user is asking about.

      AVAILABLE TOPICS:
      ${topicList}

      RULES:
      - If user asks about a new topic, return that topic_id (e.g., "lesson_1").
      - If user asks a follow-up question (e.g., "Give an example", "Why?"), return "${this.currentTopicId || "null"}".
      - If input is off-topic or unclear, return "null".
      - Match topics by keywords, subject matter, or explicit mentions.
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
      const response = JSON.parse(result.response.text());
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

    if (!topicData) {
      throw new Error("Topic not found in database");
    }

    const displayName = topicData.curriculumTitle
      ? `${topicData.curriculumTitle} - ${topicData.title}`
      : topicData.title;

    const tutorInstruction = `
      You are a Socratic Tutor for the Almanac educational platform.

      CURRENT TOPIC: ${displayName}
      ${topicData.unitName ? `Unit: ${topicData.unitName}` : ""}

      CONSTRAINTS:
      1. Answer using ONLY the Source Material below.
      2. If asked about outside topics, politely refuse and redirect to the current topic.
      3. Use the Socratic method: Be brief, ask guiding questions, and help students discover answers.
      4. Reference the facts provided, especially CORE FACTS (🔑).
      5. Keep responses concise (2-4 sentences max).

      SOURCE MATERIAL:
      ${topicData.content}
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
