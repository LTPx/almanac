import prisma from "./prisma";

export interface TutorConfigData {
  routerInstructions: string;
  tutorInstructions: string;
  updatedAt: Date;
}

const DEFAULT_ROUTER_INSTRUCTIONS = `You are the Intent Router for an educational app called Almanac.

TASK:
Analyze the conversation history and latest input.
Determine which topic from the list below the user is asking about.

RULES:
- If user asks about a new topic, return that topic_id (e.g., "lesson_1").
- If user asks a follow-up question (e.g., "Give an example", "Why?"), maintain the current topic.
- If input is off-topic or unclear, return "null".
- Match topics by keywords, subject matter, or explicit mentions.`;

const DEFAULT_TUTOR_INSTRUCTIONS = `You are a Socratic Tutor for the Almanac educational platform.

CONSTRAINTS:
1. Answer using ONLY the Source Material below.
2. If asked about outside topics, politely refuse and redirect to the current topic.
3. Use the Socratic method: Be brief, ask guiding questions, and help students discover answers.
4. Reference the facts provided, especially CORE FACTS (🔑).
5. Keep responses concise (2-4 sentences max).`;

/**
 * Obtiene la configuración del tutor
 * Crea la configuración por defecto si no existe
 */
export async function getTutorConfig(): Promise<TutorConfigData> {
  let config = await prisma.tutorConfig.findUnique({
    where: { id: "default" }
  });

  // Si no existe, crear con valores por defecto
  if (!config) {
    config = await prisma.tutorConfig.create({
      data: {
        id: "default",
        routerInstructions: DEFAULT_ROUTER_INSTRUCTIONS,
        tutorInstructions: DEFAULT_TUTOR_INSTRUCTIONS
      }
    });
  }

  return {
    routerInstructions: config.routerInstructions,
    tutorInstructions: config.tutorInstructions,
    updatedAt: config.updatedAt
  };
}

/**
 * Actualiza la configuración del tutor
 */
export async function updateTutorConfig(data: {
  routerInstructions?: string;
  tutorInstructions?: string;
}): Promise<TutorConfigData> {
  const config = await prisma.tutorConfig.upsert({
    where: { id: "default" },
    update: data,
    create: {
      id: "default",
      routerInstructions:
        data.routerInstructions ?? DEFAULT_ROUTER_INSTRUCTIONS,
      tutorInstructions: data.tutorInstructions ?? DEFAULT_TUTOR_INSTRUCTIONS
    }
  });

  return {
    routerInstructions: config.routerInstructions,
    tutorInstructions: config.tutorInstructions,
    updatedAt: config.updatedAt
  };
}

/**
 * Restaura la configuración a los valores por defecto
 */
export async function resetTutorConfig(): Promise<TutorConfigData> {
  return await updateTutorConfig({
    routerInstructions: DEFAULT_ROUTER_INSTRUCTIONS,
    tutorInstructions: DEFAULT_TUTOR_INSTRUCTIONS
  });
}
