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

    const { dateOfBirth } = await request.json();

    if (!dateOfBirth) {
      return NextResponse.json(
        { error: "Date of birth is required" },
        { status: 400 }
      );
    }

    // Actualizar la fecha de nacimiento del usuario
    await prisma.user.update({
      where: { id: session.user.id },
      data: { dateOfBirth: new Date(dateOfBirth) }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating date of birth:", error);
    return NextResponse.json(
      { error: "Failed to update date of birth" },
      { status: 500 }
    );
  }
}
