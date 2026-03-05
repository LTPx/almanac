import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { deleteImageFromSpaces } from "@/lib/s3";

// PUT - Update a trait (name or weight)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ traitId: string }> }
) {
  try {
    const { traitId } = await params;
    const body = await request.json();
    const { name, weight } = body;

    const trait = await prisma.layerTrait.update({
      where: { id: traitId },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(weight !== undefined && { weight: parseInt(String(weight)) })
      }
    });

    return NextResponse.json(trait);
  } catch (error: any) {
    if (error?.code === "P2025") {
      return NextResponse.json(
        { message: "Trait not found" },
        { status: 404 }
      );
    }
    if (error?.code === "P2002") {
      return NextResponse.json(
        { message: "A trait with this name already exists in this category" },
        { status: 400 }
      );
    }
    console.error("Error updating layer trait:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a trait and its image from DO Spaces
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ traitId: string }> }
) {
  try {
    const { traitId } = await params;

    const trait = await prisma.layerTrait.findUnique({
      where: { id: traitId }
    });

    if (!trait) {
      return NextResponse.json(
        { message: "Trait not found" },
        { status: 404 }
      );
    }

    // Delete image from DO Spaces
    try {
      await deleteImageFromSpaces(trait.imageUrl);
    } catch (err) {
      console.error("Error deleting trait image from spaces:", err);
    }

    // Delete from DB
    await prisma.layerTrait.delete({
      where: { id: traitId }
    });

    return NextResponse.json({ message: "Trait deleted" });
  } catch (error) {
    console.error("Error deleting layer trait:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
