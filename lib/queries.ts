import { cache } from "react"
import prisma from "./prisma"

// ============== USER PROGRESS QUERIES ==============

export const getUserProgress = cache(async (userId: string) => {
  if (!userId) return null
  const data = await prisma.userProgress.findMany({
    where: {
      userId,
    },
    include: {
      unit: true,
      lesson: true,
    },
    orderBy: [{ unit: { order: "asc" } }, { lesson: { position: "asc" } }],
  })
  return data
})

export const getUserProgressByUnit = cache(
  async (userId: string, unitId: number) => {
    if (!userId) return null
    const data = await prisma.userProgress.findUnique({
      where: {
        userId_unitId: {
          userId,
          unitId,
        },
      },
      include: {
        unit: {
          include: {
            lessons: {
              include: {
                _count: {
                  select: {
                    questions: true,
                  },
                },
              },
              orderBy: { position: "asc" },
            },
          },
        },
      },
    })
    return data
  },
)

export const getUserProgressByLesson = cache(
  async (userId: string, lessonId: number) => {
    if (!userId) return null
    const data = await prisma.userProgress.findUnique({
      where: {
        userId_lessonId: {
          userId,
          lessonId,
        },
      },
      include: {
        lesson: {
          include: {
            unit: true,
            questions: {
              include: {
                answers: true,
              },
              orderBy: { order: "asc" },
            },
          },
        },
      },
    })
    return data
  },
)

// ============== UNIT QUERIES ==============

export const getAllUnits = cache(async () => {
  const data = await prisma.unit.findMany({
    where: {
      isActive: true,
    },
    include: {
      lessons: {
        where: {
          isActive: true,
        },
        include: {
          _count: {
            select: {
              questions: true,
            },
          },
        },
        orderBy: { position: "asc" },
      },
      _count: {
        select: {
          lessons: true,
        },
      },
    },
    orderBy: { order: "asc" },
  })
  return data
})

export const getUnitById = cache(async (unitId: number) => {
  const data = await prisma.unit.findUnique({
    where: {
      id: unitId,
      isActive: true,
    },
    include: {
      lessons: {
        where: {
          isActive: true,
        },
        include: {
          _count: {
            select: {
              questions: true,
            },
          },
        },
        orderBy: { position: "asc" },
      },
    },
  })
  return data
})

export const getUnitsWithUserProgress = cache(async (userId: string) => {
  if (!userId) return await getAllUnits()

  const data = await prisma.unit.findMany({
    where: {
      isActive: true,
    },
    include: {
      lessons: {
        where: {
          isActive: true,
        },
        include: {
          _count: {
            select: {
              questions: true,
            },
          },
          userProgress: {
            where: {
              userId,
            },
          },
        },
        orderBy: { position: "asc" },
      },
      userProgress: {
        where: {
          userId,
        },
      },
    },
    orderBy: { order: "asc" },
  })
  return data
})

// ============== LESSON QUERIES ==============

export const getLessonById = cache(async (lessonId: number) => {
  const data = await prisma.lesson.findUnique({
    where: {
      id: lessonId,
      isActive: true,
    },
    include: {
      unit: true,
      questions: {
        where: {
          isActive: true,
        },
        include: {
          answers: {
            orderBy: { order: "asc" },
          },
        },
        orderBy: { order: "asc" },
      },
    },
  })
  return data
})

export const getLessonsByUnitId = cache(async (unitId: number) => {
  const data = await prisma.lesson.findMany({
    where: {
      unitId,
      isActive: true,
    },
    include: {
      _count: {
        select: {
          questions: true,
        },
      },
    },
    orderBy: { position: "asc" },
  })
  return data
})

export const getLessonWithUserProgress = cache(
  async (lessonId: number, userId: string) => {
    if (!userId) return await getLessonById(lessonId)

    const data = await prisma.lesson.findUnique({
      where: {
        id: lessonId,
        isActive: true,
      },
      include: {
        unit: true,
        questions: {
          where: {
            isActive: true,
          },
          include: {
            answers: {
              orderBy: { order: "asc" },
            },
          },
          orderBy: { order: "asc" },
        },
        userProgress: {
          where: {
            userId,
          },
        },
      },
    })
    return data
  },
)

// ============== QUESTION QUERIES ==============

export const getQuestionsByLessonId = cache(async (lessonId: number) => {
  const data = await prisma.question.findMany({
    where: {
      lessonId,
      isActive: true,
    },
    include: {
      answers: {
        orderBy: { order: "asc" },
      },
    },
    orderBy: { order: "asc" },
  })
  return data
})

export const getQuestionById = cache(async (questionId: number) => {
  const data = await prisma.question.findUnique({
    where: {
      id: questionId,
      isActive: true,
    },
    include: {
      lesson: {
        include: {
          unit: true,
        },
      },
      answers: {
        orderBy: { order: "asc" },
      },
    },
  })
  return data
})

