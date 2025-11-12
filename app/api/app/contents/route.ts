import { NextRequest, NextResponse } from "next/server";
import { getUnitsByCurriculumIdAndUserStats } from "@/lib/queries";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const curriculumId = searchParams.get("curriculumId");
  const userId = searchParams.get("userId");

  if (!curriculumId) {
    return NextResponse.json(
      { error: "No curriculumId found" },
      { status: 404 }
    );
  }

  if (!userId) {
    return NextResponse.json({ error: "No userId found" }, { status: 404 });
  }

  try {
    const units = await getUnitsByCurriculumIdAndUserStats(
      curriculumId,
      userId
    );
    return NextResponse.json(units);
  } catch (error) {
    console.error("Error fetching units:", error);
    return NextResponse.json(
      { error: "Failed to fetch units" },
      { status: 500 }
    );
  }
}
