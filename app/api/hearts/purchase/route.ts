// app/api/hearts/purchase/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { ZAP_TO_HEART_RATE, MAX_HEARTS } from "@/lib/constants/gamification";

export async function POST(request: NextRequest) {
  try {
    // Obtener el userId del body o de la sesión/auth
    const body = await request.json();
    const { userId, heartsToPurchase = 1 } = body;

    // Validación básica
    if (!userId) {
      return NextResponse.json(
        { error: "Usuario no autenticado" },
        { status: 401 }
      );
    }

    if (!Number.isInteger(heartsToPurchase) || heartsToPurchase < 1) {
      return NextResponse.json(
        { error: "Cantidad de corazones inválida" },
        { status: 400 }
      );
    }

    const zapCost = heartsToPurchase * ZAP_TO_HEART_RATE;

    // Usar transacción para garantizar atomicidad
    const result = await prisma.$transaction(async (tx) => {
      // 1. Obtener el usuario con bloqueo para evitar condiciones de carrera
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          zapTokens: true,
          hearts: true
        }
      });

      if (!user) {
        throw new Error("Usuario no encontrado");
      }

      // 2. Validar que tenga suficientes ZAPs
      if (user.zapTokens < zapCost) {
        throw new Error(
          `ZAPs insuficientes. Necesitas ${zapCost} ZAPs pero solo tienes ${user.zapTokens}`
        );
      }

      // 3. Validar que no exceda el máximo de corazones
      const newHeartTotal = user.hearts + heartsToPurchase;
      if (newHeartTotal > MAX_HEARTS) {
        throw new Error(
          `No puedes tener más de ${MAX_HEARTS} corazones. Actualmente tienes ${user.hearts}`
        );
      }

      // 4. Actualizar el usuario (restar ZAPs y sumar corazones)
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          zapTokens: { decrement: zapCost },
          hearts: { increment: heartsToPurchase }
        },
        select: {
          id: true,
          zapTokens: true,
          hearts: true
        }
      });

      // 5. Registrar la transacción de ZAPs
      await tx.zapTransaction.create({
        data: {
          userId: userId,
          type: "HEART_PURCHASE",
          amount: -zapCost,
          reason: `Compra de ${heartsToPurchase} corazón(es)`
        }
      });

      // 6. Registrar la transacción de corazones
      await tx.heartTransaction.create({
        data: {
          userId: userId,
          type: "PURCHASED",
          amount: heartsToPurchase,
          reason: `Comprado con ${zapCost} ZAPs`
        }
      });

      return updatedUser;
    });

    return NextResponse.json(
      {
        success: true,
        message: `Intercambio exitoso: ${heartsToPurchase} corazón(es) por ${zapCost} ZAPs`,
        data: {
          zapTokens: result.zapTokens,
          hearts: result.hearts,
          purchased: heartsToPurchase,
          zapSpent: zapCost
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error en intercambio ZAP-Corazón:", error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// GET - Obtener información sobre el intercambio
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
        hearts: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    const maxHeartsPurchasable = Math.min(
      Math.floor(user.zapTokens / ZAP_TO_HEART_RATE),
      MAX_HEARTS - user.hearts
    );

    return NextResponse.json({
      currentZaps: user.zapTokens,
      currentHearts: user.hearts,
      maxHearts: MAX_HEARTS,
      exchangeRate: `${ZAP_TO_HEART_RATE} ZAPs = 1 Corazón`,
      canPurchase: maxHeartsPurchasable,
      zapCostForOne: ZAP_TO_HEART_RATE
    });
  } catch (error) {
    console.error("Error obteniendo información:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
