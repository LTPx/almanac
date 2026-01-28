import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { verifyAdminSession } from "@/lib/admin-auth";

/**
 * GET /api/admin/users/[userId]/unit-progress?curriculumId=xxx
 * Obtiene las unidades de un curriculum con el estado de progreso del usuario
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    const adminCheck = verifyAdminSession(session);
    if (adminCheck) return adminCheck;

    const { userId } = await context.params;
    const { searchParams } = new URL(request.url);
    const curriculumId = searchParams.get("curriculumId");

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

    // Obtener unidades del curriculum con el progreso del usuario
    const units = await prisma.unit.findMany({
      where: {
        curriculumId,
        isActive: true
      },
      orderBy: { order: "asc" },
      select: {
        id: true,
        name: true,
        order: true,
        experiencePoints: true,
        userUnitProgress: {
          where: { userId },
          select: {
            id: true,
            completedAt: true,
            experiencePoints: true
          }
        }
      }
    });

    // Formatear respuesta
    const formattedUnits = units.map((unit) => ({
      id: unit.id,
      name: unit.name,
      order: unit.order,
      experiencePoints: unit.experiencePoints,
      isCompleted: unit.userUnitProgress.length > 0 && unit.userUnitProgress[0].completedAt !== null,
      completedAt: unit.userUnitProgress[0]?.completedAt || null,
      earnedXP: unit.userUnitProgress[0]?.experiencePoints || 0
    }));

    return NextResponse.json({
      userId,
      curriculumId,
      units: formattedUnits
    });
  } catch (err: any) {
    console.error("Error fetching unit progress:", err);
    return NextResponse.json(
      { error: "Error al obtener progreso de unidades", detail: err.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/users/[userId]/unit-progress
 * Marca una unidad como completada para el usuario
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    const adminCheck = verifyAdminSession(session);
    if (adminCheck) return adminCheck;

    const { userId } = await context.params;
    const { unitId } = await request.json();

    if (!unitId) {
      return NextResponse.json(
        { error: "unitId es requerido" },
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

    // Verificar que la unidad existe
    const unit = await prisma.unit.findUnique({
      where: { id: unitId }
    });

    if (!unit) {
      return NextResponse.json(
        { error: "Unidad no encontrada" },
        { status: 404 }
      );
    }

    // Crear o actualizar el progreso
    const progress = await prisma.userUnitProgress.upsert({
      where: {
        userId_unitId: {
          userId,
          unitId
        }
      },
      update: {
        completedAt: new Date(),
        experiencePoints: unit.experiencePoints
      },
      create: {
        userId,
        unitId,
        completedAt: new Date(),
        experiencePoints: unit.experiencePoints
      }
    });

    return NextResponse.json({
      success: true,
      message: "Unidad marcada como completada",
      progress
    });
  } catch (err: any) {
    console.error("Error marking unit as completed:", err);
    return NextResponse.json(
      { error: "Error al marcar unidad como completada", detail: err.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/users/[userId]/unit-progress
 * Desmarca una unidad como completada (elimina el progreso)
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    const adminCheck = verifyAdminSession(session);
    if (adminCheck) return adminCheck;

    const { userId } = await context.params;
    const { unitId } = await request.json();

    if (!unitId) {
      return NextResponse.json(
        { error: "unitId es requerido" },
        { status: 400 }
      );
    }

    // Verificar que existe el progreso
    const existingProgress = await prisma.userUnitProgress.findUnique({
      where: {
        userId_unitId: {
          userId,
          unitId
        }
      }
    });

    if (!existingProgress) {
      return NextResponse.json(
        { error: "No existe progreso para esta unidad" },
        { status: 404 }
      );
    }

    // Eliminar el progreso
    await prisma.userUnitProgress.delete({
      where: {
        userId_unitId: {
          userId,
          unitId
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: "Progreso de unidad eliminado"
    });
  } catch (err: any) {
    console.error("Error removing unit progress:", err);
    return NextResponse.json(
      { error: "Error al eliminar progreso de unidad", detail: err.message },
      { status: 500 }
    );
  }
}
