import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const curriculumId = searchParams.get("curriculumId");

    if (!userId || !curriculumId) {
      return NextResponse.json(
        { error: "userId y curriculumId son requeridos" },
        { status: 400 }
      );
    }

    const learnedUnits = await prisma.userUnitProgress.findMany({
      where: {
        userId,
        unit: { curriculumId }
      },
      select: {
        unit: {
          select: {
            id: true,
            name: true,
            lessons: {
              where: { isActive: true },
              orderBy: { position: "asc" },
              select: {
                id: true,
                name: true,
                description: true
              }
            }
          }
        }
      }
    });

    const units = learnedUnits.map((p) => p.unit);

    return NextResponse.json({ units });
  } catch (error) {
    console.error("Error al obtener conceptos:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
