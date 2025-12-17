import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { verifyAdminSession } from "@/lib/admin-auth";
import {
  mintEducationalNFT,
  createNFTMetadata,
  getAvailableNFTImage
} from "@/lib/nft-service";

const CONTRACT_ADDRESS = process.env.THIRDWEB_CONTRACT_ADDRESS!;

interface TestMintRequestBody {
  userId: string;
  curriculumId: string;
  collectionId: string;
  description?: string;
  rarity?: "NORMAL" | "RARE" | "EPIC" | "UNIQUE";
}

/**
 * POST /api/admin/nfts/test-mint
 * Endpoint para que los admins puedan mintear NFTs sin verificar requisitos
 * Bypasea todas las validaciones de tokens y ZAPs para facilitar el testing
 */
export async function POST(request: NextRequest) {
  try {
    // Verificar que el usuario sea admin
    const session = await auth.api.getSession({
      headers: await headers()
    });

    const adminCheck = verifyAdminSession(session);
    if (adminCheck) return adminCheck;

    const {
      userId,
      curriculumId,
      collectionId,
      description,
      rarity
    }: TestMintRequestBody = await request.json();

    // Validar parámetros requeridos
    if (!userId || !curriculumId || !collectionId) {
      return NextResponse.json(
        { error: "userId, curriculumId y collectionId son requeridos" },
        { status: 400 }
      );
    }

    // Obtener información del usuario y curriculum
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    if (!user.walletAddress) {
      return NextResponse.json(
        { error: "Usuario sin walletAddress" },
        { status: 400 }
      );
    }

    const curriculum = await prisma.curriculum.findUnique({
      where: { id: curriculumId }
    });

    if (!curriculum) {
      return NextResponse.json(
        { error: "Curriculum no encontrado" },
        { status: 404 }
      );
    }

    // Obtener fechas de inicio y fin del curriculum (opcional para test)
    const curriculumUnits = await prisma.unit.findMany({
      where: { curriculumId },
      select: { id: true }
    });

    const unitIds = curriculumUnits.map((u) => u.id);

    const userProgressRecords = await prisma.userUnitProgress.findMany({
      where: {
        userId,
        unitId: { in: unitIds }
      },
      orderBy: { createdAt: "asc" }
    });

    const startDate =
      userProgressRecords[0]?.createdAt || new Date();

    const completedRecords = userProgressRecords
      .filter((r) => r.completedAt)
      .sort((a, b) => b.completedAt!.getTime() - a.completedAt!.getTime());

    const endDate =
      completedRecords[0]?.completedAt ||
      userProgressRecords[userProgressRecords.length - 1]?.createdAt ||
      new Date();

    // Obtener imagen NFT (usar rarity especificada o aleatoria)
    const { nftImage, nftImageId, rarityUsed } = await getAvailableNFTImage(
      rarity || "NORMAL",
      collectionId
    );

    // Crear metadatos del NFT
    const metadata = createNFTMetadata({
      courseName: curriculum.title,
      customDescription: description || "NFT de prueba creado por admin",
      rarity: rarityUsed,
      imageUrl: nftImage,
      startDate,
      endDate
    });

    // Mintear el NFT
    const mintResult = await mintEducationalNFT(
      user.walletAddress,
      metadata,
      collectionId
    );

    // Guardar en base de datos
    const savedNFT = await prisma.educationalNFT.create({
      data: {
        tokenId: mintResult.tokenId ?? "",
        userId,
        curriculumId,
        contractAddress: CONTRACT_ADDRESS,
        transactionHash: mintResult.transactionHash,
        metadataUri: mintResult.metadataUri ?? JSON.stringify(metadata),
        mintedAt: new Date(),
        nftAssetId: nftImageId
      }
    });

    // NO deducir ZAPs ni tokens en modo test
    // NO modificar hearts

    return NextResponse.json({
      success: true,
      message: "NFT de prueba minteado exitosamente (sin deducir ZAPs)",
      nft: {
        ...savedNFT,
        metadata
      },
      ...mintResult,
      testMode: true
    });
  } catch (err: any) {
    console.error("Test mint endpoint error:", err);
    return NextResponse.json(
      {
        error: "Error al mintear NFT de prueba",
        detail: err.message
      },
      { status: 500 }
    );
  }
}
