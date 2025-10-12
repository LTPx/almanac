import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  mintEducationalNFT,
  createNFTMetadata,
  getAvailableNFTImage,
  getRandomRarity
} from "@/lib/nft-service";

const CONTRACT_ADDRESS = process.env.THIRDWEB_CONTRACT_ADDRESS!;

interface MintRequestBody {
  unitId?: string | number;
  tokenUnit?: string | number;
  description?: string;
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await context.params;
    const body: MintRequestBody = await request.json();
    const unitId = body.unitId ?? body.tokenUnit;
    const description = body.description;

    if (!unitId) {
      return NextResponse.json(
        { error: "unitId es requerido" },
        { status: 400 }
      );
    }

    // 1) Validar usuario y tokens disponibles
    const validationResult = await validateUserAndTokens(
      userId,
      Number(unitId)
    );

    if (validationResult.error) {
      return NextResponse.json(
        { error: validationResult.error },
        { status: validationResult.status }
      );
    }

    const { user, userUnitToken } = validationResult.data!;

    // 2) Crear metadatos del NFT con descripción personalizada
    const courseName = "Almanac";
    const unitName = userUnitToken.unit.name;
    // const rarity = "NORMAL";
    const rarity = getRandomRarity();
    const { nftImage, nftImageId, rarityUsed } =
      await getAvailableNFTImage(rarity);

    const metadata = createNFTMetadata({
      courseName,
      unitName,
      customDescription: description,
      rarity: rarityUsed,
      imageUrl: nftImage
    });

    // 3) Mintear el NFT
    const mintResult = await mintEducationalNFT(user.walletAddress!, metadata);

    // 4) Guardar en base de datos
    const savedNFT = await saveNFTToDatabase({
      userId,
      unitId: String(unitId),
      userUnitToken,
      mintResult,
      metadata,
      nftImageId
    });

    // 5) IMPORTANTE: Devolver el NFT con los metadatos incluidos
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

async function validateUserAndTokens(userId: string, unitId: number) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { userUnitTokens: { include: { unit: true } } }
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

  const userUnitToken = user.userUnitTokens.find((t) => t.unitId === unitId);

  if (!userUnitToken || userUnitToken.quantity <= 0) {
    return {
      error: "No hay tokens disponibles para esta unidad",
      status: 400,
      data: null
    };
  }

  return {
    error: null,
    status: 200,
    data: { user, userUnitToken }
  };
}

async function saveNFTToDatabase({
  userId,
  unitId,
  userUnitToken,
  mintResult,
  metadata,
  nftImageId
}: {
  userId: string;
  unitId: string;
  userUnitToken: any;
  mintResult: any;
  metadata: any;
  nftImageId: number;
}) {
  const now = new Date();

  return prisma.$transaction(async (tx) => {
    const newQuantity = userUnitToken.quantity - 1;

    if (newQuantity <= 0) {
      await tx.userUnitToken.delete({ where: { id: userUnitToken.id } });
    } else {
      await tx.userUnitToken.update({
        where: { id: userUnitToken.id },
        data: { quantity: newQuantity, updatedAt: now }
      });
    }

    return tx.educationalNFT.create({
      data: {
        tokenId: mintResult.tokenId ?? "",
        userId,
        unitId,
        contractAddress: CONTRACT_ADDRESS,
        transactionHash: mintResult.transactionHash,
        metadataUri: mintResult.metadataUri ?? JSON.stringify(metadata),
        mintedAt: now,
        nftAssetId: nftImageId
      }
    });
  });
}
