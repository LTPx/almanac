type QuestionType = "MULTIPLE_CHOICE" | "FILL_IN_BLANK" | "ORDER_WORDS" | "TRUE_FALSE";

/**
 * Extracts the translatable text fields from a question's content JSON
 * into a flat key-value object suitable for sending to Gemini.
 *
 * Keys are prefixed with "content_" to avoid collisions with title/name fields.
 */
export function getTranslatableContentFields(
  type: QuestionType,
  content: any
): Record<string, string> {
  const fields: Record<string, string> = {};
  if (!content) return fields;

  switch (type) {
    case "FILL_IN_BLANK":
      if (content.sentence) fields.content_sentence = content.sentence;
      if (content.explanation) fields.content_explanation = content.explanation;
      if (typeof content.correctAnswer === "string" && content.correctAnswer)
        fields.content_correctAnswer = content.correctAnswer;
      break;

    case "MULTIPLE_CHOICE":
      if (content.explanation) fields.content_explanation = content.explanation;
      if (typeof content.correctAnswer === "string" && content.correctAnswer)
        fields.content_correctAnswer = content.correctAnswer;
      if (Array.isArray(content.options)) {
        content.options.forEach((opt: string, i: number) => {
          if (opt) fields[`content_option_${i}`] = opt;
        });
      }
      break;

    case "TRUE_FALSE":
      // correctAnswer is boolean — no translation needed
      if (content.explanation) fields.content_explanation = content.explanation;
      break;

    case "ORDER_WORDS":
      if (content.sentence) fields.content_sentence = content.sentence;
      if (content.explanation) fields.content_explanation = content.explanation;
      if (Array.isArray(content.words)) {
        content.words.forEach((w: string, i: number) => {
          if (w) fields[`content_word_${i}`] = w;
        });
      }
      break;
  }

  return fields;
}

/**
 * Rebuilds the translated content JSON from the flat translated fields,
 * merging with the original content to preserve non-translatable fields.
 */
export function buildTranslatedContent(
  type: QuestionType,
  originalContent: any,
  translated: Record<string, string>
): any {
  if (!originalContent) return originalContent;
  const result = { ...originalContent };

  switch (type) {
    case "FILL_IN_BLANK":
      if (translated.content_sentence) result.sentence = translated.content_sentence;
      if (translated.content_explanation) result.explanation = translated.content_explanation;
      if (translated.content_correctAnswer) result.correctAnswer = translated.content_correctAnswer;
      break;

    case "MULTIPLE_CHOICE":
      if (translated.content_explanation) result.explanation = translated.content_explanation;
      if (translated.content_correctAnswer) result.correctAnswer = translated.content_correctAnswer;
      if (Array.isArray(originalContent.options)) {
        result.options = originalContent.options.map(
          (opt: string, i: number) => translated[`content_option_${i}`] || opt
        );
      }
      break;

    case "TRUE_FALSE":
      if (translated.content_explanation) result.explanation = translated.content_explanation;
      break;

    case "ORDER_WORDS": {
      if (translated.content_sentence) result.sentence = translated.content_sentence;
      if (translated.content_explanation) result.explanation = translated.content_explanation;
      if (Array.isArray(originalContent.words)) {
        const translatedWords = originalContent.words.map(
          (w: string, i: number) => translated[`content_word_${i}`] || w
        );
        result.words = translatedWords;
        // Rebuild correctOrder: map each original word to its translated equivalent
        if (Array.isArray(originalContent.correctOrder)) {
          result.correctOrder = originalContent.correctOrder.map((w: string) => {
            const idx = originalContent.words.indexOf(w);
            return idx !== -1 ? (translated[`content_word_${idx}`] || w) : w;
          });
        }
      }
      break;
    }
  }

  return result;
}
