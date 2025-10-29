import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET - Listar todas las colecciones
export async function GET() {
  try {
    const collections = await prisma.nFTCollection.findMany({
      include: {
        _count: {
          select: {
            educationalNFTs: true,
            nftAssets: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(collections);
  } catch (error) {
    console.error("Error fetching collections:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Crear nueva colección
export async function POST(request: NextRequest) {
  try {
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

    // Verificar que no exista ya una colección con esa dirección
    const existingCollection = await prisma.nFTCollection.findUnique({
      where: { contractAddress: contractAddress.toLowerCase() }
    });

    if (existingCollection) {
      return NextResponse.json(
        { message: "Ya existe una colección con esa dirección de contrato" },
        { status: 400 }
      );
    }

    // Crear colección
    const collection = await prisma.nFTCollection.create({
      data: {
        name: name.trim(),
        symbol: symbol.trim().toUpperCase(),
        description: description?.trim() || null,
        contractAddress: contractAddress.toLowerCase(),
        chainId: chainId || 80002,
        isActive: isActive ?? true
      }
    });

    return NextResponse.json(
      {
        message: "Colección creada exitosamente",
        collection
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating collection:", error);
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
