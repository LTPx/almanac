import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  toLangCode,
  answerTranslationFilter,
  applyQuestionTranslation
} from "@/lib/apply-translation";

export async function POST(request: NextRequest) {
  try {
    const { userId, curriculumId, lang: langRaw } = await request.json();
    const lang = toLangCode(langRaw);

    // Validar parámetros requeridos
    if (!userId || !curriculumId) {
      return NextResponse.json(
        { error: "userId y curriculumId son requeridos" },
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

    // Obtener el test final del curriculum con sus preguntas
    const finalTest = await prisma.finalTest.findUnique({
      where: { curriculumId },
      include: {
        curriculum: {
          select: {
            id: true,
            title: true
          }
        },
        questions: {
          orderBy: { order: "asc" },
          include: {
            question: {
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
        }
      }
    });

    if (!finalTest) {
      return NextResponse.json(
        { error: "Test final no encontrado para este curriculum" },
        { status: 404 }
      );
    }

    if (!finalTest.isActive) {
      return NextResponse.json(
        { error: "El test final no está activo" },
        { status: 400 }
      );
    }

    if (finalTest.questions.length === 0) {
      return NextResponse.json(
        { error: "El test final no tiene preguntas configuradas" },
        { status: 400 }
      );
    }

    // Crear nuevo intento de test final
    const finalTestAttempt = await prisma.finalTestAttempt.create({
      data: {
        userId,
        finalTestId: finalTest.id,
        totalQuestions: finalTest.questions.length,
        correctAnswers: 0,
        score: 0,
        isPassed: false,
        isCompleted: false
      }
    });

    // Preparar las preguntas sin mostrar las respuestas correctas
    const questionsForClient = shuffle(
      finalTest.questions.map((ftq) => {
        const { title, content, answers } = applyQuestionTranslation(
          ftq.question
        );
        return {
          id: ftq.question.id,
          type: ftq.question.type,
          title,
          order: ftq.order,
          content:
            ftq.question.type === "ORDER_WORDS"
              ? { ...content, words: shuffle(content?.words) }
              : content,
          answers: shuffle(answers ?? [])
        };
      })
    );

    // Guardar el orden de las preguntas
    const questionOrder = questionsForClient.map((q) => q.id);
    await prisma.finalTestAttempt.update({
      where: { id: finalTestAttempt.id },
      data: { questionOrder }
    });

    return NextResponse.json({
      finalTestAttemptId: finalTestAttempt.id,
      curriculum: {
        id: finalTest.curriculum.id,
        title: finalTest.curriculum.title
      },
      finalTest: {
        id: finalTest.id,
        title: finalTest.title,
        description: finalTest.description,
        passingScore: finalTest.passingScore
      },
      questions: questionsForClient,
      totalQuestions: finalTest.questions.length
    });
  } catch (error) {
    console.error("Error al iniciar test final:", error);
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
