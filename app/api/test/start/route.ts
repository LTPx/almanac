import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  toLangCode,
  answerTranslationFilter,
  applyQuestionTranslation
} from "@/lib/apply-translation";

export async function POST(request: NextRequest) {
  try {
    const { userId, unitId, lang: langRaw } = await request.json();
    const lang = toLangCode(langRaw);

    // Validar que existan los parámetros requeridos
    if (!userId || !unitId) {
      return NextResponse.json(
        { error: "userId y unitId son requeridos" },
        { status: 400 }
      );
    }

    // Verificar que la unit existe y está activa
    const unit = await prisma.unit.findFirst({
      where: {
        id: unitId,
        isActive: true
      },
      include: {
        questions: {
          where: { isActive: true },
          orderBy: { order: "asc" },
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
    });

    if (!unit) {
      return NextResponse.json(
        { error: "Unidad no encontrada o inactiva" },
        { status: 404 }
      );
    }

    if (unit.questions.length === 0) {
      return NextResponse.json(
        { error: "Esta unidad no tiene preguntas disponibles" },
        { status: 400 }
      );
    }

    // Verificar que el usuario existe
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Crear nuevo intento de test
    const testAttempt = await prisma.testAttempt.create({
      data: {
        userId,
        unitId,
        totalQuestions: unit.questions.length,
        correctAnswers: 0,
        score: 0,
        isCompleted: false
      }
    });

    // Preparar las preguntas sin mostrar las respuestas correctas
    const questionsForClient = shuffle(
      unit.questions.map((question) => {
        const { title, content, answers } = applyQuestionTranslation(question);
        return {
          id: question.id,
          type: question.type,
          title,
          order: question.order,
          content:
            question.type === "ORDER_WORDS"
              ? { ...content, words: shuffle(content?.words) }
              : content,
          answers: shuffle(answers ?? [])
        };
      })
    );

    // Guardar el orden de las preguntas para poder resumir el test
    const questionOrder = questionsForClient.map((q) => q.id);
    await prisma.testAttempt.update({
      where: { id: testAttempt.id },
      data: { questionOrder }
    });

    return NextResponse.json({
      testAttemptId: testAttempt.id,
      lesson: {
        id: unit.id,
        name: unit.name,
        description: unit.description
      },
      questions: questionsForClient,
      totalQuestions: unit.questions.length
    });
  } catch (error) {
    console.error("Error al iniciar test:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

function shuffle<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}
