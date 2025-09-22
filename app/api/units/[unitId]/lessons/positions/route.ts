import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { unitId: string } }
) {
  try {
    const unitId = parseInt(params.unitId);

    if (isNaN(unitId)) {
      return NextResponse.json(
        { error: "ID de unidad inválido" },
        { status: 400 }
      );
    }

    const lessonPositions = await prisma.lesson.findMany({
      where: {
        unitId: unitId,
        position: {
          not: null
        }
      },
      select: {
        id: true,
        position: true
      },
      orderBy: {
        position: "asc"
      }
    });

    const positions = lessonPositions.map((lesson) => ({
      lessonId: lesson.id,
      position: lesson.position
    }));

    return NextResponse.json(positions);
  } catch (error) {
    console.error("Error al obtener posiciones:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
