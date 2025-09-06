import { NextRequest, NextResponse } from "next/server";
import { completeUnit, reduceHeartsForFailedTest } from "@/lib/gamification";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { testAttemptId } = await request.json();

    if (!testAttemptId) {
      return NextResponse.json(
        { error: "testAttemptId es requerido" },
        { status: 400 }
      );
    }

    // Obtener el intento con todas sus respuestas
    const testAttempt = await prisma.testAttempt.findFirst({
      where: { id: testAttemptId },
      include: {
        answers: true,
        lesson: {
          include: {
            unit: true
          }
        }
      }
    });

    if (!testAttempt) {
      return NextResponse.json(
        { error: "Intento de test no encontrado" },
        { status: 404 }
      );
    }

    if (testAttempt.isCompleted) {
      return NextResponse.json(
        { error: "El test ya ha sido completado" },
        { status: 400 }
      );
    }

    // Calcular resultados
    const correctAnswers = testAttempt.answers.filter(
      (answer) => answer.isCorrect
    ).length;
    const score = (correctAnswers / testAttempt.totalQuestions) * 100;
    const passScore = 70;
    const passed = score >= passScore;

    // Actualizar el intento de test
    const updatedTestAttempt = await prisma.testAttempt.update({
      where: { id: testAttemptId },
      data: {
        correctAnswers,
        score,
        isCompleted: true,
        completedAt: new Date()
      }
    });

    let experienceGained = 0;
    let unitCompleted = false;
    let unitRewards = null;
    let heartsLost = 0;

    if (passed) {
      // Test pasado - otorgar experiencia y verificar si completó la unidad
      experienceGained = testAttempt.lesson.experiencePoints;

      // Verificar si ya existe progreso para esta lección
      const existingProgress = await prisma.userProgress.findFirst({
        where: {
          userId: testAttempt.userId,
          lessonId: testAttempt.lessonId
        }
      });

      if (!existingProgress || !existingProgress.isCompleted) {
        await prisma.userProgress.upsert({
          where: {
            userId_lessonId: {
              userId: testAttempt.userId,
              lessonId: testAttempt.lessonId
            }
          },
          update: {
            isCompleted: true,
            experiencePoints: testAttempt.lesson.experiencePoints,
            completedAt: new Date()
          },
          create: {
            userId: testAttempt.userId,
            lessonId: testAttempt.lessonId,
            unitId: testAttempt.lesson.unitId,
            isCompleted: true,
            experiencePoints: testAttempt.lesson.experiencePoints,
            completedAt: new Date()
          }
        });

        // Verificar si completó todas las lecciones de la unidad
        const unitLessons = await prisma.lesson.findMany({
          where: {
            unitId: testAttempt.lesson.unit.id,
            isActive: true,
            mandatory: true
          }
        });

        const completedLessons = await prisma.userProgress.findMany({
          where: {
            userId: testAttempt.userId,
            lesson: { unitId: testAttempt.lesson.unit.id },
            isCompleted: true
          }
        });

        if (completedLessons.length >= unitLessons.length) {
          // ¡Unidad completada! Otorgar recompensas
          try {
            unitRewards = await completeUnit(
              testAttempt.userId,
              testAttempt.lesson.unit.id
            );
            unitCompleted = true;
          } catch (error: any) {
            console.log("Unit already completed or error:", error.message);
          }
        }

        // Actualizar racha del usuario
        await prisma.userStreak.upsert({
          where: { userId: testAttempt.userId },
          update: {
            currentStreak: { increment: 1 },
            lastActivity: new Date()
          },
          create: {
            userId: testAttempt.userId,
            currentStreak: 1,
            longestStreak: 1,
            lastActivity: new Date()
          }
        });

        // Actualizar la racha más larga si es necesario
        const userStreak = await prisma.userStreak.findUnique({
          where: { userId: testAttempt.userId }
        });

        if (userStreak && userStreak.currentStreak > userStreak.longestStreak) {
          await prisma.userStreak.update({
            where: { userId: testAttempt.userId },
            data: { longestStreak: userStreak.currentStreak }
          });
        }
      }
    } else {
      // Test fallado - reducir corazones
      try {
        heartsLost = 1;
        await reduceHeartsForFailedTest(testAttempt.userId, testAttemptId);
      } catch (error: any) {
        console.log("Error reducing hearts:", error.message);
        heartsLost = 0; // No se pudieron reducir corazones (tal vez ya no tiene)
      }
    }

    return NextResponse.json({
      success: true,
      results: {
        score,
        correctAnswers,
        totalQuestions: testAttempt.totalQuestions,
        passed,
        experienceGained,
        unitCompleted,
        unitRewards, // { zapTokens: number, unitTokens: number, totalUnitsCompleted: number }
        heartsLost // Si falló el test
      }
    });
  } catch (error) {
    console.error("Error al completar test:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
