import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const where =
      status && status !== "all" ? { status: status as "PENDING" } : {};

    const reports = await prisma.problemReport.findMany({
      where,
      include: {
        question: {
          select: {
            id: true,
            title: true,
            type: true,
            unit: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    return NextResponse.json(reports);
  } catch (error) {
    console.error("Error al obtener reportes:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { reportId, status } = await request.json();

    if (!reportId || !status) {
      return NextResponse.json(
        { error: "reportId y status son requeridos" },
        { status: 400 }
      );
    }

    const updatedReport = await prisma.problemReport.update({
      where: { id: reportId },
      data: { status }
    });

    return NextResponse.json({
      success: true,
      report: updatedReport
    });
  } catch (error) {
    console.error("Error al actualizar reporte:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
