interface ExperienceCalculationParams {
  baseExperience: number;
  totalQuestions: number;
  correctAnswers: number;
  totalAttempts: number; // 🆕 Total de respuestas (incluyendo reintentos)
  timeElapsedSeconds: number;
  isFirstAttempt: boolean;
}

interface ExperienceResult {
  finalExperience: number;
  breakdown: {
    base: number;
    accuracyBonus: number;
    speedBonus: number;
    perfectBonus: number;
    retryPenalty: number;
    repeatPenalty: number;
  };
}

export function calculateExperience(
  params: ExperienceCalculationParams
): ExperienceResult {
  const {
    baseExperience,
    totalQuestions,
    correctAnswers,
    totalAttempts,
    timeElapsedSeconds,
    isFirstAttempt
  } = params;

  const incorrectAnswers = totalQuestions - correctAnswers;
  const accuracyRate = correctAnswers / totalQuestions;

  // 🆕 Calcular número de reintentos (respuestas extra)
  const retries = totalAttempts - totalQuestions;
  const retryRate = retries / totalQuestions; // % de preguntas reintentadas

  // 1. XP BASE (60% del total)
  const baseXP = baseExperience * 0.6;

  // 2. BONUS POR PRECISIÓN (30% del total)
  // Se basa en el resultado final (cuántas correctas al final)
  const accuracyBonus = baseExperience * 0.3 * accuracyRate;

  // 3. BONUS POR VELOCIDAD (10% del total)
  const idealTimePerQuestion = 30; // 30 segundos por pregunta
  const idealTotalTime = idealTimePerQuestion * totalQuestions;

  let speedBonus = 0;
  if (timeElapsedSeconds <= idealTotalTime) {
    const timeRatio = timeElapsedSeconds / idealTotalTime;
    speedBonus = baseExperience * 0.1 * (2 - timeRatio);
  } else {
    const overtimeRatio = Math.min(timeElapsedSeconds / idealTotalTime, 2);
    speedBonus = baseExperience * 0.1 * (2 - overtimeRatio);
  }
  speedBonus = Math.max(0, speedBonus);

  // 4. BONUS PERFECTO (+20% adicional)
  // Solo si no tiene errores finales Y no reintentó ninguna pregunta
  const perfectBonus =
    incorrectAnswers === 0 && retries === 0 ? baseExperience * 0.2 : 0;

  // 🆕 5. PENALIZACIÓN POR REINTENTOS
  // Por cada reintento, se reduce un % del XP
  // Ejemplo: 2 reintentos en 10 preguntas = 20% menos XP
  const retryPenalty = retryRate * 0.5; // 50% de penalización por cada pregunta reintentada
  const retryMultiplier = Math.max(0.5, 1 - retryPenalty); // Mínimo 50% del XP

  // 6. CÁLCULO FINAL
  let finalExperience =
    (baseXP + accuracyBonus + speedBonus + perfectBonus) * retryMultiplier;

  // 7. Penalización por repetición de test completo (-50%)
  if (!isFirstAttempt) {
    finalExperience = finalExperience * 0.5;
  }

  finalExperience = Math.round(finalExperience);
  finalExperience = Math.max(1, finalExperience);

  return {
    finalExperience,
    breakdown: {
      base: Math.round(baseXP),
      accuracyBonus: Math.round(accuracyBonus),
      speedBonus: Math.round(speedBonus),
      perfectBonus: Math.round(perfectBonus),
      retryPenalty: Math.round(retryPenalty * 100), // Como porcentaje
      repeatPenalty: isFirstAttempt ? 0 : -50
    }
  };
}

export function getFinalAnswers(answers: any[]) {
  // Agrupar respuestas por pregunta y tomar la última
  const answersByQuestion = new Map();

  answers.forEach((answer) => {
    const questionId = answer.questionId;
    const existing = answersByQuestion.get(questionId);

    // Si no existe o la actual es más reciente, actualizar
    if (
      !existing ||
      new Date(answer.createdAt) > new Date(existing.createdAt)
    ) {
      answersByQuestion.set(questionId, answer);
    }
  });

  return Array.from(answersByQuestion.values());
}
