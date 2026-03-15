import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { verifyAdminSession } from "@/lib/admin-auth";
import { deployCollectionContracts } from "@/lib/contracts/deploy-collection";

export const maxDuration = 60;

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
      chainId,
      isActive,
      defaultArtistAddress,
      defaultRoyaltyBps,
      maxSupply,
      deployCollectible = true
    } = body;

    if (!name || !symbol) {
      return NextResponse.json(
        { error: "name y symbol son requeridos" },
        { status: 400 }
      );
    }

    if (!maxSupply || maxSupply < 1) {
      return NextResponse.json(
        { error: "maxSupply es requerido y debe ser mayor a 0" },
        { status: 400 }
      );
    }

    const resolvedChainId = chainId || 80002;

    const { certProxyAddress, collectibleProxyAddress } =
      await deployCollectionContracts({
        name,
        symbol,
        maxSupply,
        chainId: resolvedChainId,
        deployCollectible
      });

    const collection = await prisma.nFTCollection.create({
      data: {
        name,
        symbol,
        description,
        contractAddress: certProxyAddress,
        chainId: resolvedChainId,
        isActive: isActive !== undefined ? isActive : true,
        defaultArtistAddress,
        defaultRoyaltyBps: defaultRoyaltyBps || 500,
        maxSupply,
        certificateContractAddress: certProxyAddress,
        collectibleContractAddress: collectibleProxyAddress
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
    const message = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json(
      { error: "Error al crear colección", details: message },
      { status: 500 }
    );
  }
}
