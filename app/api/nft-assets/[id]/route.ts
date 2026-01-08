import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    // Verificar si el NFT existe y no está usado
    const nftAsset = await prisma.nFTAsset.findUnique({
      where: { id }
    });

    if (!nftAsset) {
      return NextResponse.json(
        { error: "NFT Asset no encontrado" },
        { status: 404 }
      );
    }

    if (nftAsset.isUsed) {
      return NextResponse.json(
        { error: "No se puede eliminar un NFT que ya está minted" },
        { status: 400 }
      );
    }

    // Eliminar el NFT Asset
    await prisma.nFTAsset.delete({
      where: { id }
    });

    return NextResponse.json(
      { message: "NFT Asset eliminado exitosamente" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error al eliminar NFT Asset:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    const nftAsset = await prisma.nFTAsset.findUnique({
      where: { id },
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
      }
    });

    if (!nftAsset) {
      return NextResponse.json(
        { error: "NFT Asset no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(nftAsset);
  } catch (error) {
    console.error("Error al obtener NFT Asset:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
