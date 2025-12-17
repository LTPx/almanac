import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { verifyAdminSession } from "@/lib/admin-auth";

/**
 * GET /api/admin/users/search?email=xxx
 * Busca usuarios por email
 */
export async function GET(request: NextRequest) {
  try {
    // Verificar que el usuario sea admin
    const session = await auth.api.getSession({
      headers: await headers()
    });

    const adminCheck = verifyAdminSession(session);
    if (adminCheck) return adminCheck;

    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { error: "email es requerido" },
        { status: 400 }
      );
    }

    const users = await prisma.user.findMany({
      where: {
        email: {
          contains: email,
          mode: "insensitive"
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        walletAddress: true,
        zapTokens: true,
        hearts: true,
        totalExperiencePoints: true,
        totalCurriculumsCompleted: true,
        createdAt: true,
        userCurriculumTokens: {
          include: {
            curriculum: {
              select: {
                id: true,
                title: true
              }
            }
          }
        }
      },
      take: 10 // Límite de resultados
    });

    return NextResponse.json({ users });
  } catch (err: any) {
    console.error("Error searching users:", err);
    return NextResponse.json(
      { error: "Error al buscar usuarios", detail: err.message },
      { status: 500 }
    );
  }
}
