import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  const { userId } = params;

  try {
    const nfts = await prisma.educationalNFT.findMany({
      where: { userId },
      include: {
        user: {
          select: { name: true }
        }
      },
      orderBy: { mintedAt: "desc" }
    });

    return NextResponse.json({
      nfts: nfts,
      total: nfts.length
    });
  } catch (error) {
    console.error("Error fetching user NFTs:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
