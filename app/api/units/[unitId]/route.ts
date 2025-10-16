import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ unitId: string }> }
) {
  const { unitId } = await context.params;

  try {
    const id = parseInt(unitId);

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid unit ID" }, { status: 400 });
    }

    const unit = await prisma.unit.findUnique({
      where: {
        id: id
        // isActive: true
      },
      include: {
        lessons: {
          where: {
            isActive: true
          },
          orderBy: { position: "asc" }
        },
        _count: {
          select: {
            lessons: true
          }
        }
      }
    });

    if (!unit) {
      return NextResponse.json({ error: "Unit not found" }, { status: 404 });
    }

    return NextResponse.json(unit);
  } catch (error) {
    console.error("Error fetching unit:", error);
    return NextResponse.json(
      { error: "Failed to fetch unit" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ unitId: string }> }
) {
  const { unitId } = await context.params;

  try {
    const id = parseInt(unitId);
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid unit ID" }, { status: 400 });
    }

    const body = await request.json();
    const { name, description, order, isActive } = body;

    const unit = await prisma.unit.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(order !== undefined && { order }),
        ...(isActive !== undefined && { isActive }),
        updatedAt: new Date()
      },
      include: {
        _count: {
          select: {
            questions: true,
            lessons: true
          }
        }
      }
    });

    return NextResponse.json(unit);
  } catch (error) {
    console.error("Error updating unit:", error);
    return NextResponse.json(
      { error: "Failed to update unit" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ unitId: string }> }
) {
  const { unitId } = await context.params;
  const id = parseInt(unitId);

  try {
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid unit ID" }, { status: 400 });
    }

    const { removeLessons } = await request
      .json()
      .catch(() => ({ removeLessons: false }));

    // Marcar la unidad como inactiva (soft delete)
    await prisma.unit.update({
      where: { id },
      data: {
        isActive: false,
        updatedAt: new Date()
      }
    });

    // Si el usuario eligió eliminar las lecciones también
    if (removeLessons) {
      await prisma.lesson.updateMany({
        where: { unitId: id },
        data: {
          isActive: false,
          updatedAt: new Date()
        }
      });
    }

    return NextResponse.json({
      message: `Unidad eliminada correctamente${
        removeLessons ? " y lecciones desactivadas" : ""
      }`
    });
  } catch (error) {
    console.error("Error deleting unit:", error);
    return NextResponse.json(
      { error: "Failed to delete unit" },
      { status: 500 }
    );
  }
}
