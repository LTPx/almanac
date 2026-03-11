import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET - List layer categories for a collection
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const collectionId = searchParams.get("collectionId");

    if (!collectionId) {
      return NextResponse.json(
        { message: "collectionId is required" },
        { status: 400 }
      );
    }

    const categories = await prisma.layerCategory.findMany({
      where: { collectionId },
      orderBy: { order: "asc" },
      include: {
        traits: {
          orderBy: { weight: "desc" },
          include: {
            curriculum: { select: { id: true, title: true } }
          }
        },
        _count: { select: { traits: true } }
      }
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error("Error fetching layer categories:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Create a new layer category
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { collectionId, name, order, isRequired } = body;

    if (!collectionId || !name?.trim()) {
      return NextResponse.json(
        { message: "collectionId and name are required" },
        { status: 400 }
      );
    }

    if (order == null || typeof order !== "number") {
      return NextResponse.json(
        { message: "order (number) is required" },
        { status: 400 }
      );
    }

    const category = await prisma.layerCategory.create({
      data: {
        collectionId,
        name: name.trim(),
        order,
        isRequired: isRequired ?? true
      },
      include: {
        traits: true,
        _count: { select: { traits: true } }
      }
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error: any) {
    if (error?.code === "P2002") {
      return NextResponse.json(
        { message: "A category with this name already exists in this collection" },
        { status: 400 }
      );
    }
    console.error("Error creating layer category:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
