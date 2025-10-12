import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ curriculumId: string }> }
) {
  const { curriculumId } = await context.params;

  try {
    const body = await request.json();
    const unitIds: string[] = body.unitIds || body.units;

    // 🔹 Verificar curriculum
    const existingCurriculum = await prisma.curriculum.findUnique({
      where: { id: curriculumId },
      select: { id: true }
    });

    if (!existingCurriculum) {
      return NextResponse.json(
        { error: "Curriculum no encontrado" },
        { status: 404 }
      );
    }

    // 🔹 Validar unidades si se envían
    if (unitIds && Array.isArray(unitIds)) {
      const units = unitIds.map((id) => parseInt(id, 10));
      const existingUnits = await prisma.unit.findMany({
        where: { id: { in: units } },
        select: { id: true }
      });

      if (existingUnits.length !== unitIds.length) {
        return NextResponse.json(
          { error: "Algunas unidades seleccionadas no existen" },
          { status: 400 }
        );
      }

      // 🔹 Actualizar relaciones
      await prisma.curriculum.update({
        where: { id: curriculumId },
        data: { units: { set: [] } } // Paso 1: limpiar
      });

      const updatedCurriculum = await prisma.curriculum.update({
        where: { id: curriculumId },
        data: {
          units: {
            connect: unitIds.map((id: string) => ({ id: parseInt(id, 10) }))
          }
        },
        include: {
          units: { orderBy: { order: "asc" } }
        }
      });

      return NextResponse.json({
        message: "Curriculum actualizado exitosamente",
        curriculum: updatedCurriculum
      });
    }

    return NextResponse.json(
      { message: "No se enviaron unidades para actualizar" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error al actualizar curriculum:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
