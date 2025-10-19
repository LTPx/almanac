import prisma from "./prisma";

const GAME_CONFIG = {
  MAX_HEARTS: 5,
  HOURS_PER_HEART: 5,
  ZAPS_PER_UNIT_COMPLETE: 100,
  ZAPS_PER_HEART_PURCHASE: 10,
  TOKENS_PER_UNIT_COMPLETE: 1
};

export async function resetHeartsByHours(userId: string) {
  const now = new Date();
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { lastHeartReset: true, hearts: true }
  });

  if (!user) throw new Error("User not found");

  // Si ya tiene el máximo de corazones, no hacer nada
  if (user.hearts >= GAME_CONFIG.MAX_HEARTS) {
    return false;
  }

  // Calcular cuántas horas han pasado desde el último reset
  const lastReset = new Date(user.lastHeartReset);
  const hoursSinceLastReset =
    (now.getTime() - lastReset.getTime()) / (60 * 60 * 1000);

  // Calcular cuántos corazones se deben regenerar
  const heartsToRegenerate = Math.floor(
    hoursSinceLastReset / GAME_CONFIG.HOURS_PER_HEART
  );

  if (heartsToRegenerate > 0) {
    // Calcular los nuevos corazones sin exceder el máximo
    const newHearts = Math.min(
      user.hearts + heartsToRegenerate,
      GAME_CONFIG.MAX_HEARTS
    );

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

  if (shouldReset && user.hearts < GAME_CONFIG.MAX_HEARTS) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        hearts: GAME_CONFIG.MAX_HEARTS,
        lastHeartReset: now
      }
    });

    // Registrar transacción
    await prisma.heartTransaction.create({
      data: {
        userId,
        type: "DAILY_RESET",
        amount: GAME_CONFIG.MAX_HEARTS - user.hearts,
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
  if (user.hearts >= GAME_CONFIG.MAX_HEARTS)
    throw new Error("Ya tienes el máximo de corazones");
  if (user.zapTokens < GAME_CONFIG.ZAPS_PER_HEART_PURCHASE)
    throw new Error("No tienes suficientes ZAPs");

  // Actualizar usuario
  await prisma.user.update({
    where: { id: userId },
    data: {
      hearts: { increment: 1 },
      zapTokens: { decrement: GAME_CONFIG.ZAPS_PER_HEART_PURCHASE }
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
        amount: -GAME_CONFIG.ZAPS_PER_HEART_PURCHASE,
        reason: "ZAPs gastados en comprar corazón"
      }
    })
  ]);

  return {
    hearts: user.hearts + 1,
    zapTokens: user.zapTokens - GAME_CONFIG.ZAPS_PER_HEART_PURCHASE
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
          zapTokens: { increment: GAME_CONFIG.ZAPS_PER_UNIT_COMPLETE },
          totalCurriculumsCompleted: { increment: 1 }
        }
      });

      // Crear o actualizar token de unidad
      const curriculumToken = await tx.userCurriculumToken.upsert({
        where: {
          userId_curriculumId: { userId, curriculumId }
        },
        update: {
          quantity: { increment: GAME_CONFIG.TOKENS_PER_UNIT_COMPLETE },
          updatedAt: new Date()
        },
        create: {
          userId,
          curriculumId,
          quantity: GAME_CONFIG.TOKENS_PER_UNIT_COMPLETE
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
          amount: GAME_CONFIG.ZAPS_PER_UNIT_COMPLETE,
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
  const needsHeartReset =
    hoursSinceReset >= 24 && user.hearts < GAME_CONFIG.MAX_HEARTS;

  return {
    hearts: user.hearts,
    maxHearts: GAME_CONFIG.MAX_HEARTS,
    zapTokens: user.zapTokens,
    totalCurriculumsCompleted: user.totalCurriculumsCompleted,
    userCurriculumTokens: user.userCurriculumTokens,
    needsHeartReset,
    canPurchaseHeart:
      user.zapTokens >= GAME_CONFIG.ZAPS_PER_HEART_PURCHASE &&
      user.hearts < GAME_CONFIG.MAX_HEARTS
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
        { hearts: { lt: GAME_CONFIG.MAX_HEARTS } }
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
