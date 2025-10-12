import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { contentUploadSchema } from "@/lib/content-schema";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validar con Zod
    const validatedData = contentUploadSchema.parse(body);

    // Estadísticas para el resultado
    let unitsCreated = 0;
    let lessonsCreated = 0;
    let questionsCreated = 0;

    // Insertar datos usando transacción con timeout extendido
    await prisma.$transaction(
      async (tx) => {
        for (const unit of validatedData) {
          await tx.unit.create({
            data: {
              name: unit.name,
              description: unit.description,
              order: unit.order,
              lessons: {
                create: unit.lessons.map((lesson) => ({
                  name: lesson.name,
                  description: lesson.description,
                  position: lesson.position,
                  experiencePoints: lesson.experiencePoints,
                  questions: {
                    create: lesson.questions.map((q) => ({
                      type: q.type,
                      title: q.title,
                      order: q.order,
                      content: q.content,
                      answers:
                        q.answers.length > 0
                          ? {
                              create: q.answers.map((a) => ({
                                text: a.text,
                                isCorrect: a.isCorrect,
                                order: a.order
                              }))
                            }
                          : undefined
                    }))
                  }
                }))
              }
            }
          });

          unitsCreated++;
          lessonsCreated += unit.lessons.length;
          questionsCreated += unit.lessons.reduce(
            (acc, lesson) => acc + lesson.questions.length,
            0
          );
        }
      },
      {
        maxWait: 10000, // Espera máxima de 10 segundos
        timeout: 30000 // Timeout de 30 segundos para la transacción
      }
    );

    return NextResponse.json({
      success: true,
      message: "Content uploaded successfully",
      stats: {
        units: unitsCreated,
        lessons: lessonsCreated,
        questions: questionsCreated
      }
    });
  } catch (error: any) {
    console.error("Error uploading content:", error);

    // Manejo de errores de validación de Zod
    if (error instanceof ZodError) {
      const formattedErrors = error.errors.map((err) => ({
        path: err.path.join("."),
        message: err.message
      }));

      return NextResponse.json(
        {
          error: "Validation failed",
          details: formattedErrors
        },
        { status: 400 }
      );
    }

    // Error de Prisma (e.g., violación de constraint único)
    if (error.code === "P2002") {
      return NextResponse.json(
        {
          error: "Duplicate entry",
          details: "A unit, lesson, or question with this data already exists"
        },
        { status: 409 }
      );
    }

    // Otros errores
    return NextResponse.json(
      {
        error: "Failed to upload content",
        details: error.message
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// Endpoint para limpiar datos (útil para testing)
export async function DELETE(request: NextRequest) {
  try {
    // Verificar autenticación de admin aquí si es necesario

    await prisma.$transaction(async (tx) => {
      await tx.testAnswer.deleteMany();
      await tx.testAttempt.deleteMany();
      await tx.answer.deleteMany();
      await tx.question.deleteMany();
      await tx.userProgress.deleteMany();
      await tx.lesson.deleteMany();
      await tx.unit.deleteMany();
    });

    return NextResponse.json({
      success: true,
      message: "All content deleted successfully"
    });
  } catch (error: any) {
    console.error("Error deleting content:", error);

    return NextResponse.json(
      {
        error: "Failed to delete content",
        details: error.message
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
