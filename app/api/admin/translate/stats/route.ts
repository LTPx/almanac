import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const [totalUnits, unitsWithES, totalLessons, lessonsWithES] =
      await Promise.all([
        prisma.unit.count(),
        prisma.unitTranslation.count({ where: { language: "ES" } }),
        prisma.lesson.count(),
        prisma.lessonTranslation.count({ where: { language: "ES" } })
      ]);

    return NextResponse.json({
      totalUnits,
      unitsWithES,
      totalLessons,
      lessonsWithES
    });
  } catch (error) {
    console.error("Error fetching translation stats:", error);
    return NextResponse.json(
      { error: "Error al obtener estadísticas" },
      { status: 500 }
    );
  }
}
