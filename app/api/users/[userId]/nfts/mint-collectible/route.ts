import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { mintCollectibleNFT, createNFTMetadata } from "@/lib/nft-service";

const COLLECTIBLE_CONTRACT_ADDRESS = process.env.COLLECTIBLE_CONTRACT_ADDRESS!;

interface MintCollectibleRequestBody {
  certificateNftId: string;
}

/**
 * POST /api/users/[userId]/nfts/mint-collectible
 * Mintea un coleccionable tradeable vinculado a un certificado existente.
 * Verifica ownership del certificado y relacion 1:1.
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await context.params;
    const { certificateNftId }: MintCollectibleRequestBody =
      await request.json();

    if (!certificateNftId) {
      return NextResponse.json(
        { error: "certificateNftId es requerido" },
        { status: 400 }
      );
    }

    // 1) Verificar que el usuario existe y tiene wallet
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

    // 2) Verificar que el usuario posee el certificado
    const certificate = await prisma.educationalNFT.findFirst({
      where: {
        id: certificateNftId,
        userId,
        tokenType: "CERTIFICATE"
      },
      include: {
        curriculum: true,
        collection: true,
        nftAsset: true
      }
    });

    if (!certificate) {
      return NextResponse.json(
        { error: "Certificado no encontrado o no pertenece al usuario" },
        { status: 404 }
      );
    }

    // 3) Verificar relacion 1:1: no existe ya un coleccionable para este certificado
    const existingCollectible = await prisma.educationalNFT.findFirst({
      where: {
        linkedCertTokenId: certificate.tokenId,
        tokenType: "COLLECTIBLE"
      }
    });

    if (existingCollectible) {
      return NextResponse.json(
        { error: "Ya existe un coleccionable para este certificado" },
        { status: 409 }
      );
    }

    // 4) Obtener coleccion y datos del artista
    const collection = certificate.collection;
    if (!collection) {
      return NextResponse.json(
        { error: "Colección no encontrada para este certificado" },
        { status: 404 }
      );
    }

    const artistAddress = collection.defaultArtistAddress;
    const royaltyBps = collection.defaultRoyaltyBps ?? 500;

    if (!artistAddress) {
      return NextResponse.json(
        { error: "La colección no tiene artistAddress configurada" },
        { status: 400 }
      );
    }

    // 5) Reusar la imagen del certificado
    const nftImage = certificate.nftAsset?.imageUrl;
    const rarityUsed = (certificate.nftAsset?.rarity ?? "NORMAL") as import("@/lib/nft-service").Rarity;

    if (!nftImage) {
      return NextResponse.json(
        { error: "El certificado no tiene imagen asociada" },
        { status: 400 }
      );
    }

    // 6) Crear metadatos del coleccionable
    const metadata = createNFTMetadata({
      courseName: certificate.curriculum.title,
      rarity: rarityUsed,
      imageUrl: nftImage,
      collectionName: collection.name,
      customDescription: `Coleccionable "${certificate.curriculum.title}" - Tradeable NFT`,
      startDate: certificate.curriculumStartedAt ?? undefined,
      endDate: certificate.curriculumFinishedAt ?? undefined
    });

    // 7) Mintear coleccionable via contrato custom
    const mintResult = await mintCollectibleNFT({
      walletAddress: user.walletAddress,
      metadata,
      collectionId: collection.id,
      linkedCertTokenId: parseInt(certificate.tokenId),
      authorWallet: artistAddress,
      royaltyBps
    });

    // 8) Guardar en DB
    const savedNFT = await prisma.educationalNFT.create({
      data: {
        tokenId: mintResult.tokenId,
        userId,
        curriculumId: certificate.curriculumId,
        contractAddress: COLLECTIBLE_CONTRACT_ADDRESS,
        transactionHash: mintResult.transactionHash,
        metadataUri: mintResult.metadataUri,
        mintedAt: new Date(),
        collectionId: collection.id,
        curriculumStartedAt: certificate.curriculumStartedAt,
        curriculumFinishedAt: certificate.curriculumFinishedAt,
        tokenType: "COLLECTIBLE",
        isTradeable: true,
        linkedCertTokenId: certificate.tokenId,
        artistAddress,
        royaltyBps
      }
    });

    return NextResponse.json({
      success: true,
      nft: {
        ...savedNFT,
        metadata
      },
      ...mintResult
    });
  } catch (err: any) {
    console.error("mint-collectible endpoint error:", err);

    const reason: string =
      err?.error?.reason ?? err?.reason ?? String(err);

    if (reason.includes("certificate already claimed")) {
      return NextResponse.json(
        { error: "Este certificado ya tiene una versión tradeable en la blockchain. Puede que la transacción anterior se completó pero no se guardó en la base de datos." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error", detail: String(err) },
      { status: 500 }
    );
  }
}
