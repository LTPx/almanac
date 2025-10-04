import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rarity = searchParams.get("rarity");
    const isUsed = searchParams.get("isUsed");
    const limit = searchParams.get("limit");
    const page = searchParams.get("page") || "1";

    const where: any = {};

    if (rarity && rarity !== "all") {
      where.rarity = rarity;
    }

    if (isUsed !== null && isUsed !== "all") {
      where.isUsed = isUsed === "true";
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

    const stats = await prisma.nFTAsset.groupBy({
      by: ["rarity", "isUsed"],
      _count: true
    });

    return NextResponse.json({
      nftAssets,
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
    const body = await request.json();
    const { imageUrl, rarity, metadataUri } = body;

    if (!imageUrl || !rarity) {
      return NextResponse.json(
        { error: "imageUrl y rarity son requeridos" },
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

    try {
      new URL(imageUrl);
    } catch {
      return NextResponse.json(
        { error: "imageUrl debe ser una URL válida" },
        { status: 400 }
      );
    }

    if (metadataUri) {
      if (
        !metadataUri.startsWith("ipfs://") &&
        !metadataUri.startsWith("http")
      ) {
        return NextResponse.json(
          {
            error:
              "metadataUri debe ser una URL válida o un URI de IPFS (ipfs://...)"
          },
          { status: 400 }
        );
      }
    }

    const nftAsset = await prisma.nFTAsset.create({
      data: {
        imageUrl,
        rarity,
        metadataUri,
        isUsed: false
      }
    });

    return NextResponse.json(
      {
        message: "NFT Asset creado exitosamente",
        nftAsset
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error al crear NFT Asset:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
