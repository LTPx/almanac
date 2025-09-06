import { NextRequest, NextResponse } from "next/server";
import { dailyHeartResetCronJob } from "@/lib/gamification";

export async function POST(request: NextRequest) {
  try {
    // Verificar autorización (puedes usar una API key secreta)
    const authHeader = request.headers.get("authorization");
    const expectedKey = process.env.CRON_SECRET_KEY;

    if (!expectedKey || authHeader !== `Bearer ${expectedKey}`) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const result = await dailyHeartResetCronJob();

    return NextResponse.json({
      success: true,
      message: "Reseteo de corazones completado",
      ...result
    });
  } catch (error) {
    console.error("Error in daily heart reset:", error);
    return NextResponse.json(
      { error: "Error en reseteo diario de corazones" },
      { status: 500 }
    );
  }
}
