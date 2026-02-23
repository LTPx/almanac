import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { applyTranslation, toLangCode } from "@/lib/apply-translation";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const curriculumId = searchParams.get("curriculumId");
    const lang = toLangCode(searchParams.get("lang"));

    if (!userId || !curriculumId) {
      return NextResponse.json(
        { error: "userId y curriculumId son requeridos" },
        { status: 400 }
      );
    }

    const translationsFilter =
      lang === "ES"
        ? {
            where: { language: "ES" as const },
            select: { name: true, description: true }
          }
        : (false as const);

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
            translations: translationsFilter,
            lessons: {
              where: { isActive: true },
              orderBy: { position: "asc" },
              select: {
                id: true,
                name: true,
                description: true,
                translations: translationsFilter
              }
            }
          }
        }
      }
    });

    const units = learnedUnits.map((p) => {
      const { translations: uT, lessons, ...uRest } = p.unit as any;
      const translatedUnit = applyTranslation(uRest, uT?.[0], [
        "name",
        "description"
      ]);

      const translatedLessons = lessons.map((lesson: any) => {
        const { translations: lT, ...lRest } = lesson;
        return applyTranslation(lRest, lT?.[0], ["name", "description"]);
      });

      return { ...translatedUnit, lessons: translatedLessons };
    });

    return NextResponse.json({ units });
  } catch (error) {
    console.error("Error al obtener conceptos:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
