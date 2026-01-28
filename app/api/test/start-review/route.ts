import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { userId, curriculumId } = await request.json();

    if (!userId || !curriculumId) {
      return NextResponse.json(
        { error: "userId y curriculumId son requeridos" },
        { status: 400 }
      );
    }

    // Obtener las preguntas que el usuario respondió incorrectamente en este curriculum
    const incorrectAnswers = await prisma.testAnswer.findMany({
      where: {
        isCorrect: false,
        testAttempt: {
          userId,
          unit: {
            curriculum: { id: curriculumId }
          }
        }
      },
      select: {
        questionId: true
      },
      distinct: ["questionId"]
    });

    if (incorrectAnswers.length === 0) {
      return NextResponse.json(
        { error: "No tienes preguntas erradas para repasar" },
        { status: 400 }
      );
    }

    // Seleccionar hasta 10 preguntas aleatorias de las erradas
    const shuffledIds = shuffle(incorrectAnswers.map((a) => a.questionId));
    const selectedIds = shuffledIds.slice(0, 10);

    // Obtener las preguntas completas con sus respuestas
    const questions = await prisma.question.findMany({
      where: {
        id: { in: selectedIds },
        isActive: true
      },
      include: {
        answers: {
          orderBy: { order: "asc" }
        }
      }
    });

    if (questions.length === 0) {
      return NextResponse.json(
        { error: "No hay preguntas activas disponibles para repasar" },
        { status: 400 }
      );
    }

    // Usar el unitId de la primera pregunta para el TestAttempt
    const unitId = questions[0].unitId;

    const testAttempt = await prisma.testAttempt.create({
      data: {
        userId,
        unitId,
        totalQuestions: questions.length,
        correctAnswers: 0,
        score: 0,
        isCompleted: false
      }
    });

    const questionsForClient = shuffle(
      questions.map((question) => ({
        id: question.id,
        type: question.type,
        title: question.title,
        order: question.order,
        content:
          question.type === "ORDER_WORDS"
            ? {
                //@ts-expect-error spread error
                ...question.content,
                //@ts-expect-error no words type
                words: shuffle(question.content?.words)
              }
            : question.content,
        answers: shuffle(
          question.answers.map((answer) => ({
            id: answer.id,
            text: answer.text
          }))
        )
      }))
    );

    const questionOrder = questionsForClient.map((q) => q.id);
    await prisma.testAttempt.update({
      where: { id: testAttempt.id },
      data: { questionOrder }
    });

    return NextResponse.json({
      testAttemptId: testAttempt.id,
      lesson: {
        id: unitId,
        name: "Repaso de errores",
        description: "Repasa las preguntas que respondiste incorrectamente"
      },
      questions: questionsForClient,
      totalQuestions: questions.length
    });
  } catch (error) {
    console.error("Error al iniciar test de repaso:", error);
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
