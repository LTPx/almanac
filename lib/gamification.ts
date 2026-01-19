import {
  HOURS_PER_HEART,
  MAX_HEARTS,
  TOKENS_PER_UNIT_COMPLETE,
  ZAPS_PER_HEART_PURCHASE,
  ZAPS_PER_UNIT_COMPLETE
} from "./constants/gamification";

import prisma from "./prisma";

type TestResult = {
  questions: number;
  attempts: number;
  correct: number;
  incorrect: number;
  timeSec: number;
  xpMax: number;
};

export async function resetHeartsByHours(userId: string) {
  const now = new Date();
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { lastHeartReset: true, hearts: true }
  });

  if (!user) throw new Error("User not found");

  // Si ya tiene el máximo de corazones, no hacer nada
  if (user.hearts >= MAX_HEARTS) {
    return false;
  }

  // Calcular cuántas horas han pasado desde el último reset
  const lastReset = new Date(user.lastHeartReset);
  const hoursSinceLastReset =
    (now.getTime() - lastReset.getTime()) / (60 * 60 * 1000);

  // Calcular cuántos corazones se deben regenerar
  const heartsToRegenerate = Math.floor(hoursSinceLastReset / HOURS_PER_HEART);

  if (heartsToRegenerate > 0) {
    // Calcular los nuevos corazones sin exceder el máximo
    const newHearts = Math.min(user.hearts + heartsToRegenerate, MAX_HEARTS);

    const actualHeartsAdded = newHearts - user.hearts;

    await prisma.user.update({
      where: { id: userId },
      data: {
        hearts: newHearts,
        lastHeartReset: now
      }
    });

    // Registrar transacción
    await prisma.heartTransaction.create({
      data: {
        userId,
        type: "DAILY_RESET",
        amount: actualHeartsAdded,
        reason: `Regeneración de ${actualHeartsAdded} corazón(es)`
      }
    });

    return true;
  }

  return false;
}

export async function resetDailyHearts(userId: string) {
  const now = new Date();
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { lastHeartReset: true, hearts: true }
  });

  if (!user) throw new Error("User not found");

  // Verificar si ya se resetearon hoy
  const lastReset = new Date(user.lastHeartReset);
  const shouldReset = now.getTime() - lastReset.getTime() > 24 * 60 * 60 * 1000; // 24 horas

  if (shouldReset && user.hearts < MAX_HEARTS) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        hearts: MAX_HEARTS,
        lastHeartReset: now
      }
    });

    // Registrar transacción
    await prisma.heartTransaction.create({
      data: {
        userId,
        type: "DAILY_RESET",
        amount: MAX_HEARTS - user.hearts,
        reason: "Reseteo diario de corazones"
      }
    });

    return true;
  }

  return false;
}

export async function reduceHeartsForFailedTest(
  userId: string,
  testAttemptId: number
) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { hearts: true }
  });

  if (!user) throw new Error("User not found");
  if (user.hearts <= 0) throw new Error("No hay corazones disponibles");

  await prisma.user.update({
    where: { id: userId },
    data: { hearts: { decrement: 1 } }
  });

  // Registrar transacción
  await prisma.heartTransaction.create({
    data: {
      userId,
      type: "TEST_FAILED",
      amount: -1,
      reason: "Test Failed",
      relatedTestAttemptId: testAttemptId
    }
  });

  return user.hearts - 1;
}

export async function purchaseHeartWithZaps(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { hearts: true, zapTokens: true }
  });

  if (!user) throw new Error("User not found");
  if (user.hearts >= MAX_HEARTS)
    throw new Error("Ya tienes el máximo de corazones");
  if (user.zapTokens < ZAPS_PER_HEART_PURCHASE)
    throw new Error("No tienes suficientes ZAPs");

  // Actualizar usuario
  await prisma.user.update({
    where: { id: userId },
    data: {
      hearts: { increment: 1 },
      zapTokens: { decrement: ZAPS_PER_HEART_PURCHASE }
    }
  });

  // Registrar transacciones
  await Promise.all([
    prisma.heartTransaction.create({
      data: {
        userId,
        type: "PURCHASED",
        amount: 1,
        reason: "Hearts buys with ZAPs"
      }
    }),
    prisma.zapTransaction.create({
      data: {
        userId,
        type: "HEART_PURCHASE",
        amount: -ZAPS_PER_HEART_PURCHASE,
        reason: "ZAPs gastados en comprar corazón"
      }
    })
  ]);

  return {
    hearts: user.hearts + 1,
    zapTokens: user.zapTokens - ZAPS_PER_HEART_PURCHASE
  };
}

