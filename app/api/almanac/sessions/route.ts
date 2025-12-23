import { NextRequest, NextResponse } from "next/server";
import {
  getUserSessions,
  getUserTutorStats,
  getPopularLessons,
} from "@/lib/tutor-session-service";

// GET /api/almanac/sessions?userId={userId}
// Obtiene todas las sesiones de un usuario
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const statsOnly = searchParams.get("stats") === "true";
    const popular = searchParams.get("popular") === "true";

    // Endpoint para lecciones populares
    if (popular) {
      const limit = parseInt(searchParams.get("limit") || "10");
      const popularLessons = await getPopularLessons(limit);

      return NextResponse.json({
        popularLessons,
      });
    }

    // Validación de userId
    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    // Si solo quieren stats
    if (statsOnly) {
      const stats = await getUserTutorStats(userId);
      return NextResponse.json({ stats });
    }

    // Obtener todas las sesiones
    const sessions = await getUserSessions(userId);

    // Formatear las sesiones para la respuesta
    const formattedSessions = sessions.map((session) => ({
      id: session.id,
      lesson: {
        id: session.lessonId,
        name: session.lesson.name,
        unitName: session.lesson.unit.name,
        curriculumTitle: session.lesson.unit.curriculum?.title,
      },
      messageCount: session.messageCount,
      userMessages: session.userMessages,
      tutorMessages: session.tutorMessages,
      startedAt: session.startedAt,
      lastActive: session.lastActive,
      endedAt: session.endedAt,
      wasHelpful: session.wasHelpful,
      isActive: session.endedAt === null,
    }));

    return NextResponse.json({
      sessions: formattedSessions,
      total: formattedSessions.length,
    });
  } catch (error) {
    console.error("Error fetching sessions:", error);
    return NextResponse.json(
      { error: "Failed to fetch sessions" },
      { status: 500 }
    );
  }
}
