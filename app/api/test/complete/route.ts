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
          include: { unit: true }
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
      (a) => a.isCorrect
    ).length;
    const score = (correctAnswers / testAttempt.totalQuestions) * 100;
    const passScore = 70;
    const passed = score >= passScore;

    // Actualizar el intento de test
    await prisma.testAttempt.update({
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
      // ✅ Test pasado → otorgar experiencia
      experienceGained = testAttempt.lesson.experiencePoints;

      // Verificar si ya existe progreso para esta lección
      const existingLessonProgress = await prisma.userLessonProgress.findUnique(
        {
          where: {
            userId_lessonId: {
              userId: testAttempt.userId,
              lessonId: testAttempt.lessonId
            }
          }
        }
      );

      if (!existingLessonProgress) {
        // Crear progreso de lección aprobada
        await prisma.userLessonProgress.create({
          data: {
            userId: testAttempt.userId,
            lessonId: testAttempt.lessonId,
            experiencePoints: testAttempt.lesson.experiencePoints,
            completedAt: new Date()
          }
        });

        // ✅ Revisar si completó todas las obligatorias de la unidad
        const unitLessons = await prisma.lesson.findMany({
          where: {
            unitId: testAttempt.lesson.unit.id,
            isActive: true,
            mandatory: true
          },
          select: { id: true }
        });

        const completedLessons = await prisma.userLessonProgress.findMany({
          where: {
            userId: testAttempt.userId,
            lessonId: { in: unitLessons.map((l) => l.id) }
          }
        });

        if (completedLessons.length >= unitLessons.length) {
          // Unidad completada → verificar si ya tiene progreso
          const existingUnitProgress = await prisma.userUnitProgress.findUnique(
            {
              where: {
                userId_unitId: {
                  userId: testAttempt.userId,
                  unitId: testAttempt.lesson.unit.id
                }
              }
            }
          );

          if (!existingUnitProgress) {
            await prisma.userUnitProgress.create({
              data: {
                userId: testAttempt.userId,
                unitId: testAttempt.lesson.unit.id,
                completedAt: new Date()
              }
            });

            try {
              unitRewards = await completeUnit(
                testAttempt.userId,
                testAttempt.lesson.unit.id
              );
              unitCompleted = true;
            } catch (error: any) {
              console.log("Unit reward error:", error.message);
            }
          }
        }

        // ✅ Actualizar racha
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
      // ❌ Test fallado → reducir corazones
      try {
        heartsLost = 1;
        await reduceHeartsForFailedTest(testAttempt.userId, testAttemptId);
      } catch (error: any) {
        console.log("Error reducing hearts:", error.message);
        heartsLost = 0;
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
        unitRewards, // { zapTokens, unitTokens, totalUnitsCompleted }
        heartsLost
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
