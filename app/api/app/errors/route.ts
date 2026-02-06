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
            unit: {
              select: {
                name: true
              }
            },
            answers: {
              where: {
                isCorrect: true
              },
              select: {
                text: true,
                order: true
              }
            }
          }
        }
      },
      distinct: ["questionId"]
    });

    const questions = incorrectAnswers.map((a) => ({
      id: a.question.id,
      title: a.question.title,
      type: a.question.type,
      content: a.question.content,
      unitName: a.question.unit.name,
      correctAnswers: a.question.answers
    }));

    return NextResponse.json({ questions });
  } catch (error) {
    console.error("Error al obtener errores:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
