import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ adId: string }> }
) {
  try {
    const { adId } = await context.params;
    const session = await auth.api.getSession({
      headers: await headers()
    });

    // Verificar que el usuario esté autenticado
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      );
    }

    // Registrar el click
    await prisma.adClick.create({
      data: {
        adId: parseInt(adId),
        userId: session.user.id
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error registering ad click:", error);
    return NextResponse.json(
      { error: "Error al registrar click" },
      { status: 500 }
    );
  }
}
