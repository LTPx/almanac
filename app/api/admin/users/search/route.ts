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
    const page = searchParams.get("page") || "1";
    const limit = searchParams.get("limit") || "20";

    // Si hay email, buscar por email; si no, devolver todos los usuarios
    const where = email
      ? {
          email: {
            contains: email,
            mode: "insensitive" as const
          }
        }
      : {};

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
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
        orderBy: { createdAt: "desc" },
        skip,
        take: limitNumber
      }),
      prisma.user.count({ where })
    ]);

    return NextResponse.json({
      users,
      pagination: {
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(total / limitNumber)
      }
    });
  } catch (err: any) {
    console.error("Error searching users:", err);
    return NextResponse.json(
      { error: "Error al buscar usuarios", detail: err.message },
      { status: 500 }
    );
  }
}
