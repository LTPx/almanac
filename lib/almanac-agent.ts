import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  AlmanacTopicData,
  getAvailableTopics,
  getTopicById,
  getTopicByCurriculumId
} from "./almanac-db-service";
import { getTutorConfig, TutorConfigData } from "./tutor-config-service";
import dayjs from "dayjs";

// --- TYPES ---
interface ChatMessage {
  role: "user" | "model";
  parts: { text: string }[];
}

export interface UserContext {
  name?: string;
  dateOfBirth?: Date | string;
  languagePreference?: string;
  completedCurriculums?: Array<{
    title: string;
    completedAt: Date;
  }>;
  completedUnits?: Array<{
    title: string;
    curriculumTitle: string;
  }>;
  totalExperience?: number;
  availableUnits?: Array<{
    id: number;
    name: string;
    curriculumId: string;
    curriculumTitle: string;
  }>;
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

    // Calculate and add age if dateOfBirth is available
    if (this.userContext.dateOfBirth) {
      const birthDate = dayjs(this.userContext.dateOfBirth);
      const today = dayjs();
      const age = today.diff(birthDate, "year");
      if (age > 0 && age < 150) {
        // Sanity check
        parts.push(`STUDENT AGE: ${age} years old`);
      }
    }

    if (this.userContext.languagePreference) {
      parts.push(`STUDENT LANGUAGE: ${this.userContext.languagePreference}`);
    }

    // if (this.userContext.totalExperience) {
    //   parts.push(
    //     `TOTAL EXPERIENCE POINTS: ${this.userContext.totalExperience}`
    //   );
    // }

    if (
      this.userContext.completedCurriculums &&
      this.userContext.completedCurriculums.length > 0
    ) {
      const curriculums = this.userContext.completedCurriculums
        .map((c) => c.title)
        .join(", ");
      parts.push(`COMPLETED CURRICULUMS: ${curriculums}`);
    }

    if (
      this.userContext.completedUnits &&
      this.userContext.completedUnits.length > 0
    ) {
      const units = this.userContext.completedUnits
        .map((u) => `${u.title} (${u.curriculumTitle})`)
        .join(", ");
      parts.push(`COMPLETED UNITS: ${units}`);
    }

    // Add available units with link generation instructions
    // if (
    //   this.userContext.availableUnits &&
    //   this.userContext.availableUnits.length > 0
    // ) {
    //   parts.push("\n\n--- IMPORTANT: UNIT LINKING INSTRUCTIONS ---");
    //   parts.push(
    //     "When you mention ANY unit in your response, you MUST include a clickable markdown link."
    //   );
    //   parts.push(
    //     "NEVER use placeholder text like 'link_to_...' - ALWAYS use the EXACT URL format shown below."
    //   );
    //   parts.push("\nExample of CORRECT format:");
    //   parts.push("[Unidad 1: Mamíferos](/contents?curriculumid=abc123&unit=5)");
    //   parts.push("\nExample of INCORRECT format (DO NOT USE):");
    //   parts.push("[Unidad 1: Mamíferos](link_to_Unidad_1_Mamíferos) ❌");
    //   parts.push(
    //     "\n\nAVAILABLE UNITS - Copy the EXACT link shown for each unit:"
    //   );
    //   this.userContext.availableUnits.forEach((unit) => {
    //     parts.push(
    //       `• ${unit.name}: [${unit.name}](/contents?curriculumid=${unit.curriculumId}&unit=${unit.id})`
    //     );
    //   });
    //   parts.push(
    //     "\nREMEMBER: Copy the link EXACTLY as shown above, including the curriculumid and unit parameters!"
    //   );
    // }

