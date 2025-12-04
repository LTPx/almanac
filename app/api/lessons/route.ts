import { NextResponse } from "next/server";
import { getAllLessons } from "@/lib/queries";
import prisma from "@/lib/prisma";

// GET /api/lessons
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim() || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "20", 10);

    const result = await getAllLessons(search, page, pageSize);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching lessons:", error);
    return NextResponse.json(
      { error: "Failed to fetch lessons" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, position, isActive, unitId } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const unit = await prisma.lesson.create({
      data: {
        name,
        description,
        position,
        isActive,
        unitId: parseInt(unitId)
      }
    });

    return NextResponse.json(unit, { status: 201 });
  } catch (error) {
    console.error("Error creating lesson:", error);
    return NextResponse.json(
      { error: "Failed to create lesson" },
      { status: 500 }
    );
  }
}
