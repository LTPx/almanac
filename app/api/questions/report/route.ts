import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    const { questionId, reason, description } = await request.json();

    if (!questionId || !reason) {
      return NextResponse.json(
        { error: "questionId y reason son requeridos" },
        { status: 400 }
      );
    }

    // Verificar que la pregunta existe
    const question = await prisma.question.findUnique({
      where: { id: questionId }
    });

    if (!question) {
      return NextResponse.json(
        { error: "Pregunta no encontrada" },
        { status: 404 }
      );
    }

    // Crear el reporte de problema
    const problemReport = await prisma.problemReport.create({
      data: {
        questionId,
        userId: session?.user?.id || null,
        reason,
        description: description || null
      }
    });

    return NextResponse.json({
      success: true,
      reportId: problemReport.id
    });
  } catch (error) {
    console.error("Error al crear reporte de problema:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
