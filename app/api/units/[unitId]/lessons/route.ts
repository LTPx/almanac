import { NextResponse } from "next/server";
import { getLessonsByUnitId } from "@/lib/queries";

export async function GET(
  request: Request,
  { params }: { params: { unitId: string } }
) {
  try {
    const unitId = parseInt(params.unitId);
    if (isNaN(unitId)) {
      return NextResponse.json({ error: "Invalid unit ID" }, { status: 400 });
    }

    const lessons = await getLessonsByUnitId(unitId);
    return NextResponse.json(lessons);
  } catch (error) {
    console.error("Error fetching lessons:", error);
    return NextResponse.json(
      { error: "Failed to fetch lessons" },
      { status: 500 }
    );
  }
}
