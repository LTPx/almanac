import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { verifyAdminSession } from "@/lib/admin-auth";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    const adminCheck = verifyAdminSession(session);
    if (adminCheck) return adminCheck;

    const { id } = await context.params;

    const questionId = parseInt(id);

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
        translations: {
          select: {
            language: true,
            title: true,
            content: true
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
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    const adminCheck = verifyAdminSession(session);
    if (adminCheck) return adminCheck;
    const { id } = await context.params;

    const questionId = parseInt(id);
    const body = await request.json();
    const { title, type, unitId, order, isActive, content, answers, translations } = body;

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
      await tx.question.update({
        where: { id: questionId },
        data: {
          title,
          type,
          unitId: parseInt(unitId.toString()),
          order: order || 1,
          isActive: isActive ?? true,
          content: content || {}
        }
      });

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

      // Guardar traducciones si vienen en el body
      if (translations) {
        for (const lang of ["EN", "ES"] as const) {
          const t = translations[lang];
          if (t?.title?.trim()) {
            await tx.questionTranslation.upsert({
              where: { questionId_language: { questionId, language: lang } },
              update: { title: t.title, content: t.content ?? {} },
              create: { questionId, language: lang, title: t.title, content: t.content ?? {} }
            });
          }
        }
      }

      // Crear AnswerTranslation para MULTIPLE_CHOICE si hay opciones traducidas en ES
      if (type === "MULTIPLE_CHOICE" && translations?.ES?.content?.options) {
        const updatedAnswers = await tx.answer.findMany({
          where: { questionId },
          orderBy: { order: "asc" }
        });
        const translatedOptions: string[] = translations.ES.content.options;
        for (let i = 0; i < updatedAnswers.length; i++) {
          const translatedText = translatedOptions[i];
          if (translatedText?.trim()) {
            await tx.answerTranslation.upsert({
              where: { answerId_language: { answerId: updatedAnswers[i].id, language: "ES" } },
              update: { text: translatedText },
              create: { answerId: updatedAnswers[i].id, language: "ES", text: translatedText }
            });
          }
        }
        // EN AnswerTranslation from existing answer text
        for (const ans of updatedAnswers) {
          await tx.answerTranslation.upsert({
            where: { answerId_language: { answerId: ans.id, language: "EN" } },
            update: { text: ans.text },
            create: { answerId: ans.id, language: "EN", text: ans.text }
          });
        }
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
          translations: {
            select: {
              language: true,
              title: true,
              content: true
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
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    const adminCheck = verifyAdminSession(session);
    if (adminCheck) return adminCheck;
    const { id } = await context.params;
    const questionId = parseInt(id);

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
