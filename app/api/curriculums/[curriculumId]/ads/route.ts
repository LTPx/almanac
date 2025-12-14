import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ curriculumId: string }> }
) {
  try {
    const { curriculumId } = await context.params;

    const ads = await prisma.ad.findMany({
      where: {
        curriculumId,
        isActive: true
      },
      orderBy: {
        position: "asc"
      },
      select: {
        id: true,
        title: true,
        description: true,
        imageUrl: true,
        targetUrl: true,
        position: true,
        _count: {
          select: {
            views: true,
            clicks: true
          }
        }
      }
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
