import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ curriculumId: string }> }
) {
  try {
    const { curriculumId } = await context.params;
    const unitPositions = await prisma.unit.findMany({
      where: {
        curriculumId: curriculumId,
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

    const positions = unitPositions.map((unit) => ({
      unitId: unit.id,
      position: unit.position
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
