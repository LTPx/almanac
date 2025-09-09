import { NextRequest, NextResponse } from "next/server";
import { mintEducationalNFT } from "@/lib/nft-service";
import prisma from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  const { userId } = await context.params;

  try {
    const { unitId } = await request.json();

    if (!unitId || !userId) {
      return NextResponse.json(
        { error: "unitId, userId are required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        id: userId
      }
    });

    if (!user || !user.walletAddress) {
      return NextResponse.json({ error: "user not found" }, { status: 404 });
    }

    const unitToken = await prisma.userUnitToken.findUnique({
      where: {
        userId_unitId: {
          userId,
          unitId: parseInt(unitId)
        }
      },
      include: {
        unit: true
      }
    });

    console.log("userId: ", userId);
    console.log("unitId: ", parseInt(unitId));

    if (!unitToken) {
      return NextResponse.json(
        { error: "unit token not found" },
        { status: 404 }
      );
    }

    const { unit } = unitToken;

    // Mintear NFT
    const nftData = await mintEducationalNFT({
      userAddress: user.walletAddress,
      unitName: unit.name,
      courseName: "Almanac test",
      userId,
      unitId: `${unit.id}`,
      userLevel: 1
    });

    return NextResponse.json({
      message: "🎉 ¡Unidad completada y certificado obtenido!",
      nft: nftData,
      level: 1,
      courseName: "Almanac test",
      unitName: unit.name
    });
  } catch (error) {
    console.error("Error mint nft:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
