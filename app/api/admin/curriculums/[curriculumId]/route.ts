import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ curriculumId: string }> }
) {
  try {
    const { curriculumId } = await context.params;
    const curriculum = await prisma.curriculum.findUnique({
      where: { id: curriculumId },
      include: {
        units: {
          orderBy: { order: "asc" }
        },
        translations: true, // Incluir traducciones
        _count: {
          select: { units: true }
        }
      }
    });

    if (!curriculum) {
      return NextResponse.json(
        { error: "Curriculum no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(curriculum);
  } catch (error) {
    console.error("Error al obtener curriculum:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ curriculumId: string }> }
) {
  const { curriculumId } = await context.params;
  try {
    const body = await request.json();
    const {
      title,
      audienceAgeRange,
      difficulty,
      unitIds,
      metadata,
      translations
    } = body;

    // Verificar que el curriculum existe
    const existingCurriculum = await prisma.curriculum.findUnique({
      where: { id: curriculumId }
    });

    if (!existingCurriculum) {
      return NextResponse.json(
        { error: "Curriculum no encontrado" },
        { status: 404 }
      );
    }

    // Usar transacción para actualizar curriculum y traducciones
    const updatedCurriculum = await prisma.$transaction(async (tx) => {
      // Construir objeto de actualización
      const updateData: any = {};

      // Si se proporcionan traducciones, usar EN como título principal
      if (translations?.EN?.title) {
        updateData.title = translations.EN.title;
      } else if (title !== undefined) {
        updateData.title = title;
      }

      if (audienceAgeRange !== undefined)
        updateData.audienceAgeRange = audienceAgeRange;
      if (difficulty !== undefined) {
        const validDifficulties = ["BEGINNER", "INTERMEDIATE", "ADVANCED"];
        if (!validDifficulties.includes(difficulty)) {
          throw new Error("Dificultad inválida");
        }
        updateData.difficulty = difficulty;
      }
      if (metadata !== undefined) updateData.metadata = metadata;

      // Si se proporcionan unitIds, actualizar las relaciones
      if (unitIds && Array.isArray(unitIds)) {
        // Verificar que todas las unidades existen
        const existingUnits = await tx.unit.findMany({
          where: { id: { in: unitIds } },
          select: { id: true }
        });

        if (existingUnits.length !== unitIds.length) {
          throw new Error("Algunas unidades seleccionadas no existen");
        }

        // Actualizar relaciones de unidades
        updateData.units = {
          set: [], // Primero desconectar todas
          connect: unitIds.map((id: number) => ({ id })) // Luego conectar las nuevas
        };
      }

      // Actualizar el curriculum
      const curriculum = await tx.curriculum.update({
        where: { id: curriculumId },
        data: updateData
      });

      // Actualizar traducciones si se proporcionan
      if (translations) {
        // Actualizar o crear traducción EN
        if (translations.EN?.title) {
          await tx.curriculumTranslation.upsert({
            where: {
              curriculumId_language: {
                curriculumId,
                language: "EN"
              }
            },
            update: {
              title: translations.EN.title
            },
            create: {
              curriculumId,
              language: "EN",
              title: translations.EN.title
            }
          });
        }

        // Actualizar o crear traducción ES
        if (translations.ES?.title) {
          await tx.curriculumTranslation.upsert({
            where: {
              curriculumId_language: {
                curriculumId,
                language: "ES"
              }
            },
            update: {
              title: translations.ES.title
            },
            create: {
              curriculumId,
              language: "ES",
              title: translations.ES.title
            }
          });
        }
      }

      // Obtener curriculum actualizado con traducciones
      return await tx.curriculum.findUnique({
        where: { id: curriculumId },
        include: {
          units: {
            orderBy: { order: "asc" }
          },
          translations: true
        }
      });
    });

    return NextResponse.json({
      message: "Curriculum actualizado exitosamente",
      curriculum: updatedCurriculum
    });
  } catch (error: any) {
    console.error("Error al actualizar curriculum:", error);
    return NextResponse.json(
      { error: error.message || "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ curriculumId: string }> }
) {
  const { curriculumId } = await context.params;

  try {
    await prisma.curriculum.delete({
      where: { id: curriculumId }
    });

    return NextResponse.json({
      message: `Curriculum removed successfully`
    });
  } catch (error) {
    console.error("Error deleting curriculum:", error);
    return NextResponse.json(
      { error: "Failed to delete curriculum" },
      { status: 500 }
    );
  }
}
