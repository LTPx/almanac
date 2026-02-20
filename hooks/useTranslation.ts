import { useUser } from "@/context/UserContext";
import { es, Translations } from "@/locales/es";
import { en } from "@/locales/en";

const locales: Record<string, Translations> = { es, en };

export function useTranslation() {
  const user = useUser();
  const lang = user?.languagePreference ?? "es";
  const translations: Translations = locales[lang] ?? es;

  function t<S extends keyof Translations>(
    section: S,
    key: keyof Translations[S]
  ): string {
    return translations[section][key] as string;
  }

  return { t, lang };
}
