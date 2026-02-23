import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  toLangCode,
  questionTranslationFilters,
  answerTranslationFilter,
  applyTranslation
} from "@/lib/apply-translation";

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

    const qTFilters = questionTranslationFilters(lang);
    const answerTFilter = answerTranslationFilter(lang);
    const unitTFilter =
      lang === "ES"
        ? {
            where: { language: "ES" as const },
            select: { name: true }
          }
        : (false as const);

    const incorrectAnswers = await prisma.testAnswer.findMany({
      where: {
        isCorrect: false,
        testAttempt: {
          userId,
          isReviewTest: { not: true },
          unit: {
            curriculum: { id: curriculumId }
          }
        }
      },
      select: {
        questionId: true,
        question: {
          select: {
            id: true,
            title: true,
            type: true,
            content: true,
            translations: qTFilters.translations,
            unit: {
              select: {
                name: true,
                translations: unitTFilter
              }
            },
            answers: {
              where: { isCorrect: true },
              select: {
                text: true,
                order: true,
                translations: answerTFilter
              }
            }
          }
        }
      },
      distinct: ["questionId"]
    });

    const questions = incorrectAnswers.map((a) => {
      const q = a.question as any;
      const qT = q.translations?.[0];
      const title = qT?.title || q.title;
      const content =
        qT?.content && Object.keys(qT.content).length > 0
          ? qT.content
          : q.content;

      const translatedUnit = applyTranslation(
        { name: q.unit.name },
        q.unit.translations?.[0],
        ["name"]
      );

      const correctAnswers = q.answers.map((ans: any) => ({
        text: ans.translations?.[0]?.text || ans.text,
        order: ans.order
      }));

      return {
        id: q.id,
        title,
        type: q.type,
        content,
        unitName: translatedUnit.name,
        correctAnswers
      };
    });

    return NextResponse.json({ questions });
  } catch (error) {
    console.error("Error al obtener errores:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
