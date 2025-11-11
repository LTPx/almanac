import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  const { userId } = await context.params;

  try {
    const curriculumTokens = await prisma.userCurriculumToken.findMany({
      where: {
        userId
      },
      include: {
        curriculum: true
      }
    });

    // Obtener NFTs existentes del usuario
    const existingNFTs = await prisma.educationalNFT.findMany({
      where: { userId },
      select: { curriculumId: true }
    });

    const existingNFTCurriculumIds = existingNFTs.map(
      (nft) => nft.curriculumId
    );

    // Mapear a formato requerido
    const curriculums = curriculumTokens.map((p) => ({
      unitId: p.curriculum.id,
      unitName: p.curriculum.title,
      courseName: p.curriculum.title,
      completedAt:
        p.curriculum.createdAt?.toISOString() || new Date().toISOString(),
      hasNFT: existingNFTCurriculumIds.includes(`${p.curriculum.id}`)
    }));

    const collections = await prisma.nFTCollection.findMany({
      where: { isActive: true },
      include: {
        nftAssets: {
          where: {
            isUsed: false
          },
          take: 5,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            imageUrl: true,
            name: true
          }
        }
      }
    });

    const nftsAvailable = collections.flatMap(
      (collection) => collection.nftAssets
    );

    return NextResponse.json({ curriculums, collections, nftsAvailable });
  } catch (error) {
    console.error("Error fetching completed curriculums:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
