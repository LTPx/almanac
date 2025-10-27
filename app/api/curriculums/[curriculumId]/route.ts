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
          // include: {
          //   lessons: {
          //     where: { isActive: true },
          //     orderBy: { position: "asc" },
          //     select: {
          //       id: true,
          //       name: true
          //     }
          //   },
          //   _count: {
          //     select: { lessons: true }
          //   }
          // }
        },
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
    const { title, audienceAgeRange, difficulty, unitIds, metadata } = body;

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

    // Construir objeto de actualización
    const updateData: any = {};

    if (title !== undefined) updateData.title = title;
    if (audienceAgeRange !== undefined)
      updateData.audienceAgeRange = audienceAgeRange;
    if (difficulty !== undefined) {
      const validDifficulties = ["BEGINNER", "INTERMEDIATE", "ADVANCED"];
      if (!validDifficulties.includes(difficulty)) {
        return NextResponse.json(
          { error: "Dificultad inválida" },
          { status: 400 }
        );
      }
      updateData.difficulty = difficulty;
    }
    if (metadata !== undefined) updateData.metadata = metadata;

    // Si se proporcionan unitIds, actualizar las relaciones
    if (unitIds && Array.isArray(unitIds)) {
      // Verificar que todas las unidades existen
      const existingUnits = await prisma.unit.findMany({
        where: { id: { in: unitIds } },
        select: { id: true }
      });

      if (existingUnits.length !== unitIds.length) {
        return NextResponse.json(
          { error: "Algunas unidades seleccionadas no existen" },
          { status: 400 }
        );
      }

      // Actualizar relaciones de unidades
      updateData.units = {
        set: [], // Primero desconectar todas
        connect: unitIds.map((id: number) => ({ id })) // Luego conectar las nuevas
      };
    }

    // Actualizar el curriculum
    const updatedCurriculum = await prisma.curriculum.update({
      where: { id: curriculumId },
      data: updateData,
      include: {
        units: {
          orderBy: { order: "asc" }
        }
      }
    });

    return NextResponse.json({
      message: "Curriculum actualizado exitosamente",
      curriculum: updatedCurriculum
    });
  } catch (error) {
    console.error("Error al actualizar curriculum:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
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
