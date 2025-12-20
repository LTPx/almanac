import { NextRequest, NextResponse } from "next/server";
import { AlmanacAgent } from "@/lib/almanac-agent";

// In-memory storage for agents (Simulating a session store)
// En producción, deberías usar Redis, base de datos, o algún sistema de sesiones
const agents = new Map<string, AlmanacAgent>();

export async function POST(req: NextRequest) {
  try {
    const { userId, message } = await req.json();

    // Validación
    if (!userId || !message) {
      return NextResponse.json(
        { error: "userId and message are required" },
        { status: 400 }
      );
    }

    // Verificar que existe la API key
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY not configured" },
        { status: 500 }
      );
    }

    // Crear o recuperar el agente del usuario
    if (!agents.has(userId)) {
      agents.set(userId, new AlmanacAgent(apiKey));
    }

    const agent = agents.get(userId)!;

    // Procesar el mensaje
    const response = await agent.chat(message);
    const currentTopicData = await agent.getCurrentTopicData();

    return NextResponse.json({
      response,
      currentTopic: agent.getCurrentTopic(),
      currentTopicData: currentTopicData
        ? {
            title: currentTopicData.title,
            unitName: currentTopicData.unitName,
            curriculumTitle: currentTopicData.curriculumTitle,
          }
        : null,
    });
  } catch (error) {
    console.error("Error in almanac chat:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

// Endpoint opcional para limpiar la sesión de un usuario
export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    if (agents.has(userId)) {
      agents.delete(userId);
      return NextResponse.json({ message: "Session cleared" });
    }

    return NextResponse.json({ message: "No session found" });
  } catch (error) {
    console.error("Error deleting session:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