// ============== TEST ATTEMPT QUERIES ==============

export const getUserTestAttempts = cache(
  async (userId: string, lessonId?: number) => {
    if (!userId) return null

    const whereClause: any = { userId }
    if (lessonId) whereClause.lessonId = lessonId

    const data = await prisma.testAttempt.findMany({
      where: whereClause,
      include: {
        lesson: {
          include: {
            unit: true,
          },
        },
        answers: {
          include: {
            question: true,
          },
        },
      },
      orderBy: { startedAt: "desc" },
    })
    return data
  },
)

export const getTestAttemptById = cache(
  async (attemptId: number, userId: string) => {
    if (!userId) return null

    const data = await prisma.testAttempt.findUnique({
      where: {
        id: attemptId,
      },
      include: {
        lesson: {
          include: {
            unit: true,
            questions: {
              include: {
                answers: true,
              },
            },
          },
        },
        answers: {
          include: {
            question: {
              include: {
                answers: true,
              },
            },
          },
        },
      },
    })

    // Verificar que el intento pertenece al usuario
    if (data?.userId !== userId) return null

    return data
  },
)

export const getLatestTestAttemptByLesson = cache(
  async (userId: string, lessonId: number) => {
    if (!userId) return null

    const data = await prisma.testAttempt.findFirst({
      where: {
        userId,
        lessonId,
      },
      include: {
        answers: {
          include: {
            question: true,
          },
        },
      },
      orderBy: { startedAt: "desc" },
    })
    return data
  },
)

// ============== USER STREAK QUERIES ==============

export const getUserStreak = cache(async (userId: string) => {
  if (!userId) return null

  const data = await prisma.userStreak.findUnique({
    where: {
      userId,
    },
  })
  return data
})

// ============== STATISTICS QUERIES ==============

export const getUserStatistics = cache(async (userId: string) => {
  if (!userId) return null

  const [
    totalProgress,
    completedLessons,
    totalExperience,
    testAttempts,
    streak,
  ] = await Promise.all([
    prisma.userProgress.count({
      where: { userId },
    }),
    prisma.userProgress.count({
      where: {
        userId,
        isCompleted: true,
      },
    }),
    prisma.userProgress.aggregate({
      where: { userId },
      _sum: {
        experiencePoints: true,
      },
    }),
    prisma.testAttempt.count({
      where: {
        userId,
        isCompleted: true,
      },
    }),
    prisma.userStreak.findUnique({
      where: { userId },
    }),
  ])

  return {
    totalProgress,
    completedLessons,
    totalExperience: totalExperience._sum.experiencePoints || 0,
    completedTests: testAttempts,
    currentStreak: streak?.currentStreak || 0,
    longestStreak: streak?.longestStreak || 0,
  }
})

export const getLessonStatistics = cache(async (lessonId: number) => {
  const [totalQuestions, averageScore, completionRate] = await Promise.all([
    prisma.question.count({
      where: {
        lessonId,
        isActive: true,
      },
    }),
    prisma.testAttempt.aggregate({
      where: {
        lessonId,
        isCompleted: true,
      },
      _avg: {
        score: true,
      },
    }),
    prisma.testAttempt.count({
      where: {
        lessonId,
        isCompleted: true,
      },
    }),
  ])

  return {
    totalQuestions,
    averageScore: averageScore._avg.score || 0,
    totalAttempts: completionRate,
  }
})

// ============== SEARCH QUERIES ==============

export const searchContent = cache(async (query: string, userId?: string) => {
  const searchTerms = query.split(" ").filter((term) => term.length > 2)

  const [units, lessons, questions] = await Promise.all([
    prisma.unit.findMany({
      where: {
        isActive: true,
        OR: searchTerms.map((term) => ({
          OR: [
            { name: { contains: term, mode: "insensitive" } },
            { description: { contains: term, mode: "insensitive" } },
          ],
        })),
      },
      include: {
        lessons: {
          where: { isActive: true },
          take: 3,
        },
      },
    }),
    prisma.lesson.findMany({
      where: {
        isActive: true,
        OR: searchTerms.map((term) => ({
          OR: [
            { name: { contains: term, mode: "insensitive" } },
            { description: { contains: term, mode: "insensitive" } },
          ],
        })),
      },
      include: {
        unit: true,
      },
      take: 10,
    }),
    prisma.question.findMany({
      where: {
        isActive: true,
        OR: searchTerms.map((term) => ({
          title: { contains: term, mode: "insensitive" },
        })),
      },
      include: {
        lesson: {
          include: {
            unit: true,
          },
        },
      },
      take: 20,
    }),
  ])

  return {
    units,
    lessons,
    questions,
  }
})
