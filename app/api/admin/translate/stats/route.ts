import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const [
      totalCurriculums,
      curriculumsWithEN,
      curriculumsWithES,
      totalUnits,
      unitsWithEN,
      unitsWithES,
      totalLessons,
      lessonsWithEN,
      lessonsWithES,
      totalQuestions,
      questionsWithEN,
      questionsWithES
    ] = await Promise.all([
      prisma.curriculum.count(),
      prisma.curriculumTranslation.count({ where: { language: "EN" } }),
      prisma.curriculumTranslation.count({ where: { language: "ES" } }),
      prisma.unit.count(),
      prisma.unitTranslation.count({ where: { language: "EN" } }),
      prisma.unitTranslation.count({ where: { language: "ES" } }),
      prisma.lesson.count(),
      prisma.lessonTranslation.count({ where: { language: "EN" } }),
      prisma.lessonTranslation.count({ where: { language: "ES" } }),
      prisma.question.count(),
      prisma.questionTranslation.count({ where: { language: "EN" } }),
      prisma.questionTranslation.count({ where: { language: "ES" } })
    ]);

    return NextResponse.json({
      totalCurriculums,
      curriculumsWithEN,
      curriculumsWithES,
      totalUnits,
      unitsWithEN,
      unitsWithES,
      totalLessons,
      lessonsWithEN,
      lessonsWithES,
      totalQuestions,
      questionsWithEN,
      questionsWithES
    });
  } catch (error) {
    console.error("Error fetching translation stats:", error);
    return NextResponse.json(
      { error: "Error al obtener estadísticas" },
      { status: 500 }
    );
  }
}
