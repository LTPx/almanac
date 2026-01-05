import { NextRequest, NextResponse } from "next/server";
import { AlmanacAgent } from "@/lib/almanac-agent";
import {
  getOrCreateSession,
  addMessageToSession,
  endTutorSession,
  getActiveSession,
  getSessionMessages,
  getSessionQuestionCount
} from "@/lib/tutor-session-service";
import { getUserContext } from "@/lib/user-context-service";
import prisma from "@/lib/prisma";

// In-memory storage for agents (maintains conversation state)
// En producción, deberías usar Redis para el estado de los agentes
const agents = new Map<string, AlmanacAgent>();

// GET: Cargar sesión activa del usuario y límite de preguntas
export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    // Obtener usuario y su estado de suscripción
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { subscriptionStatus: true }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Calcular límite según plan
    const isPremium =
      user.subscriptionStatus === "ACTIVE" ||
      user.subscriptionStatus === "TRIALING";
    const limit = isPremium ? 25 : 10;

    // Buscar sesión activa en la base de datos
    const activeSession = await getActiveSession(userId);

    if (!activeSession) {
      return NextResponse.json({
        session: null,
        messages: [],
        questionLimit: {
          limit,
          used: 0,
          remaining: limit,
          isPremium
        }
      });
    }

    // Obtener mensajes y contar preguntas de la sesión actual
    const messages = await getSessionMessages(activeSession.id);
    const questionCount = await getSessionQuestionCount(activeSession.id);
    const remaining = Math.max(0, limit - questionCount);

    return NextResponse.json({
      session: {
        id: activeSession.id,
        lessonId: activeSession.lessonId,
        startedAt: activeSession.startedAt,
        lastActive: activeSession.lastActive
      },
      messages: messages.map((msg) => ({
        role: msg.role,
        content: msg.content
      })),
      questionLimit: {
        limit,
        used: questionCount,
        remaining,
        isPremium
      }
    });
  } catch (error) {
    console.error("Error loading active session:", error);
    return NextResponse.json(
      { error: "Failed to load session" },
      { status: 500 }
    );
  }
}

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

    // Verificar límite de preguntas según plan del usuario
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { subscriptionStatus: true }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const isPremium =
      user.subscriptionStatus === "ACTIVE" ||
      user.subscriptionStatus === "TRIALING";
    const limit = isPremium ? 25 : 10;

    // Verificar límite de la sesión activa (si existe)
    const activeSession = await getActiveSession(userId);
    if (activeSession) {
      const sessionQuestionCount = await getSessionQuestionCount(
        activeSession.id
      );

      if (sessionQuestionCount >= limit) {
        const errorMessage = isPremium
          ? `Has alcanzado el límite de 25 preguntas por sesión de tu plan Premium. Inicia un nuevo chat para continuar.`
          : `Has alcanzado el límite de 10 preguntas por sesión del plan gratuito. Actualiza a Premium para obtener 25 preguntas por sesión o inicia un nuevo chat.`;

        return NextResponse.json(
          {
            error: errorMessage,
            limitReached: true,
            limit,
            count: sessionQuestionCount
          },
          { status: 429 }
        );
      }
    }

    // Crear o recuperar el agente del usuario
    if (!agents.has(userId)) {
      // Obtener contexto del usuario para personalización
      const userContext = await getUserContext(userId);
      const newAgent = new AlmanacAgent(apiKey, userContext);

      // Intentar restaurar historial desde sesión activa
      const activeSession = await getActiveSession(userId);
      if (activeSession) {
        const messages = await getSessionMessages(activeSession.id);
        if (messages.length > 0) {
          newAgent.restoreHistory(messages);
        }
      }

      agents.set(userId, newAgent);
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

          // Guardar mensaje del usuario
          await addMessageToSession(sessionId, {
            role: "user",
            content: message,
            timestamp: new Date()
          });

          // Guardar respuesta del tutor
          await addMessageToSession(sessionId, {
            role: "model",
            content: response,
            timestamp: new Date()
          });
        }
      } catch (trackingError) {
        // No fallar la request si el tracking falla
        console.error("Error saving conversation to DB:", trackingError);
      }
    }

    // Obtener sessionId de la sesión activa
    const currentSession = await getActiveSession(userId);

    return NextResponse.json({
      response,
      currentTopic: agent.getCurrentTopic(),
      currentTopicData: currentTopicData
        ? {
            title: currentTopicData.title,
            unitName: currentTopicData.unitName,
            curriculumTitle: currentTopicData.curriculumTitle
          }
        : null,
      sessionId: currentSession?.id
    });
  } catch (error: any) {
    console.error("Error in almanac chat:", error);

    // Si el error viene del agent (Gemini API), devolver el mensaje específico
    if (error.message) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status || 500 }
      );
    }

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

    // Buscar sesión activa en la base de datos
    const activeSession = await getActiveSession(userId);
    if (activeSession) {
      try {
        await endTutorSession(activeSession.id, wasHelpful);
        console.log(
          `Session ${activeSession.id} ended with feedback: ${wasHelpful}`
        );
      } catch (dbError) {
        console.error("Error ending session in DB:", dbError);
      }
    }

    // Limpiar agente en memoria
    if (agents.has(userId)) {
      agents.delete(userId);
    }

    return NextResponse.json({
      message: activeSession
        ? "Session cleared and ended"
        : "No active session found",
      sessionId: activeSession?.id,
      feedbackSaved: activeSession ? true : false
    });
  } catch (error) {
    console.error("Error deleting session:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
