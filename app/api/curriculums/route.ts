import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { applyTranslation, toLangCode } from "@/lib/apply-translation";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const difficulty = searchParams.get("difficulty");
    const includeUnits = searchParams.get("includeUnits") === "true";
    const activeParam = searchParams.get("active");
    const lang = toLangCode(searchParams.get("lang"));

    const where: any = {};
    if (difficulty && difficulty !== "all") where.difficulty = difficulty;
    if (activeParam === "true") where.isActive = true;
    else if (activeParam === "false") where.isActive = false;

    const curriculums = await prisma.curriculum.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        translations: lang === "ES"
          ? { where: { language: "ES" }, select: { title: true } }
          : false,
        units: includeUnits
          ? {
              orderBy: { order: "asc" },
              select: {
                id: true,
                name: true,
                description: true,
                order: true,
                isActive: true
              },
              ...(lang === "ES" && {
                include: {
                  translations: { where: { language: "ES" }, select: { name: true, description: true } }
                }
              })
            }
          : true,
        _count: { select: { units: true } }
      }
    });

    const result = curriculums.map((curriculum) => {
      const { translations, units, ...rest } = curriculum as any;
      const translated = applyTranslation(rest, translations?.[0], ["title"]);

      const translatedUnits = Array.isArray(units)
        ? units.map((unit: any) => {
            const { translations: uT, ...uRest } = unit;
            return applyTranslation(uRest, uT?.[0], ["name", "description"]);
          })
        : units;

      return { ...translated, units: translatedUnits };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error al obtener curriculums:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
