import { NextResponse } from "next/server"
import { getUserProgressByUnit } from "@/lib/queries"

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const unitId = searchParams.get("unitId")

    if (!unitId) {
      return NextResponse.json(
        { error: "Unit ID is required" },
        { status: 400 }
      )
    }

    const unitIdInt = parseInt(unitId)
    if (isNaN(unitIdInt)) {
      return NextResponse.json({ error: "Invalid unit ID" }, { status: 400 })
    }

    const progress = await getUserProgressByUnit(params.userId, unitIdInt)
    return NextResponse.json(progress)
  } catch (error) {
    console.error("Error fetching user progress:", error)
    return NextResponse.json(
      { error: "Failed to fetch user progress" },
      { status: 500 }
    )
  }
}
