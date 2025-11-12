import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserProgressByUnit } from "@/lib/queries";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const curriculumId = searchParams.get("curriculumId");
  const userId = searchParams.get("userId");

  // if (!curriculumId) {
  //   return NextResponse.json(
  //     { error: "No curriculumId found" },
  //     { status: 404 }
  //   );
  // }

  if (!userId) {
    return NextResponse.json({ error: "No userId found" }, { status: 404 });
  }

  try {
    const curriculums = await prisma.curriculum.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        _count: {
          select: { units: true }
        }
      }
    });
    const curriculumIdSelected = curriculumId || curriculums[0].id;

    const units = await prisma.unit.findMany({
      where: {
        curriculumId: curriculumIdSelected
      },
      select: {
        id: true,
        name: true,
        description: true,
        position: true,
        mandatory: true,
        isActive: true
      }
    });

    const progress = await getUserProgressByUnit(userId, curriculumIdSelected);
    const selectedCurriculum = curriculums.find(
      (curriculum) => curriculum.id === curriculumIdSelected
    );

    return NextResponse.json({
      allCurriculums: curriculums,
      selectedCurriculum: { ...selectedCurriculum, ...{ units } },
      progressUnit: progress
    });
  } catch (error) {
    console.error("Error al obtener curriculums:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
