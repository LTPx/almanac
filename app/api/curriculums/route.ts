import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const difficulty = searchParams.get("difficulty");
    const includeUnits = searchParams.get("includeUnits") === "true";

    const where: any = {};

    if (difficulty && difficulty !== "all") {
      where.difficulty = difficulty;
    }

    const curriculums = await prisma.curriculum.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        units: includeUnits
          ? {
              orderBy: { order: "asc" },
              select: {
                id: true,
                name: true,
                description: true,
                order: true,
                isActive: true
              }
            }
          : true,
        _count: {
          select: { units: true }
        }
      }
    });

    return NextResponse.json(curriculums);
  } catch (error) {
    console.error("Error al obtener curriculums:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, audienceAgeRange, difficulty, unitIds, metadata } = body;

    if (!title || !difficulty) {
      return NextResponse.json(
        { error: "title y difficulty son requeridos" },
        { status: 400 }
      );
    }

    // Validar que la dificultad es válida
    const validDifficulties = ["BEGINNER", "INTERMEDIATE", "ADVANCED"];
    if (!validDifficulties.includes(difficulty)) {
      return NextResponse.json(
        {
          error:
            "Dificultad inválida. Valores permitidos: BEGINNER, INTERMEDIATE, ADVANCED"
        },
        { status: 400 }
      );
    }

    // Validar que hay al menos una unidad
    // if (!unitIds || !Array.isArray(unitIds) || unitIds.length === 0) {
    //   return NextResponse.json(
    //     { error: "Debes seleccionar al menos una unidad" },
    //     { status: 400 }
    //   );
    // }

    console.log("unitIds:", unitIds);
    if (unitIds !== undefined) {
      // Verificar que todas las unidades existen
      const existingUnits = await prisma.unit.findMany({
        where: {
          id: { in: unitIds }
        },
        select: { id: true }
      });

      if (existingUnits.length !== unitIds.length) {
        return NextResponse.json(
          { error: "Algunas unidades seleccionadas no existen" },
          { status: 400 }
        );
      }
    }

    // Crear el curriculum con transacción
    const curriculum = await prisma.$transaction(async (tx) => {
      // 1. Crear el curriculum
      const newCurriculum = await tx.curriculum.create({
        data: {
          title,
          audienceAgeRange: audienceAgeRange || null,
          difficulty,
          metadata: metadata || null
        }
      });
      const units = unitIds || [];
      // 2. Conectar las unidades manteniendo el orden
      await tx.curriculum.update({
        where: { id: newCurriculum.id },
        data: {
          units: {
            connect: units.map((id: number) => ({ id }))
          }
        }
      });

      // 3. Obtener el curriculum completo con las unidades
      const completeCurriculum = await tx.curriculum.findUnique({
        where: { id: newCurriculum.id },
        include: {
          units: {
            orderBy: { order: "asc" }
          }
        }
      });

      return completeCurriculum;
    });

    return NextResponse.json(
      {
        message: "Curriculum creado exitosamente",
        curriculum
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error al crear curriculum:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
