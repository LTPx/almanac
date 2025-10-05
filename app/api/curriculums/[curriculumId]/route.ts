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
          orderBy: { order: "asc" },
          include: {
            lessons: {
              where: { isActive: true },
              orderBy: { position: "asc" },
              select: {
                id: true,
                name: true,
                experiencePoints: true,
                mandatory: true
              }
            },
            _count: {
              select: { lessons: true }
            }
          }
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

    return NextResponse.json({ curriculum });
  } catch (error) {
    console.error("Error al obtener curriculum:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
