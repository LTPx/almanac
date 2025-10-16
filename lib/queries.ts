import { cache } from "react";
import prisma from "./prisma";

export const getUnitsByCurriculumId = cache(async (curriculumId: string) => {
  const data = await prisma.curriculum.findUnique({
    where: {
      id: curriculumId
    },
    include: {
      units: true,
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

export const getUserProgress = cache(async (userId: string) => {
  if (!userId) return null;
  const data = await prisma.userProgress.findMany({
    where: {
      userId
    },
    include: {
      unit: true,
      lesson: true
    },
    orderBy: [{ unit: { order: "asc" } }, { lesson: { position: "asc" } }]
  });
  return data;
});

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

export const getUserProgressByLesson = cache(
  async (userId: string, lessonId: number) => {
    if (!userId) return null;
    const data = await prisma.userProgress.findUnique({
      where: {
        userId_lessonId: {
          userId,
          lessonId
        }
      },
      include: {
        lesson: {
          include: {
            unit: true,
            questions: {
              include: {
                answers: true
              },
              orderBy: { order: "asc" }
            }
          }
        }
      }
    });
    return data;
  }
);

// ============== UNIT QUERIES ==============

export const getUnits = cache(async (search: string) => {
  console.log("search: ", search);
  const whereClause = {
    isActive: true,
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
        // include: {
        //   _count: {
        //     select: { questions: true }
        //   }
        // },
        orderBy: { position: "asc" }
      },
      _count: {
        select: { lessons: true, questions: true }
      }
    },
    orderBy: { order: "asc" }
  });

  return data;
});

export const getAllUnits = cache(async () => {
  const data = await prisma.unit.findMany({
    where: {
      isActive: true
    },
    include: {
      lessons: {
        where: {
          isActive: true
        },
        include: {
          _count: {
            select: {
              questions: true
            }
          }
        },
        orderBy: { position: "asc" }
      },
      _count: {
        select: {
          lessons: true
        }
      }
    },
    orderBy: { order: "asc" }
  });
  return data;
});

export const getUnitById = cache(async (unitId: number) => {
  const data = await prisma.unit.findUnique({
    where: {
      id: unitId,
      isActive: true
    },
    include: {
      lessons: {
        where: {
          isActive: true
        },
        include: {
          _count: {
            select: {
              questions: true
            }
          }
        },
        orderBy: { position: "asc" }
      }
    }
  });
  return data;
});

export const getUnitsWithUserProgress = cache(async (userId: string) => {
  if (!userId) return await getAllUnits();

  const data = await prisma.unit.findMany({
    where: {
      isActive: true
    },
    include: {
      lessons: {
        where: {
          isActive: true
        },
        include: {
          _count: {
            select: {
              questions: true
            }
          },
          userProgress: {
            where: {
              userId
            }
          }
        },
        orderBy: { position: "asc" }
      },
      userProgress: {
        where: {
          userId
        }
      }
    },
    orderBy: { order: "asc" }
  });
  return data;
});

// ============== LESSON QUERIES ==============

export const getLessons = cache(async (search: string) => {
  const whereClause = {
    isActive: true,
    ...(search
      ? {
          name: {
            contains: search,
            mode: "insensitive" // no distingue mayúsculas/minúsculas
          }
        }
      : {})
  };

  const data = await prisma.lesson.findMany({
    //@ts-expect-error // --- IGNORE ---
    where: whereClause,
    include: {
      questions: true,
      _count: {
        select: { questions: true }
      }
    },
    orderBy: { position: "asc" }
  });

  return data;
});

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
      },
      _count: {
        select: {
          questions: true
        }
      }
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
      unit: true,
      questions: {
        where: {
          isActive: true
        },
        include: {
          answers: {
            orderBy: { order: "asc" }
          }
        },
        orderBy: { order: "asc" }
      }
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
      },
      _count: {
        select: {
          questions: true
        }
      }
    },
    orderBy: { position: "asc" }
  });
  return data;
});

