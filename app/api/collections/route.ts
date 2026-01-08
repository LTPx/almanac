import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const collections = await prisma.nFTCollection.findMany({
      select: {
        id: true,
        name: true,
        description: true
      },
      orderBy: {
        name: "asc"
      }
    });

    return NextResponse.json({ collections });
  } catch (error) {
    console.error("Error al obtener colecciones:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
