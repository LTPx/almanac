import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { verifyAdminSession } from "@/lib/admin-auth";

// GET - Obtener un ad con estadísticas detalladas
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ adId: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    const adminCheck = verifyAdminSession(session);
    if (adminCheck) return adminCheck;

    const { adId } = await context.params;

    const ad = await prisma.ad.findUnique({
      where: { id: parseInt(adId) },
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
      }
    });

    if (!ad) {
      return NextResponse.json(
        { error: "Anuncio no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(ad);
  } catch (error) {
    console.error("Error fetching ad:", error);
    return NextResponse.json(
      { error: "Error al obtener anuncio" },
      { status: 500 }
    );
  }
}

// PATCH - Actualizar un ad
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ adId: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    const adminCheck = verifyAdminSession(session);
    if (adminCheck) return adminCheck;

    const { adId } = await context.params;
    const body = await request.json();

    const ad = await prisma.ad.update({
      where: { id: parseInt(adId) },
      data: body,
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
      }
    });

    return NextResponse.json(ad);
  } catch (error) {
    console.error("Error updating ad:", error);
    return NextResponse.json(
      { error: "Error al actualizar anuncio" },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar un ad
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ adId: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    const adminCheck = verifyAdminSession(session);
    if (adminCheck) return adminCheck;

    const { adId } = await context.params;

    await prisma.ad.delete({
      where: { id: parseInt(adId) }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting ad:", error);
    return NextResponse.json(
      { error: "Error al eliminar anuncio" },
      { status: 500 }
    );
  }
}
