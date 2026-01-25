import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET - Obtener el test final del curriculum con sus preguntas
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ curriculumId: string }> }
) {
  const { curriculumId } = await context.params;

  try {
    // Obtener el curriculum con sus unidades y preguntas
    const curriculum = await prisma.curriculum.findUnique({
      where: { id: curriculumId },
      include: {
        units: {
          where: { isActive: true },
          orderBy: { order: "asc" },
          include: {
            questions: {
              where: { isActive: true },
              orderBy: { order: "asc" },
              select: {
                id: true,
                title: true,
                type: true,
                order: true,
              },
            },
          },
        },
        finalTest: {
          include: {
            questions: {
              orderBy: { order: "asc" },
              include: {
                question: {
                  select: {
                    id: true,
                    title: true,
                    type: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!curriculum) {
      return NextResponse.json(
        { error: "Curriculum no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(curriculum);
  } catch (error) {
    console.error("Error fetching final test:", error);
    return NextResponse.json(
      { error: "Error al obtener el test final" },
      { status: 500 }
    );
  }
}

// PUT - Crear o actualizar el test final
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ curriculumId: string }> }
) {
  const { curriculumId } = await context.params;

  try {
    const body = await request.json();
    const {
      title,
      description,
      passingScore = 70,
      totalQuestions = 10,
      isActive = true,
      questionIds = [], // Array de IDs de preguntas seleccionadas
    } = body;

    // Verificar que el curriculum existe
    const curriculum = await prisma.curriculum.findUnique({
      where: { id: curriculumId },
      include: {
        units: {
          select: { id: true },
        },
      },
    });

    if (!curriculum) {
      return NextResponse.json(
        { error: "Curriculum no encontrado" },
        { status: 404 }
      );
    }

    // Verificar que las preguntas pertenecen a unidades del curriculum
    if (questionIds.length > 0) {
      const unitIds = curriculum.units.map((u) => u.id);
      const validQuestions = await prisma.question.findMany({
        where: {
          id: { in: questionIds },
          unitId: { in: unitIds },
          isActive: true,
        },
        select: { id: true },
      });

      if (validQuestions.length !== questionIds.length) {
        return NextResponse.json(
          { error: "Algunas preguntas no son válidas o no pertenecen al curriculum" },
          { status: 400 }
        );
      }
    }

    // Buscar si ya existe un test final para este curriculum
    const existingFinalTest = await prisma.finalTest.findUnique({
      where: { curriculumId },
    });

    let finalTest;

    if (existingFinalTest) {
      // Actualizar test existente
      // Primero eliminar las preguntas anteriores
      await prisma.finalTestQuestion.deleteMany({
        where: { finalTestId: existingFinalTest.id },
      });

      // Actualizar el test final
      finalTest = await prisma.finalTest.update({
        where: { id: existingFinalTest.id },
        data: {
          title,
          description,
          passingScore,
          totalQuestions: questionIds.length || totalQuestions,
          isActive,
          questions: {
            create: questionIds.map((questionId: number, index: number) => ({
              questionId,
              order: index + 1,
            })),
          },
        },
        include: {
          questions: {
            orderBy: { order: "asc" },
            include: {
              question: {
                select: {
                  id: true,
                  title: true,
                  type: true,
                },
              },
            },
          },
        },
      });
    } else {
      // Crear nuevo test final
      finalTest = await prisma.finalTest.create({
        data: {
          curriculumId,
          title,
          description,
          passingScore,
          totalQuestions: questionIds.length || totalQuestions,
          isActive,
          questions: {
            create: questionIds.map((questionId: number, index: number) => ({
              questionId,
              order: index + 1,
            })),
          },
        },
        include: {
          questions: {
            orderBy: { order: "asc" },
            include: {
              question: {
                select: {
                  id: true,
                  title: true,
                  type: true,
                },
              },
            },
          },
        },
      });
    }

    return NextResponse.json({
      message: existingFinalTest ? "Test final actualizado" : "Test final creado",
      finalTest,
    });
  } catch (error) {
    console.error("Error saving final test:", error);
    return NextResponse.json(
      { error: "Error al guardar el test final" },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar el test final
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ curriculumId: string }> }
) {
  const { curriculumId } = await context.params;

  try {
    const finalTest = await prisma.finalTest.findUnique({
      where: { curriculumId },
    });

    if (!finalTest) {
      return NextResponse.json(
        { error: "Test final no encontrado" },
        { status: 404 }
      );
    }

    await prisma.finalTest.delete({
      where: { id: finalTest.id },
    });

    return NextResponse.json({ message: "Test final eliminado" });
  } catch (error) {
    console.error("Error deleting final test:", error);
    return NextResponse.json(
      { error: "Error al eliminar el test final" },
      { status: 500 }
    );
  }
}
