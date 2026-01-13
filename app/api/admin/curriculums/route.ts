import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET: Obtener todos los curriculums con sus units para el Master Catalog
export async function GET() {
  try {
    const curriculums = await prisma.curriculum.findMany({
      where: {
        isActive: true
      },
      select: {
        id: true,
        title: true,
        units: {
          where: {
            isActive: true
          },
          select: {
            id: true,
            name: true
          },
          orderBy: {
            order: "asc"
          }
        }
      },
      orderBy: {
        title: "asc"
      }
    });

    return NextResponse.json(curriculums);
  } catch (error) {
    console.error("Error fetching curriculums:", error);
    return NextResponse.json(
      { error: "Failed to fetch curriculums" },
      { status: 500 }
    );
  }
}
