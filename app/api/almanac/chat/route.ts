import { NextRequest, NextResponse } from "next/server";
import { AlmanacAgent } from "@/lib/almanac-agent";
import {
  getOrCreateSession,
  addMessageToSession,
  endTutorSession,
} from "@/lib/tutor-session-service";

// In-memory storage for agents (Simulating a session store)
// En producción, deberías usar Redis, base de datos, o algún sistema de sesiones
const agents = new Map<string, AlmanacAgent>();

// Map para asociar userId con sessionId actual
const userSessions = new Map<string, string>();

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

    // Tracking: Guardar en base de datos
    if (currentTopicData) {
      try {
        // Extraer lessonId del topic ID (formato: "lesson_42")
        const lessonId = parseInt(
          agent.getCurrentTopic()?.replace("lesson_", "") || "0"
        );

        if (lessonId > 0) {
          // Obtener o crear sesión
          const sessionId = await getOrCreateSession(userId, lessonId);
          userSessions.set(userId, sessionId);

          // Guardar mensaje del usuario
          await addMessageToSession(sessionId, {
            role: "user",
            content: message,
            timestamp: new Date(),
          });

          // Guardar respuesta del tutor
          await addMessageToSession(sessionId, {
            role: "model",
            content: response,
            timestamp: new Date(),
          });
        }
      } catch (trackingError) {
        // No fallar la request si el tracking falla
        console.error("Error saving conversation to DB:", trackingError);
      }
    }

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
      sessionId: userSessions.get(userId), // Incluir sessionId en la respuesta
    });
  } catch (error) {
    console.error("Error in almanac chat:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

// Endpoint para limpiar la sesión de un usuario y finalizarla en DB
export async function DELETE(req: NextRequest) {
  try {
    const { userId, wasHelpful } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    // Finalizar sesión en DB si existe
    const sessionId = userSessions.get(userId);
    if (sessionId) {
      try {
        await endTutorSession(sessionId, wasHelpful);
        userSessions.delete(userId);
      } catch (dbError) {
        console.error("Error ending session in DB:", dbError);
      }
    }

    // Limpiar agente en memoria
    if (agents.has(userId)) {
      agents.delete(userId);
      return NextResponse.json({
        message: "Session cleared and ended",
        sessionId,
      });
    }

    return NextResponse.json({ message: "No active session found" });
  } catch (error) {
    console.error("Error deleting session:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
