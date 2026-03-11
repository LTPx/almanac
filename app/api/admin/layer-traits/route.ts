import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { uploadFile } from "@/lib/s3";

// GET - List traits for a category
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");

    if (!categoryId) {
      return NextResponse.json(
        { message: "categoryId is required" },
        { status: 400 }
      );
    }

    const traits = await prisma.layerTrait.findMany({
      where: { categoryId },
      orderBy: { weight: "desc" },
      include: {
        curriculum: { select: { id: true, title: true } }
      }
    });

    return NextResponse.json(traits);
  } catch (error) {
    console.error("Error fetching layer traits:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Create a new trait with image upload
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const categoryId = formData.get("categoryId") as string | null;
    const name = formData.get("name") as string | null;
    const weight = formData.get("weight") as string | null;
    const curriculumId = formData.get("curriculumId") as string | null;

    if (!file || !categoryId || !name?.trim()) {
      return NextResponse.json(
        { message: "file, categoryId, and name are required" },
        { status: 400 }
      );
    }

    // Verify category exists and get collectionId for folder structure
    const category = await prisma.layerCategory.findUnique({
      where: { id: categoryId },
      select: { collectionId: true, name: true }
    });

    if (!category) {
      return NextResponse.json(
        { message: "Category not found" },
        { status: 404 }
      );
    }

    // Upload to DO Spaces
    const folder = `layers/${category.collectionId}/${category.name.toLowerCase().replace(/\s+/g, "-")}`;
    const uploaded = await uploadFile(file, folder);

    const trait = await prisma.layerTrait.create({
      data: {
        categoryId,
        name: name.trim(),
        imageUrl: uploaded.url,
        weight: weight ? parseInt(weight) : 100,
        curriculumId: curriculumId || null
      },
      include: {
        curriculum: { select: { id: true, title: true } }
      }
    });

    return NextResponse.json(trait, { status: 201 });
  } catch (error: any) {
    if (error?.code === "P2002") {
      return NextResponse.json(
        { message: "A trait with this name already exists in this category" },
        { status: 400 }
      );
    }
    console.error("Error creating layer trait:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
