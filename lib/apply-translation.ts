/**
 * Maps the user's languagePreference (ISO 639-1: "es", "en")
 * to the Language enum used in the DB ("ES", "EN").
 * Defaults to "EN" if unknown or missing.
 */
export function toLangCode(lang: string | null | undefined): "EN" | "ES" {
  return lang?.toUpperCase() === "ES" ? "ES" : "EN";
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
