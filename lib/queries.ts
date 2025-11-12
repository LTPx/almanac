import { cache } from "react";
import prisma from "./prisma";

export const getUnitsByCurriculumId = cache(async (curriculumId: string) => {
  const data = await prisma.curriculum.findUnique({
    where: {
      id: curriculumId
    },
    include: {
      units: {
        where: {
          isActive: true
        },
        include: {
          lessons: {
            where: {
              isActive: true
            },
            orderBy: {
              position: "asc"
            },
            select: {
              id: true,
              name: true,
              description: true,
              position: true,
              isActive: true,
              createdAt: true,
              updatedAt: true,
              unitId: true
            }
          }
        },
        orderBy: {
          order: "asc"
        }
      },
      _count: {
        select: {
          units: true
        }
      }
    }
  });

  if (data) {
    return data.units;
  } else {
    return [];
  }
});

// ============== USER PROGRESS QUERIES ==============

export const getUserProgressByUnit = cache(
  async (userId: string, curriculumId: string) => {
    if (!userId) return null;

    const curriculum = await prisma.curriculum.findUnique({
      where: {
        id: curriculumId
      },
      include: {
        units: true
      }
    });

    if (!curriculum) return null;

    const allUnits = curriculum.units;
    const mandatoryLessons = allUnits.filter((l) => l.mandatory);

    // Traemos progreso del usuario en TODAS las unidades del curriculum
    const approvedUnitsInCurriculum = await prisma.userUnitProgress.findMany({
      where: {
        userId,
        unitId: { in: allUnits.map((l) => l.id) }
      },
      include: {
        unit: {
          select: { id: true, name: true }
        }
      }
    });

    if (approvedUnitsInCurriculum.length === 0) return null;

    // ✅ Unidad completada si TODAS las obligatorias están aprobadas
    const approvedUnitsIds = new Set(
      approvedUnitsInCurriculum.map((p) => p.unitId)
    );

    const isUnitCompleted = mandatoryLessons.every((l) =>
      approvedUnitsIds.has(l.id)
    );

    // ✅ Aprobadas = todas las lessons activas completadas (obligatorias y opcionales)
    const approvedUnits = approvedUnitsInCurriculum
      .filter((p) => p.unit)
      .map((p) => p.unit);

    // ✅ XP acumulada = suma de todas las lessons aprobadas
    const currentXpInUnit = approvedUnitsInCurriculum.reduce(
      (total, p) => total + p.experiencePoints,
      0
    );

    return {
      curriculum: {
        id: curriculum.id,
        name: curriculum.title
      },
      experiencePoints: currentXpInUnit,
      approvedUnits,
      isCompleted: isUnitCompleted
    };
  }
);

// ============== UNIT QUERIES ==============

export const getUnits = cache(async (search: string) => {
  console.log("search: ", search);
  const whereClause = {
    // isActive: true,
    ...(search
      ? {
          name: {
            contains: search,
            mode: "insensitive" // no distingue mayúsculas/minúsculas
          }
        }
      : {})
  };

  const data = await prisma.unit.findMany({
    //@ts-expect-error // --- IGNORE ---
    where: whereClause,
    include: {
      lessons: {
        where: { isActive: true },
        orderBy: { createdAt: "asc" }
      },
      curriculum: {
        select: {
          id: true,
          title: true
        }
      },
      _count: {
        select: { lessons: true, questions: true }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return data;
});

// ============== LESSON QUERIES ==============

export const getAllLessons = cache(async () => {
  const data = await prisma.lesson.findMany({
    where: {
      isActive: true
    },
    include: {
      unit: {
        select: {
          name: true
        }
      }
      // _count: {
      //   select: {
      //     questions: true
      //   }
      // }
    },
    orderBy: { createdAt: "desc" }
  });
  return data;
});

export const getLessonById = cache(async (lessonId: number) => {
  const data = await prisma.lesson.findUnique({
    where: {
      id: lessonId,
      isActive: true
    },
    include: {
      unit: true
      // questions: {
      //   where: {
      //     isActive: true
      //   },
      //   include: {
      //     answers: {
      //       orderBy: { order: "asc" }
      //     }
      //   },
      //   orderBy: { order: "asc" }
      // }
    }
  });
  return data;
});

export const getLessonsByUnitId = cache(async (unitId: number) => {
  const data = await prisma.lesson.findMany({
    where: {
      unitId,
      isActive: true
    },
    include: {
      unit: {
        select: {
          name: true
        }
      }
      // _count: {
      //   select: {
      //     questions: true
      //   }
      // }
    },
    orderBy: { position: "asc" }
  });
  return data;
});

// ============== QUESTION QUERIES ==============

export const getQuestions = cache(async (search: string) => {
  const whereClause = {
    isActive: true,
    ...(search
      ? {
          title: {
            contains: search,
            mode: "insensitive"
          }
        }
      : {})
  };

  const data = await prisma.question.findMany({
    //@ts-expect-error // --- IGNORE ---
    where: whereClause,
    include: {
      answers: true,
      unit: {
        select: {
          name: true
        }
      },
      _count: {
        select: { answers: true }
      }
    },
    orderBy: { createdAt: "asc" }
  });

  return data;
});

// ============== TEST ATTEMPT QUERIES ==============

// ============== USER STREAK QUERIES ==============

// ============== STATISTICS QUERIES ==============

// ============== SEARCH QUERIES ==============
export const getUnitsByCurriculumIdAndUserStats = cache(
  async (curriculumId: string, userId: string) => {
    const curriculum = await prisma.curriculum.findUnique({
      where: { id: curriculumId },
      include: {
        units: {
          where: { isActive: true },
          orderBy: { order: "asc" },
          include: {
            testAttempt: {
              where: { userId },
              select: {
                id: true,
                answers: {
                  where: { isCorrect: false },
                  select: { id: true }
                }
              }
            }
          }
        }
      }
    });

    if (!curriculum) {
      return {
        curriculum: null,
        units: [],
        stats: { totalAnswerErrors: 0 }
      };
    }

    const unitsWithStats = curriculum.units.map((unit) => {
      const incorrectAnswersCount = unit.testAttempt.reduce(
        (sum, attempt) => sum + attempt.answers.length,
        0
      );
      return {
        ...unit,
        incorrectAnswersCount
      };
    });

    const totalAnswerErrors = unitsWithStats.reduce(
      (sum, unit) => sum + unit.incorrectAnswersCount,
      0
    );

    return {
      curriculum: {
        id: curriculum.id,
        title: curriculum.title,
        difficulty: curriculum.difficulty,
        audienceAgeRange: curriculum.audienceAgeRange
      },
      units: unitsWithStats,
      stats: {
        totalAnswerErrors
      }
    };
  }
);
