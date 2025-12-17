import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { verifyAdminSession } from "@/lib/admin-auth";

/**
 * POST /api/admin/users/[userId]/zaps
 * Ajusta los ZAPs de un usuario manualmente (puede ser positivo o negativo)
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    // Verificar que el usuario sea admin
    const session = await auth.api.getSession({
      headers: await headers()
    });

    const adminCheck = verifyAdminSession(session);
    if (adminCheck) return adminCheck;

    const { userId } = await context.params;
    const { amount, reason } = await request.json();

    if (amount === undefined || amount === null) {
      return NextResponse.json(
        { error: "amount es requerido" },
        { status: 400 }
      );
    }

    if (typeof amount !== "number") {
      return NextResponse.json(
        { error: "amount debe ser un número" },
        { status: 400 }
      );
    }

    // Verificar que el usuario existe
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Verificar que no deje al usuario con ZAPs negativos
    const newZapAmount = user.zapTokens + amount;
    if (newZapAmount < 0) {
      return NextResponse.json(
        {
          error: `No se puede ajustar. El usuario quedaría con ${newZapAmount} ZAPs`
        },
        { status: 400 }
      );
    }

    // Crear transacción de ZAPs y actualizar usuario
    const [zapTransaction, updatedUser] = await prisma.$transaction([
      prisma.zapTransaction.create({
        data: {
          userId,
          type: "ADMIN_ADJUSTMENT",
          amount,
          reason: reason || `Ajuste manual de admin: ${amount} ZAPs`
        }
      }),
      prisma.user.update({
        where: { id: userId },
        data: {
          zapTokens: { increment: amount }
        },
        select: {
          id: true,
          name: true,
          email: true,
          zapTokens: true,
          hearts: true
        }
      })
    ]);

    return NextResponse.json({
      success: true,
      message: `ZAPs ajustados exitosamente: ${amount > 0 ? "+" : ""}${amount}`,
      user: updatedUser,
      transaction: zapTransaction
    });
  } catch (err: any) {
    console.error("Error adjusting ZAPs:", err);
    return NextResponse.json(
      { error: "Error al ajustar ZAPs", detail: err.message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/users/[userId]/zaps
 * Obtiene el historial de transacciones de ZAPs de un usuario
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    // Verificar que el usuario sea admin
    const session = await auth.api.getSession({
      headers: await headers()
    });

    const adminCheck = verifyAdminSession(session);
    if (adminCheck) return adminCheck;

    const { userId } = await context.params;

    const transactions = await prisma.zapTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50 // Últimas 50 transacciones
    });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        zapTokens: true,
        hearts: true
      }
    });

    return NextResponse.json({
      currentZaps: user?.zapTokens || 0,
      currentHearts: user?.hearts || 0,
      transactions
    });
  } catch (err: any) {
    console.error("Error fetching ZAP transactions:", err);
    return NextResponse.json(
      { error: "Error al obtener transacciones", detail: err.message },
      { status: 500 }
    );
  }
}
