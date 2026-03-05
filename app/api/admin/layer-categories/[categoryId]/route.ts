import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// PUT - Update a layer category
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ categoryId: string }> }
) {
  try {
    const { categoryId } = await params;
    const body = await request.json();
    const { name, order, isRequired } = body;

    const category = await prisma.layerCategory.update({
      where: { id: categoryId },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(order !== undefined && { order }),
        ...(isRequired !== undefined && { isRequired })
      },
      include: {
        traits: { orderBy: { weight: "desc" } },
        _count: { select: { traits: true } }
      }
    });

    return NextResponse.json(category);
  } catch (error: any) {
    if (error?.code === "P2025") {
      return NextResponse.json(
        { message: "Category not found" },
        { status: 404 }
      );
    }
    if (error?.code === "P2002") {
      return NextResponse.json(
        { message: "A category with this name already exists in this collection" },
        { status: 400 }
      );
    }
    console.error("Error updating layer category:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a layer category and its traits
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ categoryId: string }> }
) {
  try {
    const { categoryId } = await params;

    await prisma.layerCategory.delete({
      where: { id: categoryId }
    });

    return NextResponse.json({ message: "Category deleted" });
  } catch (error: any) {
    if (error?.code === "P2025") {
      return NextResponse.json(
        { message: "Category not found" },
        { status: 404 }
      );
    }
    console.error("Error deleting layer category:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
