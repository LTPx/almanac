import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

import { getLessonById } from "@/lib/queries";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ lessonId: string }> }
) {
  const { lessonId } = await context.params;

  try {
    const id = parseInt(lessonId);
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid lesson ID" }, { status: 400 });
    }
    console.log("id lesson: ", id);
    const lessons = await getLessonById(id);
    return NextResponse.json(lessons);
  } catch (error) {
    console.error("Error fetching lessons:", error);
    return NextResponse.json(
      { error: "Failed to fetch lessons" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ lessonId: string }> }
) {
  const { lessonId } = await context.params;

  try {
    const id = parseInt(lessonId);

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid lesson ID" }, { status: 400 });
    }
    const body = await request.json();

    const { name, description, position, isActive, unitId, translations } =
      body;

    const existingLesson = await prisma.lesson.findUnique({
      where: { id }
    });

    if (!existingLesson) {
      return NextResponse.json({ error: "Lesson no found" }, { status: 404 });
    }

    // Usar transacción para actualizar lesson y traducciones
    const lesson = await prisma.$transaction(async (tx) => {
      // Actualizar la lección
      await tx.lesson.update({
        where: { id },
        data: {
          // Si se proporcionan traducciones, usar EN como nombre principal
          ...(translations?.EN?.name
            ? { name: translations.EN.name }
            : name && { name }),
          ...(translations?.EN?.description !== undefined
            ? { description: translations.EN.description }
            : description !== undefined && { description }),
          ...(position !== undefined && { position }),
          ...(unitId !== undefined && { unitId: parseInt(unitId) }),
          ...(isActive !== undefined && { isActive }),
          updatedAt: new Date()
        }
      });

      // Actualizar traducciones si se proporcionan
      if (translations) {
        // Actualizar o crear traducción EN
        if (translations.EN) {
          await tx.lessonTranslation.upsert({
            where: {
              lessonId_language: {
                lessonId: id,
                language: "EN"
              }
            },
            update: {
              name: translations.EN.name,
              description: translations.EN.description || null
            },
            create: {
              lessonId: id,
              language: "EN",
              name: translations.EN.name,
              description: translations.EN.description || null
            }
          });
        }

        // Actualizar o crear traducción ES
        if (translations.ES) {
          await tx.lessonTranslation.upsert({
            where: {
              lessonId_language: {
                lessonId: id,
                language: "ES"
              }
            },
            update: {
              name: translations.ES.name,
              description: translations.ES.description || null
            },
            create: {
              lessonId: id,
              language: "ES",
              name: translations.ES.name,
              description: translations.ES.description || null
            }
          });
        }
      }

      // Obtener lesson actualizada con traducciones
      return await tx.lesson.findUnique({
        where: { id },
        include: {
          translations: true
        }
      });
    });

    return NextResponse.json(lesson);
  } catch (error) {
    console.error("Error al actualizar lesson:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ lessonId: string }> }
) {
  const { lessonId } = await context.params;
  const id = parseInt(lessonId);

  try {
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid lesson ID" }, { status: 400 });
    }

    await prisma.lesson.update({
      where: { id },
      data: {
        isActive: false,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      message: `Lesson eliminada correctamente`
    });
  } catch (error) {
    console.error("Error deleting unit:", error);
    return NextResponse.json(
      { error: "Failed to delete unit" },
      { status: 500 }
    );
  }
}
