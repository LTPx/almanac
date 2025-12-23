import prisma from "./prisma";

export interface AlmanacTopicData {
  id: string;
  title: string;
  description: string;
  content: string;
  unitName?: string;
  curriculumTitle?: string;
}

/**
 * Obtiene todos los temas disponibles del Almanac (basado en Lessons activas)
 */
export async function getAvailableTopics(): Promise<
  Map<string, AlmanacTopicData>
> {
  const lessons = await prisma.lesson.findMany({
    where: {
      isActive: true,
      unit: {
        isActive: true,
        curriculum: {
          isActive: true
        }
      }
    },
    include: {
      facts: {
        orderBy: {
          createdAt: "asc"
        }
      },
      learningObjectives: true,
      unit: {
        include: {
          curriculum: true
        }
      }
    }
  });

  const topicsMap = new Map<string, AlmanacTopicData>();

  for (const lesson of lessons) {
    // Crear un ID único para el tema basado en el lesson id
    const topicId = `lesson_${lesson.id}`;

    // Generar descripción a partir de learning objectives
    const description =
      lesson.learningObjectives.length > 0
        ? lesson.learningObjectives.map((obj) => obj.text).join(", ")
        : lesson.description || lesson.name;

    // Generar contenido a partir de los facts
    const content =
      lesson.facts.length > 0
        ? lesson.facts
            .map((fact) => {
              const prefix = fact.core ? "🔑 CORE FACT:" : "📚 Fact:";
              return `${prefix} ${fact.text}`;
            })
            .join("\n\n")
        : lesson.description || "No content available for this lesson.";

    topicsMap.set(topicId, {
      id: topicId,
      title: lesson.name,
      description: description.substring(0, 200), // Limitar descripción para el router
      content: content,
      unitName: lesson.unit.name,
      curriculumTitle: lesson.unit.curriculum?.title
    });
  }

  return topicsMap;
}

/**
 * Obtiene un tema específico por ID
 */
export async function getTopicById(
  topicId: string
): Promise<AlmanacTopicData | null> {
  // Extraer el lesson ID del topicId
  const lessonId = parseInt(topicId.replace("lesson_", ""));

  if (isNaN(lessonId)) {
    return null;
  }

  const lesson = await prisma.lesson.findFirst({
    where: {
      id: lessonId,
      isActive: true
    },
    include: {
      facts: {
        orderBy: {
          createdAt: "asc"
        }
      },
      learningObjectives: true,
      unit: {
        include: {
          curriculum: true
        }
      }
    }
  });

  if (!lesson) {
    return null;
  }

  const description =
    lesson.learningObjectives.length > 0
      ? lesson.learningObjectives.map((obj) => obj.text).join(", ")
      : lesson.description || lesson.name;

  const content =
    lesson.facts.length > 0
      ? lesson.facts
          .map((fact) => {
            const prefix = fact.core ? "🔑 CORE FACT:" : "📚 Fact:";
            return `${prefix} ${fact.text}`;
          })
          .join("\n\n")
      : lesson.description || "No content available for this lesson.";

  return {
    id: topicId,
    title: lesson.name,
    description: description.substring(0, 200),
    content: content,
    unitName: lesson.unit.name,
    curriculumTitle: lesson.unit.curriculum?.title
  };
}

/**
 * Busca temas por palabras clave en el título o descripción
 */
export async function searchTopics(query: string): Promise<AlmanacTopicData[]> {
  const lessons = await prisma.lesson.findMany({
    where: {
      isActive: true,
      unit: {
        isActive: true,
        curriculum: {
          isActive: true
        }
      },
      OR: [
        {
          name: {
            contains: query,
            mode: "insensitive"
          }
        },
        {
          description: {
            contains: query,
            mode: "insensitive"
          }
        }
      ]
    },
    include: {
      facts: {
        orderBy: {
          createdAt: "asc"
        }
      },
      learningObjectives: true,
      unit: {
        include: {
          curriculum: true
        }
      }
    },
    take: 10
  });

  return lessons.map((lesson) => {
    const description =
      lesson.learningObjectives.length > 0
        ? lesson.learningObjectives.map((obj) => obj.text).join(", ")
        : lesson.description || lesson.name;

    const content =
      lesson.facts.length > 0
        ? lesson.facts
            .map((fact) => {
              const prefix = fact.core ? "🔑 CORE FACT:" : "📚 Fact:";
              return `${prefix} ${fact.text}`;
            })
            .join("\n\n")
        : lesson.description || "No content available for this lesson.";

    return {
      id: `lesson_${lesson.id}`,
      title: lesson.name,
      description: description.substring(0, 200),
      content: content,
      unitName: lesson.unit.name,
      curriculumTitle: lesson.unit.curriculum?.title
    };
  });
}

/**
 * Obtiene estadísticas de los temas disponibles
 */
export async function getTopicsStats() {
  const totalLessons = await prisma.lesson.count({
    where: {
      isActive: true,
      unit: {
        isActive: true,
        curriculum: {
          isActive: true
        }
      }
    }
  });

  const totalFacts = await prisma.fact.count({
    where: {
      lesson: {
        isActive: true,
        unit: {
          isActive: true,
          curriculum: {
            isActive: true
          }
        }
      }
    }
  });

  const totalCurriculums = await prisma.curriculum.count({
    where: {
      isActive: true
    }
  });

  return {
    totalTopics: totalLessons,
    totalFacts: totalFacts,
    totalCurriculums: totalCurriculums
  };
}
