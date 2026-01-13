import prisma from "./prisma";
import { Prisma } from "@prisma/client";

export interface MasterCatalogTrack {
  id: string;
  title: string;
  desc: string;
}

export interface TutorConfigData {
  routerInstructions: string;
  tutorInstructions: string;
  masterCatalog: MasterCatalogTrack[];
  routerModel: string;
  routerTemperature: number;
  updatedAt: Date;
}

const DEFAULT_MASTER_CATALOG: MasterCatalogTrack[] = [];

const DEFAULT_ROUTER_INSTRUCTIONS = `You are the Intent Router for the Almanac educational app.

TASK:
Analyze the user's latest input and conversation history to route them to the correct Course ID.

ROUTING RULES:
1. EXACT MATCH: If the user asks about a specific concept (e.g., "Spanish Constitution"), route to the most specific course ("ccse_spain") rather than a general one ("track_6_history").
2. CONTEXT STICKINESS: If the user asks a follow-up question (e.g., "Give me an example", "Why is that?", "Next unit"), return the "CURRENT_TOPIC_ID" provided in the STATE block.
3. OFF-TOPIC: If the input is unrelated to any course (e.g., sports scores, video games), return "null".
4. DISAMBIGUATION:
   - "Biology" -> track_3_biology
   - "Neuroscience/Brain" -> know_your_brain
   - "Civics/Laws" (General) -> track_6_history
   - "Spanish Laws/Citizenship" -> ccse_spain
   - "Finance/Investing" (Personal) -> personal_finance_v2
   - "Banking Regs/Certification" -> efp_finance`;

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
        tutorInstructions: DEFAULT_TUTOR_INSTRUCTIONS,
        masterCatalog:
          DEFAULT_MASTER_CATALOG as unknown as Prisma.InputJsonValue,
        routerModel: "gemini-2.5-flash",
        routerTemperature: 0.1
      }
    });
  }

  return {
    routerInstructions: config.routerInstructions,
    tutorInstructions: config.tutorInstructions,
    masterCatalog: config.masterCatalog as unknown as MasterCatalogTrack[],
    routerModel: config.routerModel,
    routerTemperature: config.routerTemperature,
    updatedAt: config.updatedAt
  };
}

/**
 * Actualiza la configuración del tutor
 */
export async function updateTutorConfig(data: {
  routerInstructions?: string;
  tutorInstructions?: string;
  masterCatalog?: MasterCatalogTrack[];
  routerModel?: string;
  routerTemperature?: number;
}): Promise<TutorConfigData> {
  const updateData: Prisma.TutorConfigUpdateInput = {
    ...(data.routerInstructions !== undefined && {
      routerInstructions: data.routerInstructions
    }),
    ...(data.tutorInstructions !== undefined && {
      tutorInstructions: data.tutorInstructions
    }),
    ...(data.masterCatalog !== undefined && {
      masterCatalog: data.masterCatalog as unknown as Prisma.InputJsonValue
    }),
    ...(data.routerModel !== undefined && { routerModel: data.routerModel }),
    ...(data.routerTemperature !== undefined && {
      routerTemperature: data.routerTemperature
    })
  };

  const config = await prisma.tutorConfig.upsert({
    where: { id: "default" },
    update: updateData,
    create: {
      id: "default",
      routerInstructions:
        data.routerInstructions ?? DEFAULT_ROUTER_INSTRUCTIONS,
      tutorInstructions: data.tutorInstructions ?? DEFAULT_TUTOR_INSTRUCTIONS,
      masterCatalog: (data.masterCatalog ??
        DEFAULT_MASTER_CATALOG) as unknown as Prisma.InputJsonValue,
      routerModel: data.routerModel ?? "gemini-2.5-flash",
      routerTemperature: data.routerTemperature ?? 0.1
    }
  });

  return {
    routerInstructions: config.routerInstructions,
    tutorInstructions: config.tutorInstructions,
    masterCatalog: config.masterCatalog as unknown as MasterCatalogTrack[],
    routerModel: config.routerModel,
    routerTemperature: config.routerTemperature,
    updatedAt: config.updatedAt
  };
}

/**
 * Restaura la configuración a los valores por defecto
 */
export async function resetTutorConfig(): Promise<TutorConfigData> {
  return await updateTutorConfig({
    routerInstructions: DEFAULT_ROUTER_INSTRUCTIONS,
    tutorInstructions: DEFAULT_TUTOR_INSTRUCTIONS,
    masterCatalog: DEFAULT_MASTER_CATALOG,
    routerModel: "gemini-2.5-flash",
    routerTemperature: 0.1
  });
}
