// app/api/ads/watch/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  ZAP_REWARD,
  AD_COOLDOWN_MINUTES,
  AD_DURATION_SECONDS
} from "@/lib/constants/gamification";

// POST - Iniciar visualización de anuncio
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, action } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "Usuario no autenticado" },
        { status: 401 }
      );
    }

    // Acción: "start" para iniciar, "complete" para completar
    if (action === "start") {
      return handleAdStart(userId);
    } else if (action === "complete") {
      return handleAdComplete(userId, body.adSessionId);
    } else {
      return NextResponse.json({ error: "Acción inválida" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error en visualización de anuncio:", error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// GET - Obtener información sobre disponibilidad de anuncios
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "userId requerido" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        zapTokens: true,
        zapTransactions: {
          where: {
            type: "AD_REWARD",
            reason: {
              contains: "anuncio"
            }
          },
          orderBy: {
            createdAt: "desc"
          },
          take: 1
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Verificar si puede ver un anuncio
    const lastAdWatch = user.zapTransactions[0];
    const now = new Date();
    let canWatchAd = true;
    let nextAvailableAt = null;

    if (lastAdWatch) {
      const cooldownEndTime = new Date(
        lastAdWatch.createdAt.getTime() + AD_COOLDOWN_MINUTES * 60 * 1000
      );

      if (now < cooldownEndTime) {
        canWatchAd = false;
        nextAvailableAt = cooldownEndTime;
      }
    }

    return NextResponse.json({
      currentZaps: user.zapTokens,
      zapReward: ZAP_REWARD,
      adDuration: AD_DURATION_SECONDS,
      canWatchAd,
      nextAvailableAt,
      cooldownMinutes: AD_COOLDOWN_MINUTES,
      timeUntilNextAd: nextAvailableAt
        ? Math.ceil((nextAvailableAt.getTime() - now.getTime()) / 1000)
        : 0
    });
  } catch (error) {
    console.error("Error obteniendo información de anuncios:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// Función auxiliar: Iniciar visualización de anuncio
async function handleAdStart(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      zapTransactions: {
        where: {
          type: "DAILY_BONUS",
          reason: {
            contains: "anuncio"
          }
        },
        orderBy: {
          createdAt: "desc"
        },
        take: 1
      }
    }
  });

  if (!user) {
    throw new Error("Usuario no encontrado");
  }

  // Verificar cooldown
  const lastAdWatch = user.zapTransactions[0];
  if (lastAdWatch) {
    const now = new Date();
    const cooldownEndTime = new Date(
      lastAdWatch.createdAt.getTime() + AD_COOLDOWN_MINUTES * 60 * 1000
    );

    if (now < cooldownEndTime) {
      const secondsRemaining = Math.ceil(
        (cooldownEndTime.getTime() - now.getTime()) / 1000
      );
      throw new Error(
        `Debes esperar ${Math.ceil(secondsRemaining / 60)} minutos antes de ver otro anuncio`
      );
    }
  }

  // Generar session ID para validar que complete el anuncio
  const adSessionId = `ad_${userId}_${Date.now()}`;

  return NextResponse.json({
    success: true,
    message: "Anuncio iniciado",
    adSessionId,
    duration: AD_DURATION_SECONDS,
    reward: ZAP_REWARD
  });
}

// Función auxiliar: Completar visualización de anuncio
async function handleAdComplete(userId: string, adSessionId: string) {
  if (!adSessionId) {
    throw new Error("Session ID del anuncio requerido");
  }

  // Validar que el session ID sea válido (básico)
  if (!adSessionId.startsWith(`ad_${userId}_`)) {
    throw new Error("Session ID inválido");
  }

  // Extraer timestamp del session ID
  const timestamp = parseInt(adSessionId.split("_")[2]);
  const adStartTime = new Date(timestamp);
  const now = new Date();
  const elapsedSeconds = (now.getTime() - adStartTime.getTime()) / 1000;

  // Validar que haya pasado el tiempo mínimo del anuncio
  if (elapsedSeconds < AD_DURATION_SECONDS - 1) {
    // -1 segundo de margen
    throw new Error("Debes completar el anuncio completo");
  }

  // Verificar que no haya pasado demasiado tiempo (máximo 2 minutos)
  if (elapsedSeconds > 120) {
    throw new Error("La sesión del anuncio ha expirado");
  }

  // Usar transacción para otorgar los Zaps
  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        zapTokens: true
      }
    });

    if (!user) {
      throw new Error("Usuario no encontrado");
    }

    // Actualizar Zaps del usuario
    const updatedUser = await tx.user.update({
      where: { id: userId },
      data: {
        zapTokens: { increment: ZAP_REWARD }
      },
      select: {
        zapTokens: true
      }
    });

    // Registrar la transacción
    await tx.zapTransaction.create({
      data: {
        userId: userId,
        type: "AD_REWARD",
        amount: ZAP_REWARD,
        reason: `Recompensa por ver anuncio`
      }
    });

    return updatedUser;
  });

  return NextResponse.json({
    success: true,
    message: `¡Has ganado ${ZAP_REWARD} Zaps!`,
    data: {
      zapTokens: result.zapTokens,
      earnedZaps: ZAP_REWARD
    }
  });
}
