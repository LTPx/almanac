import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  mintEducationalNFT,
  createNFTMetadata,
  getAvailableNFTImage,
  getRandomRarity
} from "@/lib/nft-service";
import { MINT_NFT_ZAPS } from "@/lib/constants/gamification";

const CONTRACT_ADDRESS = process.env.THIRDWEB_CONTRACT_ADDRESS!;

interface MintRequestBody {
  curriculumTokenId?: string;
  tokenUnit?: string | number;
  collectionId: string;
  description?: string;
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await context.params;
    const { curriculumTokenId, description, collectionId }: MintRequestBody =
      await request.json();

    if (!curriculumTokenId) {
      return NextResponse.json(
        { error: "curriculumTokenId es requerido" },
        { status: 400 }
      );
    }

    if (!collectionId) {
      return NextResponse.json(
        { error: "collectionId es requerido" },
        { status: 400 }
      );
    }

    // 1) Validar usuario y tokens disponibles
    const validationResult = await validateUserAndTokens(
      userId,
      curriculumTokenId
    );

    if (validationResult.error) {
      return NextResponse.json(
        { error: validationResult.error },
        { status: validationResult.status }
      );
    }

    const { user, userCurriculumToken } = validationResult.data!;

    // 2) Obtener fechas de inicio y fin del curriculum desde userUnitProgress
    const curriculumUnits = await prisma.unit.findMany({
      where: { curriculumId: curriculumTokenId },
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

    // Fecha de inicio: el createdAt más antiguo
    const startDate = userProgressRecords[0]?.createdAt;

    // Fecha de fin: el completedAt más reciente (o createdAt si no hay completedAt)
    const completedRecords = userProgressRecords
      .filter((r) => r.completedAt)
      .sort((a, b) => b.completedAt!.getTime() - a.completedAt!.getTime());

    const endDate =
      completedRecords[0]?.completedAt ||
      userProgressRecords[userProgressRecords.length - 1]?.createdAt;

    // 3) Crear metadatos del NFT con descripción personalizada
    const courseName = userCurriculumToken.curriculum.title;
    // const unitName = userCurriculumToken.curriculum.title;
    const rarity = getRandomRarity();
    const { nftImage, nftImageId, rarityUsed } = await getAvailableNFTImage(
      rarity,
      collectionId
    );

    const metadata = createNFTMetadata({
      courseName,
      // unitName,
      customDescription: description,
      rarity: rarityUsed,
      imageUrl: nftImage,
      startDate,
      endDate
    });

    // 3) Mintear el NFT
    const mintResult = await mintEducationalNFT(
      user.walletAddress!,
      metadata,
      collectionId
    );

    // 4) Guardar en base de datos
    const savedNFT = await saveNFTToDatabase({
      userId,
      curriculumId: curriculumTokenId,
      userCurriculumToken,
      mintResult,
      metadata,
      nftImageId,
      startDate,
      endDate
    });

    // 5) Spend zaps
    await prisma.zapTransaction.create({
      data: {
        userId,
        type: "ADMIN_ADJUSTMENT",
        amount: -MINT_NFT_ZAPS,
        reason: "ZAPs gastados en mintear NFT"
      }
    });

    await prisma.user.update({
      where: { id: userId },
      data: {
        hearts: { increment: 1 },
        zapTokens: { decrement: 100 }
      }
    });

    // 6) IMPORTANTE: Devolver el NFT con los metadatos incluidos
    return NextResponse.json({
      success: true,
      nft: {
        ...savedNFT,
        metadata: metadata // Incluir metadatos directamente
      },
      ...mintResult
    });
  } catch (err: any) {
    console.error("mint endpoint error:", err);
    return NextResponse.json(
      { error: "Internal server error", detail: String(err) },
      { status: 500 }
    );
  }
}

async function validateUserAndTokens(
  userId: string,
  curriculumTokenId: string
) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { userCurriculumTokens: { include: { curriculum: true } } }
  });

  if (!user) {
    return {
      error: "Usuario no encontrado",
      status: 404,
      data: null
    };
  }

  if (!user.walletAddress) {
    return {
      error: "Usuario sin walletAddress",
      status: 400,
      data: null
    };
  }

  if (user.zapTokens < 100) {
    return {
      error: "Zaps insuficientes",
      status: 400,
      data: null
    };
  }

  const userCurriculumToken = user.userCurriculumTokens.find(
    (t) => t.curriculumId === curriculumTokenId
  );

  if (!userCurriculumToken || userCurriculumToken.quantity <= 0) {
    return {
      error: "No hay tokens disponibles para esta unidad",
      status: 400,
      data: null
    };
  }

  return {
    error: null,
    status: 200,
    data: { user, userCurriculumToken }
  };
}

async function saveNFTToDatabase({
  userId,
  curriculumId,
  userCurriculumToken,
  mintResult,
  metadata,
  nftImageId,
  startDate,
  endDate
}: {
  userId: string;
  curriculumId: string;
  userCurriculumToken: any;
  mintResult: any;
  metadata: any;
  nftImageId: number;
  startDate: Date | undefined;
  endDate: Date | undefined;
}) {
  const now = new Date();

  return prisma.$transaction(async (tx) => {
    const newQuantity = userCurriculumToken.quantity - 1;

    if (newQuantity <= 0) {
      await tx.userCurriculumToken.delete({
        where: { id: userCurriculumToken.id }
      });
    } else {
      await tx.userCurriculumToken.update({
        where: { id: userCurriculumToken.id },
        data: { quantity: newQuantity, updatedAt: now }
      });
    }

    return tx.educationalNFT.create({
      data: {
        tokenId: mintResult.tokenId ?? "",
        userId,
        curriculumId,
        contractAddress: CONTRACT_ADDRESS,
        transactionHash: mintResult.transactionHash,
        metadataUri: mintResult.metadataUri ?? JSON.stringify(metadata),
        mintedAt: now,
        nftAssetId: nftImageId,
        curriculumStartedAt: startDate,
        curriculumFinishedAt: endDate
      }
    });
  });
}
