import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const { testAttemptId, questionId, userAnswer, timeSpent } =
      await request.json()

    if (!testAttemptId || !questionId || userAnswer === undefined) {
      return NextResponse.json(
        { error: "testAttemptId, questionId y userAnswer son requeridos" },
        { status: 400 }
      )
    }

    // Verificar que el intento de test existe y no está completado
    const testAttempt = await prisma.testAttempt.findFirst({
      where: {
        id: testAttemptId,
        isCompleted: false
      }
    })

    if (!testAttempt) {
      return NextResponse.json(
        { error: "Intento de test no encontrado o ya completado" },
        { status: 404 }
      )
    }

    // Obtener la pregunta con sus respuestas
    const question = await prisma.question.findFirst({
      where: { id: questionId },
      include: { answers: true }
    })

    if (!question) {
      return NextResponse.json(
        { error: "Pregunta no encontrada" },
        { status: 404 }
      )
    }

    // Evaluar si la respuesta es correcta
    let isCorrect = false

    switch (question.type) {
      case "MULTIPLE_CHOICE":
      case "TRUE_FALSE":
        // Para opción múltiple, comparar con la respuesta correcta
        const correctAnswer = question.answers.find(
          (answer) => answer.isCorrect
        )
        isCorrect = correctAnswer
          ? correctAnswer.id.toString() === userAnswer
          : false
        break

      case "FILL_IN_BLANK":
        // Para completar espacios, comparar texto (case insensitive)
        const correctText = question.answers.find(
          (answer) => answer.isCorrect
        )?.text
        isCorrect = correctText
          ? correctText.toLowerCase().trim() === userAnswer.toLowerCase().trim()
          : false
        break

      case "ORDER_WORDS":
      case "MATCHING":
      case "DRAG_DROP":
        // Para estos tipos, el userAnswer debería ser un JSON con el orden/matches
        // Se necesita lógica específica según el contenido de la pregunta
        try {
          const userAnswerObj =
            typeof userAnswer === "string" ? JSON.parse(userAnswer) : userAnswer
          // Aquí implementar la lógica específica según question.content
          isCorrect = false // Placeholder
        } catch {
          isCorrect = false
        }
        break

      default:
        isCorrect = false
    }

    // Verificar si ya existe una respuesta para esta pregunta en este intento
    const existingAnswer = await prisma.testAnswer.findFirst({
      where: {
        testAttemptId,
        questionId
      }
    })

    let testAnswer
    if (existingAnswer) {
      // Actualizar respuesta existente
      testAnswer = await prisma.testAnswer.update({
        where: { id: existingAnswer.id },
        data: {
          userAnswer:
            typeof userAnswer === "string"
              ? userAnswer
              : JSON.stringify(userAnswer),
          isCorrect,
          timeSpent
        }
      })
    } else {
      // Crear nueva respuesta
      testAnswer = await prisma.testAnswer.create({
        data: {
          testAttemptId,
          questionId,
          userAnswer:
            typeof userAnswer === "string"
              ? userAnswer
              : JSON.stringify(userAnswer),
          isCorrect,
          timeSpent
        }
      })
    }

    return NextResponse.json({
      success: true,
      isCorrect,
      answerId: testAnswer.id
    })
  } catch (error) {
    console.error("Error al enviar respuesta:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
