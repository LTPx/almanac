// app/api/leaderboard/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parámetros opcionales para paginación
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Obtener usuarios ordenados por totalExperiencePoints
    const leaderboard = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        totalExperiencePoints: true,
        totalCurriculumsCompleted: true,
        zapTokens: true
      },
      orderBy: {
        totalExperiencePoints: "desc"
      },
      take: limit,
      skip: offset
    });

    // Agregar el ranking (posición) a cada usuario
    const leaderboardWithRank = leaderboard.map((user, index) => ({
      rank: offset + index + 1,
      ...user
    }));

    // Obtener el total de usuarios para información de paginación
    const totalUsers = await prisma.user.count();

    return NextResponse.json({
      success: true,
      data: leaderboardWithRank,
      pagination: {
        total: totalUsers,
        limit,
        offset,
        hasMore: offset + limit < totalUsers
      }
    });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al obtener el leaderboard"
      },
      { status: 500 }
    );
  }
}
