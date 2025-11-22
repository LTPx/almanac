import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ curriculumId: string }> }
) {
  try {
    const { curriculumId } = await context.params;
    const curriculum = await prisma.curriculum.findUnique({
      where: { id: curriculumId }
    });

    if (!curriculum) {
      return NextResponse.json(
        { error: "Curriculum no encontrado" },
        { status: 404 }
      );
    }

    const updated = await prisma.curriculum.update({
      where: { id: curriculumId },
      data: { isActive: !curriculum.isActive }
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error("Error al actualizar el curriculum:", error);
    return NextResponse.json(
      { error: "Error interno al actualizar el curriculum" },
      { status: 500 }
    );
  }
}
