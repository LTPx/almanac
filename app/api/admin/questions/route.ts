import { NextResponse } from "next/server";
import { getQuestions } from "@/lib/queries";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { verifyAdminSession } from "@/lib/admin-auth";

export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    const adminCheck = verifyAdminSession(session);
    if (adminCheck) return adminCheck;

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim() || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);
    const type = searchParams.get("type") || undefined;

    const result = await getQuestions(search, page, pageSize, type);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching questions:", error);
    return NextResponse.json(
      { error: "Failed to fetch questions" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    const adminCheck = verifyAdminSession(session);
    if (adminCheck) return adminCheck;

    const body = await request.json();
    const { title, type, unitId, order, isActive, content, answers } = body;

    // Validaciones
    if (!title || !type || !unitId) {
      return NextResponse.json(
        { error: "Title, type, and unitId are required" },
        { status: 400 }
      );
    }

    // Crear la pregunta en una transacción para asegurar que las respuestas también se creen
    const question = await prisma.$transaction(async (tx) => {
      // Crear la pregunta
      const newQuestion = await tx.question.create({
        data: {
          title,
          type,
          unitId: parseInt(unitId.toString()),
          order: order || 1,
          isActive: isActive ?? true,
          content: content || {}
        },
        include: {
          unit: {
            select: {
              id: true,
              name: true
            }
          },
          _count: {
            select: {
              answers: true
            }
          }
        }
      });

      // Crear las respuestas si existen
      if (answers && answers.length > 0) {
        await tx.answer.createMany({
          data: answers.map((answer: any, index: number) => ({
            questionId: newQuestion.id,
            text: answer.text,
            isCorrect: answer.isCorrect,
            order: answer.order ?? index
          }))
        });
      }

      // Obtener la pregunta con las respuestas
      return tx.question.findUnique({
        where: { id: newQuestion.id },
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

    return NextResponse.json(question, { status: 201 });
  } catch (error) {
    console.error("Error creating question:", error);
    return NextResponse.json(
      { error: "Failed to create question" },
      { status: 500 }
    );
  }
}
