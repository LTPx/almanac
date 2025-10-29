import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const nft = await prisma.educationalNFT.findUnique({
      where: { id },
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
            difficulty: true
          }
        },
        nftAsset: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
            rarity: true,
            collectionId: true
          }
        }
      }
    });

    if (!nft) {
      return NextResponse.json({ error: "NFT no encontrado" }, { status: 404 });
    }

    let metadata = null;
    try {
      if (nft.metadataUri.startsWith("{")) {
        metadata = JSON.parse(nft.metadataUri);
      } else if (nft.metadataUri.startsWith("ipfs://")) {
        metadata = await fetchMetadataFromIPFS(nft.metadataUri);
      } else if (nft.metadataUri.startsWith("http")) {
        metadata = await fetchMetadataFromURL(nft.metadataUri);
      }
    } catch (error) {
      console.log(`No se pudo obtener metadata para NFT ${nft.id}:`, error);
    }

    const chain = detectChain(nft.contractAddress);

    const nftDetail = {
      id: nft.id,
      tokenId: nft.tokenId,
      contractAddress: nft.contractAddress,
      transactionHash: nft.transactionHash,
      chain: chain,
      tokenStandard: "ERC721",
      collectionName: "Almanac Educational Certificates",
      owner: nft.user.walletAddress || nft.userId,
      ownerName: nft.user.name || "Unknown",
      ownerEmail: nft.user.email,
      mintedAt: nft.mintedAt.toISOString(),
      curriculum: {
        id: nft.curriculum.id,
        title: nft.curriculum.title,
        difficulty: nft.curriculum.difficulty,
        audienceAgeRange: nft.curriculum.audienceAgeRange
      },
      nftAsset: nft.nftAsset,
      metadata: metadata || {
        name: `Certificate #${nft.tokenId}`,
        description: `Educational certificate for completing ${nft.curriculum.title}`,
        image: nft.nftAsset?.imageUrl || "",
        attributes: [
          {
            trait_type: "Rarity",
            value: nft.nftAsset?.rarity || "NORMAL"
          },
          {
            trait_type: "Course",
            value: nft.curriculum.title
          },
          {
            trait_type: "Difficulty",
            value: nft.curriculum.difficulty
          },
          {
            trait_type: "Completed Date",
            value: nft.mintedAt.toISOString().split("T")[0]
          },
          {
            trait_type: "Type",
            value: "Educational Certificate"
          }
        ]
      },
      collectionId: nft.nftAsset?.collectionId || null
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

async function fetchMetadataFromIPFS(ipfsUri: string): Promise<any> {
  const gateways = [
    "https://gateway.pinata.cloud/ipfs/",
    "https://ipfs.io/ipfs/",
    "https://cloudflare-ipfs.com/ipfs/",
    "https://dweb.link/ipfs/"
  ];

  const ipfsHash = ipfsUri.replace("ipfs://", "");

  for (const gateway of gateways) {
    try {
      const url = `${gateway}${ipfsHash}`;
      console.log(`Intentando fetchear metadata desde: ${url}`);

      const response = await fetch(url, {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(10000)
      });

      if (response.ok) {
        const metadata = await response.json();
        console.log(`Metadata obtenida exitosamente desde ${gateway}`);

        if (metadata.image && metadata.image.startsWith("ipfs://")) {
          metadata.image = metadata.image.replace("ipfs://", gateway);
        }

        return metadata;
      }
    } catch (error) {
      console.log(`Error con gateway ${gateway}:`, error);
      continue;
    }
  }

  throw new Error(`No se pudo obtener metadata desde IPFS: ${ipfsUri}`);
}

async function fetchMetadataFromURL(url: string): Promise<any> {
  try {
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(10000)
    });

    if (response.ok) {
      return await response.json();
    } else {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  } catch (error) {
    console.log(`Error fetching metadata from URL ${url}:`, error);
    throw error;
  }
}
