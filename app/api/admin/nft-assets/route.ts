import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { verifyAdminSession } from "@/lib/admin-auth";
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
          },
          collection: {
            select: {
              id: true,
              name: true
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
    // Verificar que el usuario sea admin
    const session = await auth.api.getSession({
      headers: await headers()
    });

    const adminCheck = verifyAdminSession(session);
    if (adminCheck) return adminCheck;

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

    // Verificar que Pinata JWT esté configurado
    if (!process.env.PINATA_JWT) {
      return NextResponse.json(
        {
          error: "Pinata JWT no configurado",
          details:
            "PINATA_JWT no está configurado en las variables de entorno"
        },
        { status: 500 }
      );
    }

    let upload;
    try {
      upload = await pinata.upload.public.file(file, {
        metadata: {
          name: `NFT-${rarity}-${file.name}`,
          keyvalues: { rarity }
        }
      });
    } catch (pinataError: any) {
      console.error("Error de Pinata:", pinataError);
      return NextResponse.json(
        {
          error: "Error al subir archivo a Pinata (IPFS)",
          details: pinataError.message || "Error de autenticación con Pinata",
          suggestion:
            "Verifica que tu PINATA_JWT sea válido y no haya expirado. Puedes obtener uno nuevo en https://pinata.cloud"
        },
        { status: 500 }
      );
    }

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
