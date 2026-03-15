import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { PinataSDK } from "pinata";

const PINATA_GATEWAY = process.env.PINATA_GATEWAY || "gateway.pinata.cloud";

const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT!,
  pinataGateway: PINATA_GATEWAY
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rarity = searchParams.get("rarity");
    const isUsed = searchParams.get("isUsed");
    const collectionId = searchParams.get("collectionId");
    const limit = searchParams.get("limit");
    const page = searchParams.get("page") || "1";

    const where: any = {};

    if (rarity && rarity !== "all") {
      where.rarity = rarity;
    }

    if (isUsed !== null && isUsed !== "all") {
      where.isUsed = isUsed === "true";
    }

    if (collectionId && collectionId !== "all") {
      where.collectionId = collectionId;
    }

    const pageNumber = parseInt(page);
    const limitNumber = limit ? parseInt(limit) : 50;
    const skip = (pageNumber - 1) * limitNumber;

    const [nftAssets, total] = await Promise.all([
      prisma.nFTAsset.findMany({
        where,
        include: {
          educationalNFT: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            }
          },
          collection: {
            select: {
              id: true,
              name: true
            }
          },
          curriculum: {
            select: {
              id: true,
              title: true
            }
          }
        },
        orderBy: {
          createdAt: "desc"
        },
        skip,
        take: limitNumber
      }),
      prisma.nFTAsset.count({ where })
    ]);

    // Fetch collectibles linked to the certificates in this page
    const certTokenIds = nftAssets
      .filter((a) => a.educationalNFT?.tokenType === "CERTIFICATE")
      .map((a) => a.educationalNFT!.tokenId);

    const collectibles =
      certTokenIds.length > 0
        ? await prisma.educationalNFT.findMany({
            where: {
              tokenType: "COLLECTIBLE",
              linkedCertTokenId: { in: certTokenIds }
            },
            select: {
              tokenId: true,
              contractAddress: true,
              linkedCertTokenId: true,
              transactionHash: true
            }
          })
        : [];

    const collectibleByCertTokenId = Object.fromEntries(
      collectibles.map((c) => [c.linkedCertTokenId, c])
    );

    const enrichedAssets = nftAssets.map((asset) => ({
      ...asset,
      collectibleNFT:
        asset.educationalNFT?.tokenType === "CERTIFICATE"
          ? (collectibleByCertTokenId[asset.educationalNFT.tokenId] ?? null)
          : null
    }));

    const stats = await prisma.nFTAsset.groupBy({
      by: ["rarity", "isUsed"],
      _count: true
    });

    return NextResponse.json({
      nftAssets: enrichedAssets,
      pagination: {
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(total / limitNumber)
      },
      stats
    });
  } catch (error) {
    console.error("Error al obtener NFT Assets:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const rarity = formData.get("rarity") as string;
    const metadataUri = formData.get("metadataUri") as string | null;
    const name = formData.get("name") as string | null;
    const collectionId = formData.get("collectionId") as string | null;

    if (!file || !rarity) {
      return NextResponse.json(
        { error: "file y rarity son requeridos" },
        { status: 400 }
      );
    }

    const validRarities = ["NORMAL", "RARE", "EPIC", "UNIQUE"];

    if (!validRarities.includes(rarity)) {
      return NextResponse.json(
        {
          error:
            "Rareza inválida. Valores permitidos: NORMAL, RARE, EPIC, UNIQUE"
        },
        { status: 400 }
      );
    }

    const upload = await pinata.upload.public.file(file, {
      metadata: {
        name: `NFT-${rarity}-${file.name}`,
        keyvalues: { rarity }
      }
    });

    const imageUrl = `https://${PINATA_GATEWAY}/ipfs/${upload.cid}`;
    const nftAsset = await prisma.nFTAsset.create({
      data: {
        name: name || "",
        imageUrl,
        rarity: rarity as any,
        metadataUri,
        isUsed: false,
        collectionId
      }
    });

    return NextResponse.json(
      { message: "NFT Asset subido exitosamente", nftAsset },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error al subir NFT:", error.details || error);
    return NextResponse.json(
      {
        error: "Error interno del servidor",
        details: (error as Error).message
      },
      { status: 500 }
    );
  }
}
