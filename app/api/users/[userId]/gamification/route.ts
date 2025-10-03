import { NextRequest, NextResponse } from "next/server";
import { getUserGamificationStats, resetDailyHearts } from "@/lib/gamification";

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;

    // Intentar reseteo automático de corazones
    await resetDailyHearts(userId);

    // Obtener estadísticas
    const stats = await getUserGamificationStats(userId);

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching gamification stats:", error);
    return NextResponse.json(
      { error: "Error al obtener estadísticas de gamificación" },
      { status: 500 }
    );
  }
}
