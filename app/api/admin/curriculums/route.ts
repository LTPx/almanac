import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const difficulty = searchParams.get("difficulty");
    const includeUnits = searchParams.get("includeUnits") === "true";
    const activeParam = searchParams.get("active");
    const search = searchParams.get("search")?.trim() || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "15", 10);

    const where: any = {};

    if (difficulty && difficulty !== "all") {
      where.difficulty = difficulty;
    }

    if (activeParam === "true") {
      where.isActive = true;
    } else if (activeParam === "false") {
      where.isActive = false;
    }

    // Búsqueda por título
    if (search) {
      where.title = {
        contains: search,
        mode: "insensitive"
      };
    }

    // Calcular paginación
    const skip = (page - 1) * pageSize;
    const take = pageSize;

    // Obtener total de registros
    const total = await prisma.curriculum.count({ where });

    // Obtener curriculums con paginación
    const curriculums = await prisma.curriculum.findMany({
      where,
      skip,
      take,
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
        translations: true, // Incluir traducciones
        _count: {
          select: { units: true }
        }
      }
    });

    return NextResponse.json({
      data: curriculums,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      }
    });
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
    const { title, audienceAgeRange, difficulty, unitIds, metadata, translations } =
      body;

    // Validar traducciones
    if (!translations || !translations.EN?.title || !translations.ES?.title) {
      return NextResponse.json(
        { error: "Se requieren traducciones en EN y ES" },
        { status: 400 }
      );
    }

    if (!difficulty) {
      return NextResponse.json(
        { error: "difficulty es requerido" },
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
      // 1. Crear el curriculum (mantenemos title por compatibilidad, usando EN como default)
      const newCurriculum = await tx.curriculum.create({
        data: {
          title: translations.EN.title, // Usar traducción EN como título principal
          audienceAgeRange: audienceAgeRange || null,
          difficulty,
          metadata: metadata || null
        }
      });

      // 2. Crear traducciones EN y ES
      await tx.curriculumTranslation.createMany({
        data: [
          {
            curriculumId: newCurriculum.id,
            language: "EN",
            title: translations.EN.title
          },
          {
            curriculumId: newCurriculum.id,
            language: "ES",
            title: translations.ES.title
          }
        ]
      });

      const units = unitIds || [];
      // 3. Conectar las unidades manteniendo el orden
      if (units.length > 0) {
        await tx.curriculum.update({
          where: { id: newCurriculum.id },
          data: {
            units: {
              connect: units.map((id: number) => ({ id }))
            }
          }
        });
      }

      // 4. Obtener el curriculum completo con las unidades y traducciones
      const completeCurriculum = await tx.curriculum.findUnique({
        where: { id: newCurriculum.id },
        include: {
          units: {
            orderBy: { order: "asc" }
          },
          translations: true
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
    console.error("Error fetching curriculums:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
