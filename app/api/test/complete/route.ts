import { NextRequest, NextResponse } from "next/server";
import { calculateXP } from "@/lib/gamification";
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
        unit: {
          include: {
            questions: true
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
    const {
      answers,
      unit: { questions, experiencePoints }
    } = testAttempt;
    const totalAttempts = answers.length;
    const correctAnswers = answers.filter((a) => a.isCorrect).length;

    // Calcular tiempo transcurrido en segundos
    const startTime = new Date(testAttempt.startedAt);
    const endTime = new Date();
    const timeElapsedMs = endTime.getTime() - startTime.getTime();
    const timeElapsedSeconds = Math.floor(timeElapsedMs / 1000);

    // Calcular resultados
    const score = (correctAnswers / testAttempt.totalQuestions) * 100;
    const passScore = 70;
    const passed = score >= passScore;

    const userXP = calculateXP({
      questions: questions.length,
      attempts: totalAttempts,
      correct: correctAnswers,
      incorrect: totalAttempts - correctAnswers,
      timeSec: timeElapsedSeconds,
      xpMax: experiencePoints
    });

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

    if (passed) {
      experienceGained = userXP;

      // Solo actualizar UserUnitProgress si NO es un test de repaso
      if (!testAttempt.isReviewTest) {
        const existingUnitProgress = await prisma.userUnitProgress.findUnique({
          where: {
            userId_unitId: {
              userId: testAttempt.userId,
              unitId: testAttempt.unitId
            }
          }
        });

        if (!existingUnitProgress) {
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
      }

      // Siempre dar XP al usuario (tests normales y de repaso)
      await prisma.user.update({
        where: { id: testAttempt.userId },
        data: {
          totalExperiencePoints: {
            increment: experienceGained
          }
        }
      });
    }

    return NextResponse.json({
      success: true,
      results: {
        score,
        correctAnswers,
        totalQuestions: testAttempt.totalQuestions,
        passed,
        experienceGained,
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