    return parts.length > 0 ? `\n\nSTUDENT CONTEXT:\n${parts.join("\n")}` : "";
  }

  // --- STEP A: THE ROUTER ---
  private async routeTopic(userInput: string): Promise<string | null> {
    const config = await this.getConfig();

    // Usar el Master Catalog de la configuración
    const masterCatalog = config.masterCatalog || [];

    if (masterCatalog.length === 0) {
      console.warn("⚠️ No tracks found in Master Catalog");
      return null;
    }

    // Crear la lista de topics desde el Master Catalog
    // Formato: - ID: "track_id" | COURSE: "Title" | KEYWORDS: Description
    const topicListString = masterCatalog
      .map(
        (track) =>
          `- ID: "${track.id}" | COURSE: "${track.title}" | KEYWORDS: ${track.desc}`
      )
      .join("\n");

    // Usar instrucciones personalizables desde la DB con el Master Catalog
    const routerInstruction = `
      ${config.routerInstructions}

      AVAILABLE COURSES (Use ONLY these IDs):
      ${topicListString}
    `;

    // Incluir el contexto actual en el STATE block
    const currentContext = this.currentTopicId
      ? `CURRENT_TOPIC_ID: "${this.currentTopicId}"`
      : "CURRENT_TOPIC_ID: None";

    const prompt = `
      STATE:
      ${currentContext}

      CONVERSATION HISTORY:
      ${this.getHistoryText()}

      LATEST INPUT: "${userInput}"

      Return strictly JSON: { "topic_id": "string_id_or_null" }
    `;

    const model = this.genAI.getGenerativeModel({
      model: config.routerModel || "gemini-2.0-flash",
      systemInstruction: routerInstruction,
      generationConfig: {
        responseMimeType: "application/json",
        temperature: config.routerTemperature ?? 0.1
      }
    });

    console.log(
      ":::::::::::::::::::::::::::::::::::::::::::::::::::::prompt to router:::::::::::::::::::::::::::::::::::::::::::::::::::::"
    );
    console.log(prompt);
    console.log(
      ":::::::::::::::::::::::::::::::::::::::::::::::::::::prompt to router:::::::::::::::::::::::::::::::::::::::::::::::::::::"
    );

    try {
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      const response = JSON.parse(responseText);
      return response.topic_id;
    } catch (e: any) {
      console.error("Router Error:", e);

      // Si es un error de Gemini (429, 500, etc), propagarlo
      if (e.status === 429) {
        throw new Error(
          "⚠️ Rate limit exceeded. Please wait a moment and try again."
        );
      }
      if (e.status >= 500) {
        throw new Error(
          "⚠️ Gemini service is temporarily unavailable. Please try again later."
        );
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
    const config = await this.getConfig();
    let tutorInstruction = "";

    if (!this.currentTopicId) {
      tutorInstruction = `
      ${config.tutorInstructions}

      CURRENT TOPIC: none

      SOURCE MATERIAL:
      ${this.getUserContextText()}
    `;
    } else {
      // Detectar si es un curriculum ID o un lesson ID
      // Los curriculum IDs son cuid() mientras que los lesson IDs tienen formato "lesson_X"
      const isCurriculumId = !this.currentTopicId.startsWith("lesson_");

      const topicData = isCurriculumId
        ? await getTopicByCurriculumId(this.currentTopicId)
        : await getTopicById(this.currentTopicId);

      if (!topicData) {
        throw new Error("Topic not found in database");
      }

      const displayName = topicData.curriculumTitle
        ? `${topicData.curriculumTitle} - ${topicData.title}`
        : topicData.title;

      tutorInstruction = `
      ${config.tutorInstructions}

      CURRENT TOPIC: ${displayName}
      ${topicData.unitName ? `Unit: ${topicData.unitName}` : ""}

      SOURCE MATERIAL:
      ${topicData.content}
      ${this.getUserContextText()}
    `;
    }
    console.log(
      ":::::::::::::::::::::::::::::::::::::::::::::::::::::tutor instructions:::::::::::::::::::::::::::::::::::::::::::::::::::::"
    );
    console.log(tutorInstruction);
    console.log(
      ":::::::::::::::::::::::::::::::::::::::::::::::::::::tutor instructions:::::::::::::::::::::::::::::::::::::::::::::::::::::"
    );
    // We instantiate a new model every time so we can inject the specific System Instruction
    const model = this.genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: tutorInstruction
    });

    // We send the full history to the model so it has context
    const fullConversation = [
      ...this.chatHistory,
      { role: "user" as const, parts: [{ text: userInput }] }
    ];

    try {
      const result = await model.generateContent({
        contents: fullConversation
      });
      const responseText = result.response.text();
      return responseText;
    } catch (e: any) {
      console.error("Tutor Generation Error:", e);

      // Propagar errores de Gemini con mensajes claros
      if (e.status === 429) {
        throw new Error(
          "⚠️ Too many requests. Please wait a moment before asking another question."
        );
      }
      if (e.status >= 500) {
        throw new Error(
          "⚠️ AI service is temporarily unavailable. Please try again in a few moments."
        );
      }
      if (e.message?.includes("API key")) {
        throw new Error("⚠️ API configuration error. Please contact support.");
      }

      // Error genérico
      throw new Error(
        "⚠️ An error occurred while generating the response. Please try again."
      );
    }
  }

  // --- MAIN CHAT FUNCTION ---
  async chat(userInput: string): Promise<string> {
    // 1. Route
    const detectedTopic = await this.routeTopic(userInput);
    const config = await this.getConfig();
    const masterCatalog = config.masterCatalog || [];

    // 2. Logic: Handle "Sticky" Topics
    if (detectedTopic && detectedTopic !== "null") {
      // Validar que el topic existe en el Master Catalog
      const trackExists = masterCatalog.some(
        (track) => track.id === detectedTopic
      );

      if (trackExists) {
        this.currentTopicId = detectedTopic;
      } else {
        console.warn(`Topic ${detectedTopic} not found in Master Catalog`);
      }
    }

    // 3. Generate Answer
    const responseText = await this.generateTutorResponse(userInput);

    // 4. Update History
    this.chatHistory.push({ role: "user", parts: [{ text: userInput }] });
    this.chatHistory.push({ role: "model", parts: [{ text: responseText }] });

    return responseText;
  }

  // Helper methods for session management
  getHistory(): ChatMessage[] {
    return this.chatHistory;
  }

  restoreHistory(
    messages: Array<{ role: "user" | "model"; content: string }>
  ): void {
    this.chatHistory = messages.map((msg) => ({
      role: msg.role,
      parts: [{ text: msg.content }]
    }));
  }

  getCurrentTopic(): string | null {
    return this.currentTopicId;
  }

  async getCurrentTopicData(): Promise<AlmanacTopicData | null> {
    if (!this.currentTopicId) return null;

    // Detectar si es un curriculum ID o un lesson ID
    const isCurriculumId = !this.currentTopicId.startsWith("lesson_");

    return isCurriculumId
      ? await getTopicByCurriculumId(this.currentTopicId)
      : await getTopicById(this.currentTopicId);
  }

  // Método para refrescar los topics (útil si se agregan nuevos durante la sesión)
  async refreshTopics(): Promise<void> {
    this.availableTopics = await getAvailableTopics();
  }
}
