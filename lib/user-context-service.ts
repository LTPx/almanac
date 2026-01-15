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

    return {
      name: user.name || undefined,
      dateOfBirth: user.dateOfBirth || undefined,
      languagePreference: user.languagePreference || "en",
      completedCurriculums: user.userCurriculumProgress.map((cp) => ({
        title: cp.curriculum.title,
        completedAt: cp.completedAt || new Date()
      })),
      completedUnits: user.userUnitProgress.map((up) => ({
        title: up.unit.name,
        curriculumTitle: up.unit.curriculum?.title || ""
      })),
      totalExperience: totalExperience > 0 ? totalExperience : undefined
    };
  } catch (error) {
    console.error("Error fetching user context:", error);
    return {};
  }
}
