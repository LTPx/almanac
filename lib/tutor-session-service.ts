import prisma from "./prisma";

export interface TutorMessage {
  role: "user" | "model";
  content: string;
  timestamp: Date;
}

export interface SessionMetrics {
  messageCount: number;
  userMessages: number;
  tutorMessages: number;
}

/**
 * Crea una nueva sesión de tutor
 */
export async function createTutorSession(
  userId: string,
  lessonId: number
): Promise<string> {
  const session = await prisma.tutorSession.create({
    data: {
      userId,
      lessonId,
      messages: [],
      messageCount: 0,
      userMessages: 0,
      tutorMessages: 0
    }
  });

  return session.id;
}

/**
 * Agrega un mensaje a una sesión existente
 */
export async function addMessageToSession(
  sessionId: string,
  message: TutorMessage
): Promise<void> {
  const session = await prisma.tutorSession.findUnique({
    where: { id: sessionId }
  });

  if (!session) {
    throw new Error("Session not found");
  }

  const messages = session.messages as unknown as TutorMessage[];
  messages.push(message);

  await prisma.tutorSession.update({
    where: { id: sessionId },
    data: {
      messages: messages as any,
      messageCount: { increment: 1 },
      userMessages: message.role === "user" ? { increment: 1 } : undefined,
      tutorMessages: message.role === "model" ? { increment: 1 } : undefined,
      lastActive: new Date()
    }
  });
}

/**
 * Finaliza una sesión de tutor
 */
export async function endTutorSession(
  sessionId: string,
  wasHelpful?: boolean
): Promise<void> {
  await prisma.tutorSession.update({
    where: { id: sessionId },
    data: {
      endedAt: new Date(),
      wasHelpful
    }
  });
}

/**
 * Obtiene una sesión activa del usuario para una lección específica
 * Si no existe, crea una nueva
 */
export async function getOrCreateSession(
  userId: string,
  lessonId: number
): Promise<string> {
  // Buscar sesión activa (sin endedAt) del usuario para esta lección
  const activeSession = await prisma.tutorSession.findFirst({
    where: {
      userId,
      lessonId,
      endedAt: null
    },
    orderBy: {
      lastActive: "desc"
    }
  });

  if (activeSession) {
    return activeSession.id;
  }

  // Si no existe, crear nueva sesión
  return await createTutorSession(userId, lessonId);
}

/**
 * Obtiene el historial de mensajes de una sesión
 */
export async function getSessionMessages(
  sessionId: string
): Promise<TutorMessage[]> {
  const session = await prisma.tutorSession.findUnique({
    where: { id: sessionId },
    select: { messages: true }
  });

  if (!session) {
    return [];
  }

  return session.messages as unknown as TutorMessage[];
}

/**
 * Obtiene todas las sesiones de un usuario
 */
export async function getUserSessions(userId: string) {
  return await prisma.tutorSession.findMany({
    where: { userId },
    include: {
      lesson: {
        include: {
          unit: {
            include: {
              curriculum: true
            }
          }
        }
      }
    },
    orderBy: {
      lastActive: "desc"
    }
  });
}

/**
 * Obtiene sesiones de un usuario para una lección específica
 */
export async function getUserSessionsByLesson(
  userId: string,
  lessonId: number
) {
  return await prisma.tutorSession.findMany({
    where: {
      userId,
      lessonId
    },
    orderBy: {
      startedAt: "desc"
    }
  });
}

/**
 * Obtiene la sesión activa de un usuario (si existe)
 * Una sesión está activa si endedAt es null
 */
export async function getActiveSession(userId: string) {
  return await prisma.tutorSession.findFirst({
    where: {
      userId,
      endedAt: null
    },
    orderBy: {
      lastActive: "desc"
    }
  });
}

/**
 * Obtiene estadísticas de uso del tutor para un usuario
 */
export async function getUserTutorStats(userId: string) {
  const sessions = await prisma.tutorSession.findMany({
    where: { userId },
    select: {
      messageCount: true,
      userMessages: true,
      tutorMessages: true,
      wasHelpful: true,
      lessonId: true
    }
  });

  const totalSessions = sessions.length;
  const totalMessages = sessions.reduce((sum, s) => sum + s.messageCount, 0);
  const uniqueLessons = new Set(sessions.map((s) => s.lessonId)).size;
  const helpfulSessions = sessions.filter((s) => s.wasHelpful === true).length;
  const unhelpfulSessions = sessions.filter(
    (s) => s.wasHelpful === false
  ).length;
  const unratedSessions = sessions.filter((s) => s.wasHelpful === null).length;

  return {
    totalSessions,
    totalMessages,
    uniqueLessons,
    helpfulSessions,
    unhelpfulSessions,
    unratedSessions,
    helpfulnessRate:
      helpfulSessions + unhelpfulSessions > 0
        ? (helpfulSessions / (helpfulSessions + unhelpfulSessions)) * 100
        : null
  };
}

/**
 * Obtiene las lecciones más consultadas en el tutor
 */
export async function getPopularLessons(limit: number = 10) {
  const lessons = await prisma.tutorSession.groupBy({
    by: ["lessonId"],
    _count: {
      id: true
    },
    orderBy: {
      _count: {
        id: "desc"
      }
    },
    take: limit
  });

  // Obtener detalles de las lecciones
  const lessonDetails = await prisma.lesson.findMany({
    where: {
      id: {
        in: lessons.map((l) => l.lessonId)
      }
    },
    include: {
      unit: {
        include: {
          curriculum: true
        }
      }
    }
  });

  return lessons.map((l) => {
    const lesson = lessonDetails.find((ld) => ld.id === l.lessonId);
    return {
      lessonId: l.lessonId,
      sessionCount: l._count.id,
      lesson: lesson
        ? {
            name: lesson.name,
            unitName: lesson.unit.name,
            curriculumTitle: lesson.unit.curriculum?.title
          }
        : null
    };
  });
}

/**
 * Limpia sesiones antiguas (opcional, para mantenimiento)
 */
export async function cleanOldSessions(daysOld: number = 90) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  const result = await prisma.tutorSession.deleteMany({
    where: {
      lastActive: {
        lt: cutoffDate
      }
    }
  });

  return result.count;
}

/**
 * Obtiene el número de preguntas en una sesión específica
 */
export async function getSessionQuestionCount(sessionId: string): Promise<number> {
  const session = await prisma.tutorSession.findUnique({
    where: { id: sessionId },
    select: { userMessages: true }
  });

  return session?.userMessages || 0;
}
