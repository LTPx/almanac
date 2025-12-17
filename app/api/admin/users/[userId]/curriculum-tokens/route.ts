import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { verifyAdminSession } from "@/lib/admin-auth";

/**
 * POST /api/admin/users/[userId]/curriculum-tokens
 * Asigna tokens de curriculum a un usuario manualmente
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    // Verificar que el usuario sea admin
    const session = await auth.api.getSession({
      headers: await headers()
    });

    const adminCheck = verifyAdminSession(session);
    if (adminCheck) return adminCheck;

    const { userId } = await context.params;
    const { curriculumId, quantity = 1 } = await request.json();

    if (!curriculumId) {
      return NextResponse.json(
        { error: "curriculumId es requerido" },
        { status: 400 }
      );
    }

    // Verificar que el usuario existe
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Verificar que el curriculum existe
    const curriculum = await prisma.curriculum.findUnique({
      where: { id: curriculumId }
    });

    if (!curriculum) {
      return NextResponse.json(
        { error: "Curriculum no encontrado" },
        { status: 404 }
      );
    }

    // Verificar si el usuario ya tiene un token para este curriculum
    const existingToken = await prisma.userCurriculumToken.findFirst({
      where: {
        userId,
        curriculumId
      }
    });

    let token;
    if (existingToken) {
      // Incrementar la cantidad existente
      token = await prisma.userCurriculumToken.update({
        where: { id: existingToken.id },
        data: {
          quantity: { increment: quantity },
          updatedAt: new Date()
        },
        include: {
          curriculum: {
            select: {
              id: true,
              title: true
            }
          }
        }
      });
    } else {
      // Crear nuevo token
      token = await prisma.userCurriculumToken.create({
        data: {
          userId,
          curriculumId,
          quantity
        },
        include: {
          curriculum: {
            select: {
              id: true,
              title: true
            }
          }
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: `Token de curriculum asignado exitosamente`,
      token
    });
  } catch (err: any) {
    console.error("Error assigning curriculum token:", err);
    return NextResponse.json(
      { error: "Error al asignar token", detail: err.message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/users/[userId]/curriculum-tokens
 * Obtiene todos los tokens de curriculum de un usuario
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    // Verificar que el usuario sea admin
    const session = await auth.api.getSession({
      headers: await headers()
    });

    const adminCheck = verifyAdminSession(session);
    if (adminCheck) return adminCheck;

    const { userId } = await context.params;

    const tokens = await prisma.userCurriculumToken.findMany({
      where: { userId },
      include: {
        curriculum: {
          select: {
            id: true,
            title: true
          }
        }
      }
    });

    return NextResponse.json({ tokens });
  } catch (err: any) {
    console.error("Error fetching curriculum tokens:", err);
    return NextResponse.json(
      { error: "Error al obtener tokens", detail: err.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/users/[userId]/curriculum-tokens
 * Elimina tokens de curriculum de un usuario
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    // Verificar que el usuario sea admin
    const session = await auth.api.getSession({
      headers: await headers()
    });

    const adminCheck = verifyAdminSession(session);
    if (adminCheck) return adminCheck;

    const { userId } = await context.params;
    const { curriculumId } = await request.json();

    if (!curriculumId) {
      return NextResponse.json(
        { error: "curriculumId es requerido" },
        { status: 400 }
      );
    }

    await prisma.userCurriculumToken.deleteMany({
      where: {
        userId,
        curriculumId
      }
    });

    return NextResponse.json({
      success: true,
      message: "Token eliminado exitosamente"
    });
  } catch (err: any) {
    console.error("Error deleting curriculum token:", err);
    return NextResponse.json(
      { error: "Error al eliminar token", detail: err.message },
      { status: 500 }
    );
  }
}
