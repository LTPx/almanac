import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { PinataSDK } from "pinata";

const PINATA_GATEWAY = process.env.PINATA_GATEWAY || "gateway.pinata.cloud";

const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT!,
  pinataGateway: PINATA_GATEWAY
});

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ assetId: string }> }
) {
  try {
    const { assetId } = await context.params;
    const id = parseInt(assetId, 10);

    if (isNaN(id)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const nftAsset = await prisma.nFTAsset.findUnique({
      where: { id },
      include: {
        educationalNFT: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true
              }
            }
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

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ assetId: string }> }
) {
  try {
    const { assetId } = await context.params;
    const id = parseInt(assetId, 10);

    if (isNaN(id)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const imageUrl = formData.get("imageUrl") as string | null;
    const rarity = formData.get("rarity") as string | null;
    const metadataUri = formData.get("metadataUri") as string | null;
    const name = formData.get("name") as string | null;

    const existingNFT = await prisma.nFTAsset.findUnique({
      where: { id }
    });

    if (!existingNFT) {
      return NextResponse.json(
        { error: "NFT Asset no encontrado" },
        { status: 404 }
      );
    }

    if (existingNFT.isUsed) {
      return NextResponse.json(
        {
          error: "No se puede editar un NFT Asset que ya ha sido usado"
        },
        { status: 400 }
      );
    }

    // Validar rarity si se proporciona
    if (rarity) {
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
    }

    // Validar imageUrl si se proporciona
    if (imageUrl) {
      try {
        new URL(imageUrl);
      } catch {
        return NextResponse.json(
          { error: "imageUrl debe ser una URL válida" },
          { status: 400 }
        );
      }
    }

    // Validar metadataUri si se proporciona
    if (metadataUri) {
      const isValidUrl =
        metadataUri.startsWith("http://") ||
        metadataUri.startsWith("https://") ||
        metadataUri.startsWith("ipfs://");

      if (!isValidUrl) {
        return NextResponse.json(
          {
            error:
              "metadataUri debe ser una URL válida o un URI de IPFS (ipfs://...)"
          },
          { status: 400 }
        );
      }
    }

    const updateData: any = {};

    // Procesar archivo si se proporciona
    if (file && file.size > 0) {
      try {
        const upload = await pinata.upload.public.file(file, {
          metadata: {
            name: `NFT-${rarity || existingNFT.rarity}-${file.name}`,
            keyvalues: { rarity: rarity || existingNFT.rarity }
          }
        });

        updateData.imageUrl = `https://${PINATA_GATEWAY}/ipfs/${upload.cid}`;
      } catch (error: any) {
        console.error("Error al subir archivo a Pinata:", error);
        return NextResponse.json(
          {
            error: "Error al subir la imagen",
            details: (error as Error).message
          },
          { status: 500 }
        );
      }
    } else if (imageUrl) {
      // Si se proporciona imageUrl sin archivo, usar la URL directa
      updateData.imageUrl = imageUrl;
    }

    // Actualizar otros campos
    if (name !== undefined) updateData.name = name || "";
    if (rarity) updateData.rarity = rarity;
    if (metadataUri) updateData.metadataUri = metadataUri;

    const updatedNFT = await prisma.nFTAsset.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json(
      {
        message: "NFT Asset actualizado exitosamente",
        nftAsset: updatedNFT
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error al actualizar NFT Asset:", error);
    return NextResponse.json(
      {
        error: "Error interno del servidor",
        details: (error as Error).message
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ assetId: string }> }
) {
  try {
    const { assetId } = await context.params;
    const id = parseInt(assetId, 10);

    if (isNaN(id)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const existingNFT = await prisma.nFTAsset.findUnique({
      where: { id },
      include: {
        educationalNFT: true
      }
    });

    if (!existingNFT) {
      return NextResponse.json(
        { error: "NFT Asset no encontrado" },
        { status: 404 }
      );
    }

    if (existingNFT.isUsed || existingNFT.educationalNFT) {
      return NextResponse.json(
        {
          error:
            "No se puede eliminar un NFT Asset que ya ha sido asignado a un usuario"
        },
        { status: 400 }
      );
    }

    await prisma.nFTAsset.delete({
      where: { id }
    });

    return NextResponse.json({
      message: "NFT Asset eliminado exitosamente"
    });
  } catch (error) {
    console.error("Error al eliminar NFT Asset:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
