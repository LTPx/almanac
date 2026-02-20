import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  toLangCode,
  answerTranslationFilter,
  applyQuestionTranslation
} from "@/lib/apply-translation";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const testAttemptId = searchParams.get("testAttemptId");
    const userId = searchParams.get("userId");
    const lang = toLangCode(searchParams.get("lang"));

    if (!testAttemptId || !userId) {
      return NextResponse.json(
        { error: "testAttemptId y userId son requeridos" },
        { status: 400 }
      );
    }

    const testAttempt = await prisma.testAttempt.findFirst({
      where: {
        id: parseInt(testAttemptId),
        userId,
        isCompleted: false
      },
      include: {
        unit: {
          include: {
            questions: {
              where: { isActive: true },
              include: {
                translations:
                  lang === "ES"
                    ? {
                        where: { language: "ES" },
                        select: { title: true, content: true }
                      }
                    : false,
                answers: {
                  orderBy: { order: "asc" },
                  include: { translations: answerTranslationFilter(lang) }
                }
              }
            }
          }
        },
        answers: true
      }
    });

    if (!testAttempt) {
      return NextResponse.json(
        { error: "Test no encontrado o ya completado" },
        { status: 404 }
      );
    }

    const questionOrder = testAttempt.questionOrder as number[] | null;
    if (!questionOrder) {
      return NextResponse.json(
        { error: "No se puede resumir este test (sin orden de preguntas)" },
        { status: 400 }
      );
    }

    // Crear mapa de preguntas para ordenarlas según questionOrder
    const questionsMap = new Map(
      testAttempt.unit.questions.map((q) => [q.id, q])
    );

    // Ordenar preguntas según el orden guardado
    const orderedQuestions = questionOrder
      .map((id) => questionsMap.get(id))
      .filter((q) => q !== undefined);

    // Preparar preguntas para el cliente
    const questionsForClient = orderedQuestions.map((question) => {
      const { title, content, answers } = applyQuestionTranslation(question!);
      return {
        id: question!.id,
        type: question!.type,
        title,
        order: question!.order,
        content,
        answers: answers ?? []
      };
    });

    // Calcular el índice de la pregunta actual basado en las respuestas
    const answeredQuestionIds = new Set(
      testAttempt.answers.map((a) => a.questionId)
    );

    // Encontrar la primera pregunta no respondida
    let currentQuestionIndex = questionsForClient.findIndex(
      (q) => !answeredQuestionIds.has(q.id)
    );

    // Si todas las preguntas están respondidas, ir a la última
    if (currentQuestionIndex === -1) {
      currentQuestionIndex = questionsForClient.length - 1;
    }

    // Reconstruir respuestas previas
    const previousAnswers: Record<
      number,
      { answer: string; isCorrect: boolean }
    > = {};
    testAttempt.answers.forEach((a) => {
      previousAnswers[a.questionId] = {
        answer: a.userAnswer,
        isCorrect: a.isCorrect
      };
    });

    return NextResponse.json({
      testAttemptId: testAttempt.id,
      lesson: {
        id: testAttempt.unit.id,
        name: testAttempt.unit.name,
        description: testAttempt.unit.description
      },
      questions: questionsForClient,
      totalQuestions: questionsForClient.length,
      currentQuestionIndex,
      previousAnswers
    });
  } catch (error) {
    console.error("Error al resumir test:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
