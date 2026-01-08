import prisma from "./prisma";
import { UserContext } from "./almanac-agent";

/**
 * Obtiene el contexto del usuario para personalizar el tutor
 */
export async function getUserContext(userId: string): Promise<UserContext> {
  try {
    // Obtener datos básicos del usuario
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        dateOfBirth: true,
        languagePreference: true,
        userCurriculumProgress: {
          where: { isCompleted: true },
          include: {
            curriculum: {
              select: {
                title: true
              }
            }
          },
          orderBy: {
            completedAt: "desc"
          }
        },
        userUnitProgress: {
          where: {
            completedAt: {
              not: null
            }
          },
          include: {
            unit: {
              include: {
                curriculum: {
                  select: {
                    title: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!user) {
      return {};
    }

    // Calcular experiencia total
    const curriculumExp = user.userCurriculumProgress.reduce(
      (sum, cp) => sum + cp.experiencePoints,
      0
    );
    const unitExp = user.userUnitProgress.reduce(
      (sum, up) => sum + up.experiencePoints,
      0
    );
    const totalExperience = curriculumExp + unitExp;

    // Obtener todas las unidades disponibles (activas y publicadas)
    const availableUnits = await prisma.unit.findMany({
      where: {
        isActive: true
      },
      select: {
        id: true,
        name: true,
        curriculum: {
          select: {
            id: true,
            title: true
          }
        }
      },
      orderBy: [{ curriculum: { title: "asc" } }],
      take: 20 // Limitar a 20 unidades para no saturar el prompt
    });

    return {
      name: user.name || undefined,
      dateOfBirth: user.dateOfBirth || undefined,
      completedCurriculums: user.userCurriculumProgress.map((cp) => ({
        title: cp.curriculum.title,
        completedAt: cp.completedAt || new Date()
      })),
      completedUnits: user.userUnitProgress.map((up) => ({
        title: up.unit.name,
        curriculumTitle: up.unit.curriculum?.title || ""
      })),
      totalExperience: totalExperience > 0 ? totalExperience : undefined,
      availableUnits: availableUnits.map((unit) => ({
        id: unit.id,
        name: unit.name,
        curriculumId: unit.curriculum?.id || "",
        curriculumTitle: unit.curriculum?.title || ""
      }))
    };
  } catch (error) {
    console.error("Error fetching user context:", error);
    return {};
  }
}
