import { NextRequest, NextResponse } from "next/server";
import { calculateXP, completeCurriculum } from "@/lib/gamification";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { finalTestAttemptId } = await request.json();

    if (!finalTestAttemptId) {
      return NextResponse.json(
        { error: "finalTestAttemptId es requerido" },
        { status: 400 }
      );
    }

    // Obtener el intento con todas sus respuestas
    const finalTestAttempt = await prisma.finalTestAttempt.findFirst({
      where: { id: finalTestAttemptId },
      include: {
        answers: true,
        finalTest: {
          include: {
            curriculum: true,
            questions: {
              include: {
                question: true
              }
            }
          }
        }
      }
    });

    if (!finalTestAttempt) {
      return NextResponse.json(
        { error: "Intento de test final no encontrado" },
        { status: 404 }
      );
    }

    if (finalTestAttempt.isCompleted) {
      return NextResponse.json(
        { error: "El test final ya ha sido completado" },
        { status: 400 }
      );
    }

    const { answers, finalTest } = finalTestAttempt;
    const curriculumId = finalTest.curriculum.id;

    const totalAttempts = answers.length;
    const correctAnswers = answers.filter((a) => a.isCorrect).length;

    // Calcular tiempo transcurrido
    const startTime = new Date(finalTestAttempt.startedAt);
    const endTime = new Date();
    const timeElapsedMs = endTime.getTime() - startTime.getTime();
    const timeElapsedSeconds = Math.floor(timeElapsedMs / 1000);

    // Calcular resultados
    const score = (correctAnswers / finalTestAttempt.totalQuestions) * 100;
    const passScore = finalTest.passingScore;
    const passed = score >= passScore;

    // Calcular XP basado en el rendimiento
    const baseXP = 50; // XP base para test final (mayor que tests de unidad)
    const userXP = calculateXP({
      questions: finalTest.questions.length,
      attempts: totalAttempts,
      correct: correctAnswers,
      incorrect: totalAttempts - correctAnswers,
      timeSec: timeElapsedSeconds,
      xpMax: baseXP
    });

    // Actualizar el intento de test final
    await prisma.finalTestAttempt.update({
      where: { id: finalTestAttemptId },
      data: {
        correctAnswers,
        score,
        isPassed: passed,
        isCompleted: true,
        completedAt: endTime
      }
    });

    let experienceGained = 0;
    let curriculumCompleted = false;
    let curriculumRewards = null;

    if (passed) {
      // Verificar si ya completó el curriculum antes
      const existingCurriculumProgress =
        await prisma.userCurriculumProgress.findUnique({
          where: {
            userId_curriculumId: {
              userId: finalTestAttempt.userId,
              curriculumId
            }
          }
        });

      if (!existingCurriculumProgress?.isCompleted) {
        // Primera vez que aprueba el test final
        experienceGained = userXP;

        // Verificar que todas las unidades obligatorias estén completadas
        const mandatoryUnits = await prisma.unit.findMany({
          where: {
            curriculumId,
            isActive: true,
            mandatory: true
          },
          select: { id: true }
        });

        const completedUnits = await prisma.userUnitProgress.findMany({
          where: {
            userId: finalTestAttempt.userId,
            unitId: { in: mandatoryUnits.map((u) => u.id) }
          }
        });

        const allUnitsCompleted =
          completedUnits.length === mandatoryUnits.length;

        if (allUnitsCompleted) {
          // Completar el curriculum
          curriculumCompleted = true;
          curriculumRewards = await completeCurriculum(
            finalTestAttempt.userId,
            curriculumId
          );

          // Actualizar o crear el progreso del curriculum
          await prisma.userCurriculumProgress.upsert({
            where: {
              userId_curriculumId: {
                userId: finalTestAttempt.userId,
                curriculumId
              }
            },
            update: {
              isCompleted: true,
              completedAt: new Date(),
              experiencePoints: { increment: experienceGained }
            },
            create: {
              userId: finalTestAttempt.userId,
              curriculumId,
              isCompleted: true,
              completedAt: new Date(),
              experiencePoints: experienceGained
            }
          });
        }
      } else {
        // Ya había completado el curriculum antes, dar XP reducida
        experienceGained = Math.floor(userXP / 2);
      }

      // Actualizar XP total del usuario
      await prisma.user.update({
        where: { id: finalTestAttempt.userId },
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
        totalQuestions: finalTestAttempt.totalQuestions,
        passed,
        passingScore: passScore,
        experienceGained,
        curriculumCompleted,
        curriculumRewards,
        timeQuizInSeconds: timeElapsedSeconds
      }
    });
  } catch (error) {
    console.error("Error al completar test final:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
