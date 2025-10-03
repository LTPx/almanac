import { NextRequest, NextResponse } from "next/server";
import { getLessonsByUnitId } from "@/lib/queries";

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

    const lessons = await getLessonsByUnitId(id);
    return NextResponse.json(lessons);
  } catch (error) {
    console.error("Error fetching lessons:", error);
    return NextResponse.json(
      { error: "Failed to fetch lessons" },
      { status: 500 }
    );
  }
}
