import { NextRequest, NextResponse } from "next/server";
import {
  getUserGamificationStats,
  resetHeartsByHours
} from "@/lib/gamification";
import { checkPremiumFeature } from "@/lib/subscriptions";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "No userId found" }, { status: 404 });
  }

  // Regenerar corazones si corresponde
  await resetHeartsByHours(userId);

  const stats = await getUserGamificationStats(userId);
  const isPremium = await checkPremiumFeature(userId);

  try {
    return NextResponse.json({
      isPremium,
      gamification: stats
    });
  } catch (error) {
    console.error("Error al obtener curriculums:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
