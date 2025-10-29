import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET - Obtener una colección por ID
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ collectionId: string }> }
) {
  try {
    const { collectionId } = await context.params;
    const collection = await prisma.nFTCollection.findUnique({
      where: { id: collectionId },
      include: {
        _count: {
          select: {
            educationalNFTs: true,
            nftAssets: true,
            curriculums: true
          }
        }
      }
    });

    if (!collection) {
      return NextResponse.json(
        { message: "Colección no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json({ collection });
  } catch (error) {
    console.error("Error fetching collection:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT - Actualizar colección
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ collectionId: string }> }
) {
  try {
    const { collectionId } = await context.params;
    const body = await request.json();
    const { name, symbol, description, contractAddress, chainId, isActive } =
      body;

    // Validaciones
    if (!name?.trim()) {
      return NextResponse.json(
        { message: "El nombre es requerido" },
        { status: 400 }
      );
    }

    if (!symbol?.trim()) {
      return NextResponse.json(
        { message: "El símbolo es requerido" },
        { status: 400 }
      );
    }

    if (!contractAddress?.trim()) {
      return NextResponse.json(
        { message: "La dirección del contrato es requerida" },
        { status: 400 }
      );
    }

    // Validar formato de dirección
    if (!contractAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      return NextResponse.json(
        { message: "Dirección de contrato inválida" },
        { status: 400 }
      );
    }

    // Verificar que la colección existe
    const existingCollection = await prisma.nFTCollection.findUnique({
      where: { id: collectionId }
    });

    if (!existingCollection) {
      return NextResponse.json(
        { message: "Colección no encontrada" },
        { status: 404 }
      );
    }

    // Verificar que no exista otra colección con esa dirección
    const duplicateCollection = await prisma.nFTCollection.findFirst({
      where: {
        contractAddress: contractAddress.toLowerCase(),
        id: { not: collectionId }
      }
    });

    if (duplicateCollection) {
      return NextResponse.json(
        { message: "Ya existe otra colección con esa dirección de contrato" },
        { status: 400 }
      );
    }

    // Actualizar colección
    const collection = await prisma.nFTCollection.update({
      where: { id: collectionId },
      data: {
        name: name.trim(),
        symbol: symbol.trim().toUpperCase(),
        description: description?.trim() || null,
        contractAddress: contractAddress.toLowerCase(),
        chainId: chainId || 80002,
        isActive: isActive ?? true
      }
    });

    return NextResponse.json({
      message: "Colección actualizada exitosamente",
      collection
    });
  } catch (error) {
    console.error("Error updating collection:", error);
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar colección
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ collectionId: string }> }
) {
  try {
    const { collectionId } = await context.params;
    // Verificar que no tenga NFTs asociados
    const nftCount = await prisma.educationalNFT.count({
      where: { collectionId: collectionId }
    });

    if (nftCount > 0) {
      return NextResponse.json(
        {
          message: `No se puede eliminar. La colección tiene ${nftCount} NFTs asociados.`
        },
        { status: 400 }
      );
    }

    // Eliminar colección
    await prisma.nFTCollection.delete({
      where: { id: collectionId }
    });

    return NextResponse.json({
      message: "Colección eliminada exitosamente"
    });
  } catch (error) {
    console.error("Error deleting collection:", error);
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
