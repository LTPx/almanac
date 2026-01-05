import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { languagePreference } = await request.json();

    if (!languagePreference) {
      return NextResponse.json(
        { error: "Language preference is required" },
        { status: 400 }
      );
    }

    // Actualizar la preferencia de idioma del usuario
    await prisma.user.update({
      where: { id: session.user.id },
      data: { languagePreference }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating language preference:", error);
    return NextResponse.json(
      { error: "Failed to update language preference" },
      { status: 500 }
    );
  }
}
