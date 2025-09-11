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
        id: id,
        isActive: true
      },
      include: {
        lessons: {
          where: {
            isActive: true
          },
          include: {
            _count: {
              select: {
                questions: true
              }
            }
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
        lessons: {
          include: {
            _count: {
              select: {
                questions: true
              }
            }
          }
        },
        _count: {
          select: {
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
  { params }: { params: { unitId: string } }
) {
  try {
    const unitId = parseInt(params.unitId);
    if (isNaN(unitId)) {
      return NextResponse.json({ error: "Invalid unit ID" }, { status: 400 });
    }

    // Soft delete - marcar como inactivo
    await prisma.unit.update({
      where: { id: unitId },
      data: {
        isActive: false,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({ message: "Unit deleted successfully" });
  } catch (error) {
    console.error("Error deleting unit:", error);
    return NextResponse.json(
      { error: "Failed to delete unit" },
      { status: 500 }
    );
  }
}
