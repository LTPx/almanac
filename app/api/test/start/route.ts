import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const { userId, lessonId } = await request.json()

    // Validar que existan los parámetros requeridos
    if (!userId || !lessonId) {
      return NextResponse.json(
        { error: "userId y lessonId son requeridos" },
        { status: 400 }
      )
    }

    // Verificar que la lección existe y está activa
    const lesson = await prisma.lesson.findFirst({
      where: {
        id: lessonId,
        isActive: true
      },
      include: {
        questions: {
          where: { isActive: true },
          orderBy: { order: "asc" },
          include: {
            answers: {
              orderBy: { order: "asc" }
            }
          }
        }
      }
    })

    if (!lesson) {
      return NextResponse.json(
        { error: "Lección no encontrada o inactiva" },
        { status: 404 }
      )
    }

    if (lesson.questions.length === 0) {
      return NextResponse.json(
        { error: "Esta lección no tiene preguntas disponibles" },
        { status: 400 }
      )
    }

    // Verificar que el usuario existe
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      )
    }

    // Crear nuevo intento de test
    const testAttempt = await prisma.testAttempt.create({
      data: {
        userId,
        lessonId,
        totalQuestions: lesson.questions.length,
        correctAnswers: 0,
        score: 0,
        isCompleted: false
      }
    })

    // Preparar las preguntas sin mostrar las respuestas correctas
    const questionsForClient = lesson.questions.map((question) => ({
      id: question.id,
      type: question.type,
      title: question.title,
      order: question.order,
      content: question.content,
      answers: question.answers.map((answer) => ({
        id: answer.id,
        text: answer.text,
        order: answer.order
        // No incluir isCorrect
      }))
    }))

    return NextResponse.json({
      testAttemptId: testAttempt.id,
      lesson: {
        id: lesson.id,
        name: lesson.name,
        description: lesson.description
      },
      questions: questionsForClient,
      totalQuestions: lesson.questions.length
    })
  } catch (error) {
    console.error("Error al iniciar test:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
