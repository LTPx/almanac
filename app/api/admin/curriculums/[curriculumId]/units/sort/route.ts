import { NextRequest, NextResponse } from "next/server";
import { getUnitsByCurriculumId } from "@/lib/queries";
import prisma from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ curriculumId: string }> }
) {
  const { curriculumId } = await context.params;

  try {
    const unitsOrder = await request.json();

    if (!Array.isArray(unitsOrder)) {
      return NextResponse.json(
        { ok: false, error: "Invalid data" },
        { status: 400 }
      );
    }

    const units = await getUnitsByCurriculumId(curriculumId);

    const orderMap = new Map<number, number>(); // unitId -> position
    for (const { unitId, position } of unitsOrder) {
      orderMap.set(unitId, position);
    }

    // Actualizar cada unit
    const updates = await Promise.all(
      units.map((unit) =>
        prisma.unit.update({
          where: { id: unit.id },
          data: {
            position: orderMap.has(unit.id) ? orderMap.get(unit.id) : null // si no está en unitsOrder, position = null
          }
        })
      )
    );

    return NextResponse.json({ ok: true, units: updates });
  } catch (error) {
    console.error("Error saving units:", error);
    return NextResponse.json(
      { error: "Failed to save units" },
      { status: 500 }
    );
  }
}
