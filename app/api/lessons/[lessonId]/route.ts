import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

import { getLessonById } from "@/lib/queries";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ lessonId: string }> }
) {
  const { lessonId } = await context.params;

  try {
    const id = parseInt(lessonId);
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid lesson ID" }, { status: 400 });
    }
    console.log("id lesson: ", id);
    const lessons = await getLessonById(id);
    return NextResponse.json(lessons);
  } catch (error) {
    console.error("Error fetching lessons:", error);
    return NextResponse.json(
      { error: "Failed to fetch lessons" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ lessonId: string }> }
) {
  const { lessonId } = await context.params;

  try {
    const id = parseInt(lessonId);

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid lesson ID" }, { status: 400 });
    }
    const body = await request.json();

    const {
      name,
      description,
      mandatory,
      experiencePoints,
      position,
      isActive,
      unitId
    } = body;

    const existingLesson = await prisma.lesson.findUnique({
      where: { id }
    });

    if (!existingLesson) {
      return NextResponse.json({ error: "Lesson no found" }, { status: 404 });
    }

    const lesson = await prisma.lesson.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(mandatory !== undefined && { mandatory }),
        ...(experiencePoints !== undefined && { experiencePoints }),
        ...(position !== undefined && { position }),
        ...(unitId !== undefined && { unitId: parseInt(unitId) }),
        ...(isActive !== undefined && { isActive }),
        updatedAt: new Date()
      }
    });

    return NextResponse.json(lesson);
  } catch (error) {
    console.error("Error al actualizar curriculum:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ lessonId: string }> }
) {
  const { lessonId } = await context.params;
  const id = parseInt(lessonId);

  try {
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid lesson ID" }, { status: 400 });
    }

    await prisma.lesson.update({
      where: { id },
      data: {
        isActive: false,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      message: `Lesson eliminada correctamente`
    });
  } catch (error) {
    console.error("Error deleting unit:", error);
    return NextResponse.json(
      { error: "Failed to delete unit" },
      { status: 500 }
    );
  }
}
