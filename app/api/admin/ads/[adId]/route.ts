import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { verifyAdminSession } from "@/lib/admin-auth";
import { deleteImageFromSpaces } from "@/lib/s3";

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
        curriculum: {
          select: {
            id: true,
            title: true
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

    // Obtener el ad actual
    const currentAd = await prisma.ad.findUnique({
      where: { id: parseInt(adId) }
    });

    if (!currentAd) {
      return NextResponse.json(
        { error: "Anuncio no encontrado" },
        { status: 404 }
      );
    }

    // Filtrar solo los campos válidos del modelo Ad
    const {
      curriculumId,
      title,
      description,
      imageUrl,
      targetUrl,
      position,
      isActive
    } = body;

    const updateData: any = {};
    if (curriculumId !== undefined) updateData.curriculumId = curriculumId;
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    if (targetUrl !== undefined) updateData.targetUrl = targetUrl;
    if (position !== undefined) updateData.position = position;
    if (isActive !== undefined) updateData.isActive = isActive;

    // Si la imagen cambió, eliminar la antigua de S3
    if (
      imageUrl &&
      imageUrl !== currentAd.imageUrl &&
      currentAd.imageUrl.includes(process.env.DIGITAL_OCEAN_BUCKET_URL_ENDPOINT || "")
    ) {
      try {
        await deleteImageFromSpaces(currentAd.imageUrl);
      } catch (error) {
        console.error("Error deleting old image from S3:", error);
        // No fallar la operación si no se puede borrar la imagen antigua
      }
    }

    const ad = await prisma.ad.update({
      where: { id: parseInt(adId) },
      data: updateData,
      include: {
        curriculum: {
          select: {
            id: true,
            title: true
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

    // Obtener el ad antes de eliminarlo para obtener la URL de la imagen
    const ad = await prisma.ad.findUnique({
      where: { id: parseInt(adId) }
    });

    if (!ad) {
      return NextResponse.json(
        { error: "Anuncio no encontrado" },
        { status: 404 }
      );
    }

    // Eliminar el registro de la base de datos
    await prisma.ad.delete({
      where: { id: parseInt(adId) }
    });

    // Intentar borrar la imagen de S3 si es de nuestro bucket
    if (ad.imageUrl && ad.imageUrl.includes(process.env.DIGITAL_OCEAN_BUCKET_URL_ENDPOINT || "")) {
      try {
        await deleteImageFromSpaces(ad.imageUrl);
      } catch (error) {
        console.error("Error deleting image from S3:", error);
        // No fallar la operación si no se puede borrar la imagen
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting ad:", error);
    return NextResponse.json(
      { error: "Error al eliminar anuncio" },
      { status: 500 }
    );
  }
}
