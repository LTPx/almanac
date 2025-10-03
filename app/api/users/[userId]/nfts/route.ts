import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await context.params;

    // Verificar que el usuario existe
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Obtener todos los NFTs del usuario desde la DB
    const nfts = await prisma.educationalNFT.findMany({
      where: { userId },
      orderBy: { mintedAt: "desc" }
    });

    // Enriquecer con metadatos fetcheados de IPFS
    const enrichedNFTs = await Promise.all(
      nfts.map(async (nft) => {
        let metadata = null;

        try {
          // Si metadataUri es JSON stringificado, parsearlo
          if (nft.metadataUri.startsWith("{")) {
            metadata = JSON.parse(nft.metadataUri);
          }
          // Si es IPFS URI, fetchear los metadatos
          else if (nft.metadataUri.startsWith("ipfs://")) {
            metadata = await fetchMetadataFromIPFS(nft.metadataUri);
          }
          // Si es HTTP URL, fetchear directamente
          else if (nft.metadataUri.startsWith("http")) {
            metadata = await fetchMetadataFromURL(nft.metadataUri);
          }
        } catch (error) {
          console.log(`No se pudo obtener metadata para NFT ${nft.id}:`, error);
        }

        return {
          ...nft,
          metadata
        };
      })
    );

    return NextResponse.json({
      success: true,
      nfts: enrichedNFTs,
      total: enrichedNFTs.length,
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
async function fetchMetadataFromIPFS(ipfsUri: string): Promise<any> {
  // Convertir ipfs:// a HTTP usando diferentes gateways como fallback
  const gateways = [
    "https://ipfs.io/ipfs/",
    "https://gateway.pinata.cloud/ipfs/",
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
        signal: AbortSignal.timeout(10000) // 10 segundos timeout
      });

      if (response.ok) {
        const metadata = await response.json();
        console.log(`Metadata obtenida exitosamente desde ${gateway}`);

        // Convertir imagen IPFS a HTTP si es necesario
        if (metadata.image && metadata.image.startsWith("ipfs://")) {
          metadata.image = metadata.image.replace("ipfs://", gateway);
        }

        return metadata;
      }
    } catch (error) {
      console.log(`Error con gateway ${gateway}:`, error);
      continue; // Intentar siguiente gateway
    }
  }

  throw new Error(`No se pudo obtener metadata desde IPFS: ${ipfsUri}`);
}

/**
 * Fetchea metadatos desde URL HTTP
 */
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
    throw new Error(`No se pudo obtener metadata desde URL: ${url}`);
  }
}
