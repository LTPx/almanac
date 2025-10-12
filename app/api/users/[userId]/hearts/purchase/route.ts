import { NextRequest, NextResponse } from "next/server";
import { purchaseHeartWithZaps } from "@/lib/gamification";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await context.params;

    const result = await purchaseHeartWithZaps(userId);

    return NextResponse.json({
      success: true,
      message: "Corazón comprado exitosamente",
      hearts: result.hearts,
      zapTokens: result.zapTokens
    });
  } catch (error: any) {
    console.error("Error purchasing heart:", error);
    return NextResponse.json(
      { error: error.message || "Error al comprar corazón" },
      { status: 400 }
    );
  }
}
