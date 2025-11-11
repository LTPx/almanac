import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ nftId: string }> }
) {
  try {
    const { nftId } = await context.params;

    const nft = await prisma.educationalNFT.findUnique({
      where: { id: nftId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            walletAddress: true
          }
        },
        curriculum: {
          select: {
            id: true,
            title: true,
            audienceAgeRange: true,
            difficulty: true,
            units: {
              select: {
                name: true
              }
            }
          }
        },
        nftAsset: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
            rarity: true,
            collection: {
              select: {
                id: true,
                name: true,
                description: true
              }
            }
          }
        }
      }
    });

    if (!nft) {
      return NextResponse.json({ error: "NFT no encontrado" }, { status: 404 });
    }

    const chain = detectChain(nft.contractAddress);

    const nftDetail = {
      id: nft.id,
      tokenId: nft.tokenId,
      contractAddress: nft.contractAddress,
      transactionHash: nft.transactionHash,
      chain: chain,
      tokenStandard: "ERC721",
      collectionName: nft.nftAsset?.collection?.name || null,
      owner: nft.user.walletAddress || nft.userId,
      ownerName: nft.user.name || "Unknown",
      ownerEmail: nft.user.email,
      mintedAt: nft.mintedAt.toISOString(),
      curriculum: {
        id: nft.curriculum.id,
        title: nft.curriculum.title,
        difficulty: nft.curriculum.difficulty,
        audienceAgeRange: nft.curriculum.audienceAgeRange,
        units: nft.curriculum.units.map((unit) => unit.name)
      },
      nftAsset: nft.nftAsset,
      collectionId: nft.nftAsset?.collection?.id || null
    };

    return NextResponse.json(nftDetail);
  } catch (error: any) {
    console.error("Error fetching NFT detail:", error);
    return NextResponse.json(
      { error: "Error al cargar el NFT", detail: error.message },
      { status: 500 }
    );
  }
}

function detectChain(contractAddress: string): string {
  if (!contractAddress) return "Unknown";
  const lowerAddress = contractAddress.toLowerCase();

  if (lowerAddress.startsWith("0x") && lowerAddress.length === 42) {
    return "Polygon";
  }

  return "Ethereum";
}
