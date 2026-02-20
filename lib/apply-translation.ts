/**
 * Maps the user's languagePreference (ISO 639-1: "es", "en")
 * to the Language enum used in the DB ("ES", "EN").
 * Defaults to "EN" if unknown or missing.
 */
export function toLangCode(lang: string | null | undefined): "EN" | "ES" {
  return lang?.toUpperCase() === "ES" ? "ES" : "EN";
}

/**
 * Returns Prisma include filters for QuestionTranslation and AnswerTranslation.
 * Pass the result directly into the Prisma `include` block.
 */
export function questionTranslationFilters(lang: "EN" | "ES") {
  if (lang !== "ES")
    return { translations: false as const, answerTranslations: false as const };
  return {
    translations: {
      where: { language: "ES" as const },
      select: { title: true, content: true }
    },
    answerTranslations: false as const // answers handle their own filter
  };
}

export function answerTranslationFilter(lang: "EN" | "ES") {
  if (lang !== "ES") return false as const;
  return { where: { language: "ES" as const }, select: { text: true } };
}

/**
 * Builds a translated question object for the client.
 * Applies QuestionTranslation (title, content) and AnswerTranslation (text).
 * Preserves the ORDER_WORDS words-shuffle expectation (caller handles shuffle).
 */
export function applyQuestionTranslation(question: any) {
  const qT = question.translations?.[0];
  const title = qT?.title || question.title;
  const content =
    qT?.content && Object.keys(qT.content).length > 0
      ? qT.content
      : question.content;

  const answers = question.answers?.map((ans: any) => ({
    id: ans.id,
    text: ans.translations?.[0]?.text || ans.text
  }));

  return { title, content, answers };
}

/**
 * Overlays translated fields onto an item.
 * Only replaces fields that have a non-empty value in the translation.
 */
export function applyTranslation<T extends Record<string, any>>(
  item: T,
  translation: Record<string, any> | null | undefined,
  fields: (keyof T)[]
): T {
  if (!translation) return item;
  const result = { ...item };
  for (const field of fields) {
    const val = translation[field as string];
    if (val != null && val !== "") {
      result[field] = val;
    }
  }
  return result;
}