export async function completeCurriculum(userId: string, curriculumId: string) {
  const existingProgress = await prisma.userCurriculumProgress.findFirst({
    where: {
      userId,
      curriculumId,
      isCompleted: true
    }
  });

  if (existingProgress) {
    throw new Error("Este curriculum ya fue completada anteriormente");
  }

  // Marcar unidad como completada y otorgar recompensas
  const [updatedUser, curriculumToken] = await prisma.$transaction(
    async (tx) => {
      // Actualizar usuario con ZAPs y contador de unidades
      const user = await tx.user.update({
        where: { id: userId },
        data: {
          zapTokens: { increment: ZAPS_PER_UNIT_COMPLETE },
          totalCurriculumsCompleted: { increment: 1 }
        }
      });

      // Crear o actualizar token de unidad
      const curriculumToken = await tx.userCurriculumToken.upsert({
        where: {
          userId_curriculumId: { userId, curriculumId }
        },
        update: {
          quantity: { increment: TOKENS_PER_UNIT_COMPLETE },
          updatedAt: new Date()
        },
        create: {
          userId,
          curriculumId,
          quantity: TOKENS_PER_UNIT_COMPLETE
        }
      });

      // Marcar progreso como completado
      // await tx.userProgress.upsert({
      //   where: {
      //     userId_curriculumId: { userId, unitId }
      //   },
      //   update: {
      //     isCompleted: true,
      //     completedAt: new Date()
      //   },
      //   create: {
      //     userId,
      //     unitId,
      //     isCompleted: true,
      //     completedAt: new Date()
      //   }
      // });

      // Registrar transacción de ZAPs
      await tx.zapTransaction.create({
        data: {
          userId,
          type: "UNIT_COMPLETED",
          amount: ZAPS_PER_UNIT_COMPLETE,
          reason: "ZAPs ganados por completar curriculum",
          relatedCurriculumId: curriculumId
        }
      });

      return [user, curriculumToken];
    }
  );

  return {
    zapTokens: updatedUser.zapTokens,
    curriculumTokens: curriculumToken.quantity,
    totalCurriculumsCompleted: updatedUser.totalCurriculumsCompleted
  };
}

export async function getUserGamificationStats(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      hearts: true,
      zapTokens: true,
      totalCurriculumsCompleted: true,
      lastHeartReset: true,
      userCurriculumTokens: {
        include: {
          curriculum: {
            select: {
              id: true,
              title: true
            }
          }
        }
      }
    }
  });

  if (!user) throw new Error("User not found");

  // Verificar si necesita reseteo de corazones
  const now = new Date();
  const hoursSinceReset =
    (now.getTime() - new Date(user.lastHeartReset).getTime()) /
    (1000 * 60 * 60);
  const needsHeartReset = hoursSinceReset >= 24 && user.hearts < MAX_HEARTS;

  return {
    hearts: user.hearts,
    maxHearts: MAX_HEARTS,
    zapTokens: user.zapTokens,
    totalCurriculumsCompleted: user.totalCurriculumsCompleted,
    userCurriculumTokens: user.userCurriculumTokens,
    needsHeartReset,
    canPurchaseHeart:
      user.zapTokens >= ZAPS_PER_HEART_PURCHASE && user.hearts < MAX_HEARTS
  };
}

export async function dailyHeartResetCronJob() {
  const now = new Date();
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  // Encontrar usuarios que necesitan reseteo
  const usersNeedingReset = await prisma.user.findMany({
    where: {
      AND: [
        { lastHeartReset: { lt: twentyFourHoursAgo } },
        { hearts: { lt: MAX_HEARTS } }
      ]
    },
    select: { id: true, hearts: true }
  });

  const results = [];

  for (const user of usersNeedingReset) {
    try {
      await resetDailyHearts(user.id);
      results.push({ userId: user.id, success: true });
    } catch (error: any) {
      results.push({ userId: user.id, success: false, error: error.message });
    }
  }

  return {
    totalProcessed: results.length,
    successful: results.filter((r) => r.success).length,
    failed: results.filter((r) => !r.success).length,
    results
  };
}

export function calculateXP(data: TestResult): number {
  const { questions, attempts, correct, incorrect, timeSec, xpMax } = data;

  console.log("test result data:", data);

  const totalAnswers = correct + incorrect;
  if (totalAnswers === 0) return 0;

  // 1. Accuracy
  const accuracy = correct / totalAnswers;

  // 2. Speed bonus
  const idealTime = questions * 12; // 12 seconds per question
  let speedBonus = 0;

  if (timeSec <= idealTime) {
    speedBonus = 1;
  } else if (timeSec >= idealTime * 2) {
    speedBonus = 0;
  } else {
    speedBonus = 1 - (timeSec - idealTime) / idealTime;
  }

  // 3. Retry penalty
  const retryFactor = Math.max(0.5, Math.min(1, questions / attempts));

  // 4. Final XP formula (no decimals)
  const xp = xpMax * (0.7 * accuracy + 0.2 * speedBonus + 0.1 * retryFactor);
  console.log("XP calculated:", xp);

  return Math.round(xp); // no decimals
}
