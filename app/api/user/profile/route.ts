import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function PUT(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, email, dateOfBirth } = await request.json();

    // Validar que al menos un campo esté presente
    if (!name && !email && !dateOfBirth) {
      return NextResponse.json(
        { error: "At least one field is required" },
        { status: 400 }
      );
    }

    // Preparar datos para actualizar
    const updateData: any = {};

    if (name !== undefined) {
      updateData.name = name;
    }

    if (email !== undefined) {
      // Verificar si el email ya existe
      if (email !== session.user.email) {
        const existingUser = await prisma.user.findUnique({
          where: { email }
        });

        if (existingUser) {
          return NextResponse.json(
            { error: "Email already in use" },
            { status: 400 }
          );
        }
      }
      updateData.email = email;
    }

    if (dateOfBirth !== undefined) {
      updateData.dateOfBirth = dateOfBirth ? new Date(dateOfBirth) : null;
    }

    // Actualizar el usuario
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData
    });

    return NextResponse.json({
      success: true,
      user: {
        name: updatedUser.name,
        email: updatedUser.email,
        dateOfBirth: updatedUser.dateOfBirth
      }
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