export const getLessonWithUserProgress = cache(
  async (lessonId: number, userId: string) => {
    if (!userId) return await getLessonById(lessonId);

    const data = await prisma.lesson.findUnique({
      where: {
        id: lessonId,
        isActive: true
      },
      include: {
        unit: true,
        questions: {
          where: {
            isActive: true
          },
          include: {
            answers: {
              orderBy: { order: "asc" }
            }
          },
          orderBy: { order: "asc" }
        },
        userProgress: {
          where: {
            userId
          }
        }
      }
    });
    return data;
  }
);

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
      lesson: {
        select: {
          name: true,
          unit: {
            select: {
              name: true
            }
          }
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

export const getQuestionsByLessonId = cache(async (lessonId: number) => {
  const data = await prisma.question.findMany({
    where: {
      lessonId,
      isActive: true
    },
    include: {
      answers: {
        orderBy: { order: "asc" }
      }
    },
    orderBy: { order: "asc" }
  });
  return data;
});

export const getQuestionById = cache(async (questionId: number) => {
  const data = await prisma.question.findUnique({
    where: {
      id: questionId,
      isActive: true
    },
    include: {
      lesson: {
        include: {
          unit: true
        }
      },
      answers: {
        orderBy: { order: "asc" }
      }
    }
  });
  return data;
});

// ============== TEST ATTEMPT QUERIES ==============

export const getUserTestAttempts = cache(
  async (userId: string, lessonId?: number) => {
    if (!userId) return null;

    const whereClause: any = { userId };
    if (lessonId) whereClause.lessonId = lessonId;

    const data = await prisma.testAttempt.findMany({
      where: whereClause,
      include: {
        lesson: {
          include: {
            unit: true
          }
        },
        answers: {
          include: {
            question: true
          }
        }
      },
      orderBy: { startedAt: "desc" }
    });
    return data;
  }
);

export const getTestAttemptById = cache(
  async (attemptId: number, userId: string) => {
    if (!userId) return null;

    const data = await prisma.testAttempt.findUnique({
      where: {
        id: attemptId
      },
      include: {
        lesson: {
          include: {
            unit: true,
            questions: {
              include: {
                answers: true
              }
            }
          }
        },
        answers: {
          include: {
            question: {
              include: {
                answers: true
              }
            }
          }
        }
      }
    });

    // Verificar que el intento pertenece al usuario
    if (data?.userId !== userId) return null;

    return data;
  }
);

export const getLatestTestAttemptByLesson = cache(
  async (userId: string, lessonId: number) => {
    if (!userId) return null;

    const data = await prisma.testAttempt.findFirst({
      where: {
        userId,
        lessonId
      },
      include: {
        answers: {
          include: {
            question: true
          }
        }
      },
      orderBy: { startedAt: "desc" }
    });
    return data;
  }
);

// ============== USER STREAK QUERIES ==============

export const getUserStreak = cache(async (userId: string) => {
  if (!userId) return null;

  const data = await prisma.userStreak.findUnique({
    where: {
      userId
    }
  });
  return data;
});

// ============== STATISTICS QUERIES ==============

export const getUserStatistics = cache(async (userId: string) => {
  if (!userId) return null;

  const [
    totalProgress,
    completedLessons,
    totalExperience,
    testAttempts,
    streak
  ] = await Promise.all([
    prisma.userProgress.count({
      where: { userId }
    }),
    prisma.userProgress.count({
      where: {
        userId,
        isCompleted: true
      }
    }),
    prisma.userProgress.aggregate({
      where: { userId },
      _sum: {
        experiencePoints: true
      }
    }),
    prisma.testAttempt.count({
      where: {
        userId,
        isCompleted: true
      }
    }),
    prisma.userStreak.findUnique({
      where: { userId }
    })
  ]);

  return {
    totalProgress,
    completedLessons,
    totalExperience: totalExperience._sum.experiencePoints || 0,
    completedTests: testAttempts,
    currentStreak: streak?.currentStreak || 0,
    longestStreak: streak?.longestStreak || 0
  };
});

export const getLessonStatistics = cache(async (lessonId: number) => {
  const [totalQuestions, averageScore, completionRate] = await Promise.all([
    prisma.question.count({
      where: {
        lessonId,
        isActive: true
      }
    }),
    prisma.testAttempt.aggregate({
      where: {
        lessonId,
        isCompleted: true
      },
      _avg: {
        score: true
      }
    }),
    prisma.testAttempt.count({
      where: {
        lessonId,
        isCompleted: true
      }
    })
  ]);

  return {
    totalQuestions,
    averageScore: averageScore._avg.score || 0,
    totalAttempts: completionRate
  };
});

// ============== SEARCH QUERIES ==============

export const searchContent = cache(async (query: string) => {
  const searchTerms = query.split(" ").filter((term) => term.length > 2);

  const [units, lessons, questions] = await Promise.all([
    prisma.unit.findMany({
      where: {
        isActive: true,
        OR: searchTerms.map((term) => ({
          OR: [
            { name: { contains: term, mode: "insensitive" } },
            { description: { contains: term, mode: "insensitive" } }
          ]
        }))
      },
      include: {
        lessons: {
          where: { isActive: true },
          take: 3
        }
      }
    }),
    prisma.lesson.findMany({
      where: {
        isActive: true,
        OR: searchTerms.map((term) => ({
          OR: [
            { name: { contains: term, mode: "insensitive" } },
            { description: { contains: term, mode: "insensitive" } }
          ]
        }))
      },
      include: {
        unit: true
      },
      take: 10
    }),
    prisma.question.findMany({
      where: {
        isActive: true,
        OR: searchTerms.map((term) => ({
          title: { contains: term, mode: "insensitive" }
        }))
      },
      include: {
        lesson: {
          include: {
            unit: true
          }
        }
      },
      take: 20
    })
  ]);

  return {
    units,
    lessons,
    questions
  };
});
