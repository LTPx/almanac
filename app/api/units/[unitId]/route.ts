import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ unitId: string }> }
) {
  const { unitId } = await context.params;

  try {
    const id = parseInt(unitId);

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid unit ID" }, { status: 400 });
    }

    const unit = await prisma.unit.findUnique({
      where: {
        id: id
        // isActive: true
      },
      include: {
        lessons: {
          where: {
            isActive: true
          },
          orderBy: { position: "asc" }
        },
        translations: true, // Incluir traducciones
        _count: {
          select: {
            lessons: true
          }
        }
      }
    });

    if (!unit) {
      return NextResponse.json({ error: "Unit not found" }, { status: 404 });
    }

    return NextResponse.json(unit);
  } catch (error) {
    console.error("Error fetching unit:", error);
    return NextResponse.json(
      { error: "Failed to fetch unit" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ unitId: string }> }
) {
  const { unitId } = await context.params;

  try {
    const id = parseInt(unitId);
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid unit ID" }, { status: 400 });
    }

    const body = await request.json();
    const {
      name,
      description,
      order,
      isActive,
      position,
      experiencePoints,
      mandatory,
      translations
    } = body;

    // Usar transacción para actualizar unit y traducciones
    const unit = await prisma.$transaction(async (tx) => {
      // Actualizar la unidad
      const updatedUnit = await tx.unit.update({
        where: { id },
        data: {
          // Si se proporcionan traducciones, usar EN como nombre principal
          ...(translations?.EN?.name
            ? { name: translations.EN.name }
            : name && { name }),
          ...(translations?.EN?.description !== undefined
            ? { description: translations.EN.description }
            : description !== undefined && { description }),
          ...(order !== undefined && { order }),
          ...(isActive !== undefined && { isActive }),
          ...(position !== undefined && { position }),
          ...(experiencePoints !== undefined && { experiencePoints }),
          ...(mandatory !== undefined && { mandatory }),
          updatedAt: new Date()
        }
      });

      // Actualizar traducciones si se proporcionan
      if (translations) {
        // Actualizar o crear traducción EN
        if (translations.EN) {
          await tx.unitTranslation.upsert({
            where: {
              unitId_language: {
                unitId: id,
                language: "EN"
              }
            },
            update: {
              name: translations.EN.name,
              description: translations.EN.description || null
            },
            create: {
              unitId: id,
              language: "EN",
              name: translations.EN.name,
              description: translations.EN.description || null
            }
          });
        }

        // Actualizar o crear traducción ES
        if (translations.ES) {
          await tx.unitTranslation.upsert({
            where: {
              unitId_language: {
                unitId: id,
                language: "ES"
              }
            },
            update: {
              name: translations.ES.name,
              description: translations.ES.description || null
            },
            create: {
              unitId: id,
              language: "ES",
              name: translations.ES.name,
              description: translations.ES.description || null
            }
          });
        }
      }

      // Obtener unidad actualizada con traducciones
      return await tx.unit.findUnique({
        where: { id },
        include: {
          translations: true,
          _count: {
            select: {
              questions: true,
              lessons: true
            }
          }
        }
      });
    });

    return NextResponse.json(unit);
  } catch (error) {
    console.error("Error updating unit:", error);
    return NextResponse.json(
      { error: "Failed to update unit" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ unitId: string }> }
) {
  const { unitId } = await context.params;
  const id = parseInt(unitId);

  try {
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid unit ID" }, { status: 400 });
    }

    const { removeLessons } = await request
      .json()
      .catch(() => ({ removeLessons: false }));

    // Marcar la unidad como inactiva (soft delete)
    await prisma.unit.delete({
      where: { id }
    });

    // Si el usuario eligió eliminar las lecciones también
    if (removeLessons) {
      await prisma.lesson.updateMany({
        where: { unitId: id },
        data: {
          isActive: false,
          updatedAt: new Date()
        }
      });
    }

    return NextResponse.json({
      message: `Unidad eliminada correctamente${
        removeLessons ? " y lecciones desactivadas" : ""
      }`
    });
  } catch (error) {
    console.error("Error deleting unit:", error);
    return NextResponse.json(
      { error: "Failed to delete unit" },
      { status: 500 }
    );
  }
}
