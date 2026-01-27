import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { levenshtein, normalizeText } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const { finalTestAttemptId, questionId, userAnswer, timeSpent } =
      await request.json();

    if (!finalTestAttemptId || !questionId || userAnswer === undefined) {
      return NextResponse.json(
        {
          error: "finalTestAttemptId, questionId y userAnswer son requeridos"
        },
        { status: 400 }
      );
    }

    // Verificar que el intento de test final existe y no está completado
    const finalTestAttempt = await prisma.finalTestAttempt.findFirst({
      where: {
        id: finalTestAttemptId,
        isCompleted: false
      }
    });

    if (!finalTestAttempt) {
      return NextResponse.json(
        { error: "Intento de test final no encontrado o ya completado" },
        { status: 404 }
      );
    }

    // Obtener la pregunta con sus respuestas
    const question = await prisma.question.findFirst({
      where: { id: questionId },
      include: { answers: true }
    });

    if (!question) {
      return NextResponse.json(
        { error: "Pregunta no encontrada" },
        { status: 404 }
      );
    }

    // Evaluar si la respuesta es correcta
    let isCorrect = false;
    const correctAnswer = question.answers.find((answer) => answer.isCorrect);

    switch (question.type) {
      case "MULTIPLE_CHOICE":
      case "TRUE_FALSE":
        isCorrect = correctAnswer
          ? correctAnswer.id.toString() === userAnswer
          : false;
        break;

      case "FILL_IN_BLANK": {
        const correctText = question.answers.find((a) => a.isCorrect)?.text;
        if (!correctText) {
          isCorrect = false;
          break;
        }

        const correct = normalizeText(correctText);
        const user = normalizeText(userAnswer);

        if (correct === user) {
          isCorrect = true;
        } else {
          const distance = levenshtein(correct, user);
          isCorrect = correct.length > 5 && distance <= 1;
        }
        break;
      }

      case "ORDER_WORDS":
        const userAnswerObj =
          typeof userAnswer === "string" ? JSON.parse(userAnswer) : userAnswer;
        const joinAnswer = userAnswerObj.join(" ");
        // @ts-expect-error no sentence interface JSON
        const rightSentence = question.content?.sentence || correctAnswer?.text;
        isCorrect = joinAnswer === rightSentence;
        break;

      case "MATCHING":
      case "DRAG_DROP":
        isCorrect = true;
        break;

      default:
        isCorrect = false;
    }

    // Crear respuesta del test final
    const finalTestAnswer = await prisma.finalTestAnswer.create({
      data: {
        finalTestAttemptId,
        questionId,
        userAnswer:
          typeof userAnswer === "string"
            ? userAnswer
            : JSON.stringify(userAnswer),
        isCorrect,
        timeSpent
      }
    });

    let hearts: number;

    if (!isCorrect) {
      // Reducir corazones por respuesta incorrecta
      hearts = await reduceHeartsForFailedFinalTest(
        finalTestAttempt.userId,
        finalTestAttemptId
      );
    } else {
      const user = await prisma.user.findUnique({
        where: { id: finalTestAttempt.userId },
        select: { hearts: true }
      });
      hearts = user?.hearts ?? 0;
    }

    return NextResponse.json({
      success: true,
      isCorrect,
      answerId: finalTestAnswer.id,
      hearts
    });
  } catch (error) {
    console.error("Error al enviar respuesta:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// Función auxiliar para reducir corazones en test final
async function reduceHeartsForFailedFinalTest(
  userId: string,
  finalTestAttemptId: number
): Promise<number> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { hearts: true }
  });

  if (!user || user.hearts <= 0) {
    return user?.hearts ?? 0;
  }

  // Reducir un corazón
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      hearts: { decrement: 1 }
    },
    select: { hearts: true }
  });

  // Registrar la transacción de corazones
  await prisma.heartTransaction.create({
    data: {
      userId,
      type: "TEST_FAILED",
      amount: -1,
      reason: "Respuesta incorrecta en test final",
      relatedFinalTestAttemptId: finalTestAttemptId
    }
  });

  return updatedUser.hearts;
}
