import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { verifyAdminSession } from "@/lib/admin-auth";

// GET - Listar todos los ads con estadísticas
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    const adminCheck = verifyAdminSession(session);
    if (adminCheck) return adminCheck;

    const { searchParams } = new URL(request.url);
    const unitId = searchParams.get("unitId");

    const where = unitId ? { unitId: parseInt(unitId) } : {};

    const ads = await prisma.ad.findMany({
      where,
      include: {
        unit: {
          select: {
            id: true,
            name: true
          }
        },
        _count: {
          select: {
            views: true,
            clicks: true
          }
        }
      },
      orderBy: [{ unitId: "asc" }, { position: "asc" }]
    });

    return NextResponse.json(ads);
  } catch (error) {
    console.error("Error fetching ads:", error);
    return NextResponse.json(
      { error: "Error al obtener anuncios" },
      { status: 500 }
    );
  }
}

// POST - Crear nuevo ad
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    const adminCheck = verifyAdminSession(session);
    if (adminCheck) return adminCheck;

    const body = await request.json();
    const { unitId, title, description, imageUrl, targetUrl, position, isActive } =
      body;

    if (!unitId || !title || !imageUrl || !targetUrl) {
      return NextResponse.json(
        {
          error:
            "unitId, title, imageUrl y targetUrl son requeridos"
        },
        { status: 400 }
      );
    }

    const ad = await prisma.ad.create({
      data: {
        unitId,
        title,
        description,
        imageUrl,
        targetUrl,
        position: position || 0,
        isActive: isActive !== undefined ? isActive : true
      },
      include: {
        unit: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    return NextResponse.json(ad, { status: 201 });
  } catch (error) {
    console.error("Error creating ad:", error);
    return NextResponse.json(
      { error: "Error al crear anuncio" },
      { status: 500 }
    );
  }
}
