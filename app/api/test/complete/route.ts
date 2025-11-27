import { NextRequest, NextResponse } from "next/server";
import { completeCurriculum } from "@/lib/gamification";
import prisma from "@/lib/prisma";
import { calculateExperience, getFinalAnswers } from "@/lib/xp";

export async function POST(request: NextRequest) {
  try {
    const { testAttemptId } = await request.json();

    if (!testAttemptId) {
      return NextResponse.json(
        { error: "testAttemptId es requerido" },
        { status: 400 }
      );
    }

    const testAttempt = await prisma.testAttempt.findFirst({
      where: { id: testAttemptId },
      include: {
        answers: {
          orderBy: {
            createdAt: "asc" // Ordenar por fecha para identificar reintentos
          }
        },
        unit: {
          include: {
            curriculum: true
          }
        }
      }
    });

    const curriculumId = testAttempt?.unit.curriculum?.id;

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

    // Calcular tiempo transcurrido en segundos
    const startTime = new Date(testAttempt.startedAt);
    const endTime = new Date();
    const timeElapsedMs = endTime.getTime() - startTime.getTime();
    const timeElapsedSeconds = Math.floor(timeElapsedMs / 1000);

    const finalAnswers = getFinalAnswers(testAttempt.answers);
    const totalAttempts = testAttempt.answers.length;

    const correctAnswers = finalAnswers.filter((a) => a.isCorrect).length;
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
        completedAt: endTime
      }
    });

    let experienceGained = 0;
    let experienceBreakdown = null;
    let curriculumCompleted = false;
    let curriculumRewards = null;

    if (passed) {
      // Verificar si es el primer intento del test completo
      const existingUnitProgress = await prisma.userUnitProgress.findUnique({
        where: {
          userId_unitId: {
            userId: testAttempt.userId,
            unitId: testAttempt.unitId
          }
        }
      });

      const isFirstAttempt = !existingUnitProgress;

      const xpResult = calculateExperience({
        baseExperience: testAttempt.unit.experiencePoints,
        totalQuestions: testAttempt.totalQuestions,
        correctAnswers,
        totalAttempts,
        timeElapsedSeconds,
        isFirstAttempt
      });

      experienceGained = xpResult.finalExperience;
      experienceBreakdown = xpResult.breakdown;

      if (isFirstAttempt) {
        await prisma.userUnitProgress.create({
          data: {
            userId: testAttempt.userId,
            unitId: testAttempt.unitId,
            experiencePoints: experienceGained,
            completedAt: new Date()
          }
        });
      } else {
        await prisma.userUnitProgress.update({
          where: {
            userId_unitId: {
              userId: testAttempt.userId,
              unitId: testAttempt.unitId
            }
          },
          data: {
            experiencePoints: {
              increment: experienceGained
            },
            completedAt: new Date()
          }
        });
      }

      await prisma.user.update({
        where: { id: testAttempt.userId },
        data: {
          totalExperiencePoints: {
            increment: experienceGained
          }
        }
      });

      if (curriculumId && isFirstAttempt) {
        const unitsCurriculum = await prisma.unit.findMany({
          where: {
            curriculumId,
            isActive: true,
            mandatory: true
          },
          select: { id: true }
        });

        const completedUnits = await prisma.userUnitProgress.findMany({
          where: {
            userId: testAttempt.userId,
            unitId: { in: unitsCurriculum.map((l) => l.id) }
          }
        });

        curriculumCompleted = completedUnits.length === unitsCurriculum.length;

        if (curriculumCompleted) {
          curriculumRewards = await completeCurriculum(
            testAttempt.userId,
            curriculumId
          );
          console.log("user tokens gain: ", curriculumRewards);
        }
      }
    }

    return NextResponse.json({
      success: true,
      results: {
        score,
        correctAnswers,
        totalQuestions: testAttempt.totalQuestions,
        totalAttempts,
        retriesUsed: totalAttempts - testAttempt.totalQuestions,
        passed,
        experienceGained,
        experienceBreakdown,
        curriculumCompleted,
        curriculumRewards,
        timeQuizInSeconds: timeElapsedSeconds
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
