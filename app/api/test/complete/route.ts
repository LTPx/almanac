import { NextRequest, NextResponse } from "next/server";
import { completeCurriculum } from "@/lib/gamification";
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
        completedAt: endTime
      }
    });

    let experienceGained = 0;
    let curriculumCompleted = false;
    let curriculumRewards = null;

    if (passed) {
      const existingUnitProgress = await prisma.userUnitProgress.findUnique({
        where: {
          userId_unitId: {
            userId: testAttempt.userId,
            unitId: testAttempt.unitId
          }
        }
      });

      if (!existingUnitProgress) {
        // Primer intento aprobado: XP completa
        experienceGained = testAttempt.unit.experiencePoints;

        await prisma.userUnitProgress.create({
          data: {
            userId: testAttempt.userId,
            unitId: testAttempt.unitId,
            experiencePoints: experienceGained,
            completedAt: new Date()
          }
        });

        if (curriculumId) {
          // ✅ Revisar si completó todas las unidades obligatorias
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

          curriculumCompleted =
            completedUnits.length === unitsCurriculum.length;

          if (curriculumCompleted) {
            curriculumRewards = await completeCurriculum(
              testAttempt.userId,
              curriculumId
            );
            console.log("user tokens gain: ", curriculumRewards);
          }
        }
      } else {
        // Usuario repite el test y aprueba: dar **mitad de XP** y sumarla
        experienceGained = Math.floor(testAttempt.unit.experiencePoints / 2);

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
    }

    return NextResponse.json({
      success: true,
      results: {
        score,
        correctAnswers,
        totalQuestions: testAttempt.totalQuestions,
        passed,
        experienceGained,
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
