import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const difficulty = searchParams.get("difficulty");
    const includeUnits = searchParams.get("includeUnits") === "true";
    const activeParam = searchParams.get("active");

    const where: any = {};

    if (difficulty && difficulty !== "all") {
      where.difficulty = difficulty;
    }

    if (activeParam === "true") {
      where.isActive = true;
    } else if (activeParam === "false") {
      where.isActive = false;
    }

    const curriculums = await prisma.curriculum.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        units: includeUnits
          ? {
              orderBy: { order: "asc" },
              select: {
                id: true,
                name: true,
                description: true,
                order: true,
                isActive: true
              }
            }
          : true,
        _count: {
          select: { units: true }
        }
      }
    });

    return NextResponse.json(curriculums);
  } catch (error) {
    console.error("Error al obtener curriculums:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
