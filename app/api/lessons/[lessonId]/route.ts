import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

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
