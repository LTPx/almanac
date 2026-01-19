import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserSubscriptionInfo } from "@/lib/subscriptions";
import {
  ZAPS_PER_HEART_PURCHASE,
  MAX_HEARTS
} from "@/lib/constants/gamification";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "userId not found" }, { status: 400 });
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
      Math.floor(user.zapTokens / ZAPS_PER_HEART_PURCHASE),
      MAX_HEARTS - user.hearts
    );

    const subscriptionInfo = await getUserSubscriptionInfo(userId);

    return NextResponse.json({
      subscription: subscriptionInfo,
      gamification: {
        currentZaps: user.zapTokens,
        currentHearts: user.hearts,
        maxHearts: MAX_HEARTS,
        exchangeRate: `${ZAPS_PER_HEART_PURCHASE} ZAPs = 1 Corazón`,
        canPurchase: maxHeartsPurchasable,
        zapCostForOne: ZAPS_PER_HEART_PURCHASE
      }
    });
  } catch (error) {
    console.error("Error obteniendo información:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
