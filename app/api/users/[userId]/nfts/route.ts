import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await context.params;

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    const allNfts = await prisma.educationalNFT.findMany({
      where: { userId },
      select: {
        id: true,
        nftAssetId: true,
        tokenType: true,
        isTradeable: true,
        linkedCertTokenId: true,
        tokenId: true,
        contractAddress: true,
        transactionHash: true,
        curriculum: {
          select: {
            id: true,
            title: true
          }
        },
        nftAsset: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
            rarity: true
          }
        }
      },
      orderBy: { mintedAt: "desc" }
    });

    // Mapa tokenId -> collectible
    const collectibleMap = new Map<string, typeof allNfts[number]>();
    for (const nft of allNfts) {
      if (nft.tokenType === "COLLECTIBLE" && nft.linkedCertTokenId) {
        collectibleMap.set(nft.linkedCertTokenId, nft);
      }
    }

    const certificates = allNfts.filter((nft) => nft.tokenType === "CERTIFICATE");

    return NextResponse.json({
      success: true,
      nfts: certificates.map((nft) => {
        const collectible = collectibleMap.get(nft.tokenId) ?? null;
        return {
          id: nft.id,
          tokenId: nft.tokenId,
          nftAssetId: nft.nftAssetId,
          name: nft.curriculum.title || nft.nftAsset?.name,
          imageUrl: nft.nftAsset?.imageUrl || null,
          rarity: nft.nftAsset?.rarity,
          tokenType: nft.tokenType,
          collectible: collectible
            ? {
                id: collectible.id,
                tokenId: collectible.tokenId,
                contractAddress: collectible.contractAddress,
                transactionHash: collectible.transactionHash,
                isTradeable: collectible.isTradeable
              }
            : null
        };
      }),
      total: certificates.length,
      source: "database"
    });
  } catch (error: any) {
    console.error("Error fetching user NFTs:", error);
    return NextResponse.json(
      { error: "Internal server error", detail: String(error) },
      { status: 500 }
    );
  }
}

/**
 * Fetchea metadatos desde IPFS usando gateways públicos
 */
// async function fetchMetadataFromIPFS(ipfsUri: string): Promise<any> {
//   // Convertir ipfs:// a HTTP usando diferentes gateways como fallback
//   const gateways = [
//     "https://ipfs.io/ipfs/",
//     "https://gateway.pinata.cloud/ipfs/",
//     "https://cloudflare-ipfs.com/ipfs/",
//     "https://dweb.link/ipfs/"
//   ];

//   const ipfsHash = ipfsUri.replace("ipfs://", "");

//   for (const gateway of gateways) {
//     try {
//       const url = `${gateway}${ipfsHash}`;
//       console.log(`Intentando fetchear metadata desde: ${url}`);

//       const response = await fetch(url, {
//         headers: { Accept: "application/json" },
//         signal: AbortSignal.timeout(10000) // 10 segundos timeout
//       });

//       if (response.ok) {
//         const metadata = await response.json();
//         console.log(`Metadata obtenida exitosamente desde ${gateway}`);

//         // Convertir imagen IPFS a HTTP si es necesario
//         if (metadata.image && metadata.image.startsWith("ipfs://")) {
//           metadata.image = metadata.image.replace("ipfs://", gateway);
//         }

//         return metadata;
//       }
//     } catch (error) {
//       console.log(`Error con gateway ${gateway}:`, error);
//       continue; // Intentar siguiente gateway
//     }
//   }

//   throw new Error(`No se pudo obtener metadata desde IPFS: ${ipfsUri}`);
// }

/**
 * Fetchea metadatos desde URL HTTP
 */
// async function fetchMetadataFromURL(url: string): Promise<any> {
//   try {
//     const response = await fetch(url, {
//       headers: { Accept: "application/json" },
//       signal: AbortSignal.timeout(10000)
//     });

//     if (response.ok) {
//       return await response.json();
//     } else {
//       throw new Error(`HTTP ${response.status}: ${response.statusText}`);
//     }
//   } catch (error) {
//     console.log(`Error fetching metadata from URL ${url}:`, error);
//     throw new Error(`No se pudo obtener metadata desde URL: ${url}`);
//   }
// }
