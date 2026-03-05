import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { verifyAdminSession } from "@/lib/admin-auth";

// GET - Listar todas las collections con conteos
export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    const adminCheck = verifyAdminSession(session);
    if (adminCheck) return adminCheck;

    const collections = await prisma.nFTCollection.findMany({
      include: {
        _count: {
          select: {
            nftAssets: true,
            educationalNFTs: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(collections);
  } catch (error) {
    console.error("Error fetching collections:", error);
    return NextResponse.json(
      { error: "Error al obtener colecciones" },
      { status: 500 }
    );
  }
}

// POST - Crear nueva collection
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    const adminCheck = verifyAdminSession(session);
    if (adminCheck) return adminCheck;

    const body = await request.json();
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

    if (!name || !symbol || !contractAddress) {
      return NextResponse.json(
        { error: "name, symbol y contractAddress son requeridos" },
        { status: 400 }
      );
    }

    const collection = await prisma.nFTCollection.create({
      data: {
        name,
        symbol,
        description,
        contractAddress,
        chainId: chainId || 80002,
        isActive: isActive !== undefined ? isActive : true,
        defaultArtistAddress,
        defaultRoyaltyBps: defaultRoyaltyBps || 500,
        maxSupply,
        certificateContractAddress,
        collectibleContractAddress
      },
      include: {
        _count: {
          select: {
            nftAssets: true,
            educationalNFTs: true
          }
        }
      }
    });

    return NextResponse.json(collection, { status: 201 });
  } catch (error) {
    console.error("Error creating collection:", error);
    return NextResponse.json(
      { error: "Error al crear colección" },
      { status: 500 }
    );
  }
}
