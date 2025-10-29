import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ collectionId: string }> }
) {
  try {
    const { collectionId } = await context.params;

    const { searchParams } = request.nextUrl;
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? parseInt(limitParam, 10) : undefined;

    const nfts = await prisma.nFTAsset.findMany({
      where: { collectionId, isUsed: false },
      select: {
        id: true,
        name: true,
        imageUrl: true,
        rarity: true
      },
      take: limit
    });

    return NextResponse.json({ nfts });
  } catch (error) {
    console.error("Error fetching collection nfts:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
