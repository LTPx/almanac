import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { verifyAdminSession } from "@/lib/admin-auth";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    const adminCheck = verifyAdminSession(session);
    if (adminCheck) return adminCheck;

    const questionId = parseInt(params.id);

    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: {
        unit: {
          select: {
            id: true,
            name: true
          }
        },
        answers: {
          orderBy: {
            order: "asc"
          }
        },
        _count: {
          select: {
            answers: true
          }
        }
      }
    });

    if (!question) {
      return NextResponse.json(
        { error: "Question not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(question);
  } catch (error) {
    console.error("Error fetching question:", error);
    return NextResponse.json(
      { error: "Failed to fetch question" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    const adminCheck = verifyAdminSession(session);
    if (adminCheck) return adminCheck;

    const questionId = parseInt(params.id);
    const body = await request.json();
    const { answers } = body;
    // const { title, type, unitId, order, isActive, content, answers } = body;

    // Verificar que la pregunta existe
    const existingQuestion = await prisma.question.findUnique({
      where: { id: questionId }
    });

    if (!existingQuestion) {
      return NextResponse.json(
        { error: "Question not found" },
        { status: 404 }
      );
    }

    // Actualizar la pregunta y sus respuestas en una transacción
    const question = await prisma.$transaction(async (tx) => {
      // Actualizar la pregunta
      // const updatedQuestion = await tx.question.update({
      //   where: { id: questionId },
      //   data: {
      //     title,
      //     type,
      //     unitId: parseInt(unitId.toString()),
      //     order: order || 1,
      //     isActive: isActive ?? true,
      //     content: content || {}
      //   }
      // });

      // Eliminar las respuestas existentes
      await tx.answer.deleteMany({
        where: { questionId }
      });

      // Crear las nuevas respuestas si existen
      if (answers && answers.length > 0) {
        await tx.answer.createMany({
          data: answers.map((answer: any, index: number) => ({
            questionId,
            text: answer.text,
            isCorrect: answer.isCorrect,
            order: answer.order ?? index
          }))
        });
      }

      // Obtener la pregunta actualizada con las respuestas
      return tx.question.findUnique({
        where: { id: questionId },
        include: {
          unit: {
            select: {
              id: true,
              name: true
            }
          },
          answers: {
            orderBy: {
              order: "asc"
            }
          },
          _count: {
            select: {
              answers: true
            }
          }
        }
      });
    });

    return NextResponse.json(question);
  } catch (error) {
    console.error("Error updating question:", error);
    return NextResponse.json(
      { error: "Failed to update question" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    const adminCheck = verifyAdminSession(session);
    if (adminCheck) return adminCheck;

    const questionId = parseInt(params.id);

    // Verificar que la pregunta existe
    const existingQuestion = await prisma.question.findUnique({
      where: { id: questionId }
    });

    if (!existingQuestion) {
      return NextResponse.json(
        { error: "Question not found" },
        { status: 404 }
      );
    }

    // Eliminar la pregunta (las respuestas se eliminarán automáticamente por la relación en cascade)
    await prisma.question.delete({
      where: { id: questionId }
    });

    return NextResponse.json(
      { message: "Question deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting question:", error);
    return NextResponse.json(
      { error: "Failed to delete question" },
      { status: 500 }
    );
  }
}
