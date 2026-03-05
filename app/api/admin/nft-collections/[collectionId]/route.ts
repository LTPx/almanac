import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { verifyAdminSession } from "@/lib/admin-auth";

// GET - Obtener una collection
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ collectionId: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    const adminCheck = verifyAdminSession(session);
    if (adminCheck) return adminCheck;

    const { collectionId } = await context.params;

    const collection = await prisma.nFTCollection.findUnique({
      where: { id: collectionId },
      include: {
        _count: {
          select: {
            nftAssets: true,
            educationalNFTs: true
          }
        }
      }
    });

    if (!collection) {
      return NextResponse.json(
        { error: "Colección no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(collection);
  } catch (error) {
    console.error("Error fetching collection:", error);
    return NextResponse.json(
      { error: "Error al obtener colección" },
      { status: 500 }
    );
  }
}

// PATCH - Actualizar una collection
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ collectionId: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    const adminCheck = verifyAdminSession(session);
    if (adminCheck) return adminCheck;

    const { collectionId } = await context.params;
    const body = await request.json();

    const currentCollection = await prisma.nFTCollection.findUnique({
      where: { id: collectionId }
    });

    if (!currentCollection) {
      return NextResponse.json(
        { error: "Colección no encontrada" },
        { status: 404 }
      );
    }

    const {
      name,
      symbol,
      description,
      contractAddress,
      chainId,
      isActive,
      defaultArtistAddress,
      defaultRoyaltyBps,
      maxSupply,
      certificateContractAddress,
      collectibleContractAddress
    } = body;

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (symbol !== undefined) updateData.symbol = symbol;
    if (description !== undefined) updateData.description = description;
    if (contractAddress !== undefined)
      updateData.contractAddress = contractAddress;
    if (chainId !== undefined) updateData.chainId = chainId;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (defaultArtistAddress !== undefined)
      updateData.defaultArtistAddress = defaultArtistAddress;
    if (defaultRoyaltyBps !== undefined)
      updateData.defaultRoyaltyBps = defaultRoyaltyBps;
    if (maxSupply !== undefined) updateData.maxSupply = maxSupply;
    if (certificateContractAddress !== undefined)
      updateData.certificateContractAddress = certificateContractAddress;
    if (collectibleContractAddress !== undefined)
      updateData.collectibleContractAddress = collectibleContractAddress;

    const collection = await prisma.nFTCollection.update({
      where: { id: collectionId },
      data: updateData,
      include: {
        _count: {
          select: {
            nftAssets: true,
            educationalNFTs: true
          }
        }
      }
    });

    return NextResponse.json(collection);
  } catch (error) {
    console.error("Error updating collection:", error);
    return NextResponse.json(
      { error: "Error al actualizar colección" },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar una collection
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ collectionId: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    const adminCheck = verifyAdminSession(session);
    if (adminCheck) return adminCheck;

    const { collectionId } = await context.params;

    const collection = await prisma.nFTCollection.findUnique({
      where: { id: collectionId },
      include: {
        _count: {
          select: {
            nftAssets: true,
            educationalNFTs: true
          }
        }
      }
    });

    if (!collection) {
      return NextResponse.json(
        { error: "Colección no encontrada" },
        { status: 404 }
      );
    }

    if (
      collection._count.nftAssets > 0 ||
      collection._count.educationalNFTs > 0
    ) {
      return NextResponse.json(
        {
          error:
            "No se puede eliminar una colección que tiene NFTs o assets asociados"
        },
        { status: 400 }
      );
    }

    await prisma.nFTCollection.delete({
      where: { id: collectionId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting collection:", error);
    return NextResponse.json(
      { error: "Error al eliminar colección" },
      { status: 500 }
    );
  }
}
