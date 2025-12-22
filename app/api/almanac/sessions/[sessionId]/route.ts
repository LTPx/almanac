import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/almanac/sessions/{sessionId}
// Obtiene los detalles completos de una sesión incluyendo mensajes
export async function GET(
  req: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = params;

    // Obtener sesión completa
    const session = await prisma.tutorSession.findUnique({
      where: { id: sessionId },
      include: {
        lesson: {
          include: {
            unit: {
              include: {
                curriculum: true
              }
            }
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Formatear respuesta
    const response = {
      id: session.id,
      user: session.user,
      lesson: {
        id: session.lessonId,
        name: session.lesson.name,
        unitName: session.lesson.unit.name,
        curriculumTitle: session.lesson.unit.curriculum?.title
      },
      messages: session.messages,
      messageCount: session.messageCount,
      userMessages: session.userMessages,
      tutorMessages: session.tutorMessages,
      startedAt: session.startedAt,
      lastActive: session.lastActive,
      endedAt: session.endedAt,
      wasHelpful: session.wasHelpful,
      isActive: session.endedAt === null
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching session:", error);
    return NextResponse.json(
      { error: "Failed to fetch session" },
      { status: 500 }
    );
  }
}
