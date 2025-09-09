import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  const { userId } = await context.params;

  try {
    const unitTokens = await prisma.userUnitToken.findMany({
      where: {},
      include: {
        unit: true
      }
    });

    // Obtener NFTs existentes del usuario
    const existingNFTs = await prisma.educationalNFT.findMany({
      where: { userId },
      select: { unitId: true }
    });

    const existingNFTUnitIds = existingNFTs.map((nft) => nft.unitId);

    // Mapear a formato requerido
    const units = unitTokens.map((p) => ({
      unitId: p.unit.id,
      unitName: p.unit.name,
      courseName: p.unit.name,
      completedAt: p.unit.createdAt?.toISOString() || new Date().toISOString(),
      hasNFT: existingNFTUnitIds.includes(`${p.unit.id}`)
    }));

    return NextResponse.json({ units });
  } catch (error) {
    console.error("Error fetching completed units:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
