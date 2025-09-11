import { NextRequest, NextResponse } from "next/server";
import { getLessonsByUnitId } from "@/lib/queries";
import prisma from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ unitId: string }> }
) {
  const { unitId } = await context.params;

  try {
    const id = parseInt(unitId);
    const lessonsOrder = await request.json();

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid unit ID" }, { status: 400 });
    }

    if (!Array.isArray(lessonsOrder)) {
      return NextResponse.json(
        { ok: false, error: "Invalid data" },
        { status: 400 }
      );
    }

    // Obtener todas las lessons de la unidad
    const lessons = await getLessonsByUnitId(id);

    // Crear un map para acceso rápido
    const orderMap = new Map<number, number>(); // lessonId -> position
    for (const { lessonId, position } of lessonsOrder) {
      orderMap.set(lessonId, position);
    }

    // Actualizar cada lesson
    const updates = await Promise.all(
      lessons.map((lesson) =>
        prisma.lesson.update({
          where: { id: lesson.id },
          data: {
            position: orderMap.has(lesson.id) ? orderMap.get(lesson.id) : null // si no está en lessonsOrder, position = null
          }
        })
      )
    );

    return NextResponse.json({ ok: true, lessons: updates });
  } catch (error) {
    console.error("Error saving lessons:", error);
    return NextResponse.json(
      { error: "Failed to save lessons" },
      { status: 500 }
    );
  }
}
