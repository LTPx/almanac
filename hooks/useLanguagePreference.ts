"use client";

import { useEffect } from "react";

export function useLanguagePreference(
  user: { id: string; languagePreference?: string | null } | null
) {
  useEffect(() => {
    async function updateLanguagePreference() {
      // Solo actualizar si el usuario está autenticado y no tiene idioma establecido
      if (!user || user.languagePreference) {
        return;
      }

      try {
        // Detectar el idioma del navegador
        const browserLanguage =
          typeof navigator !== "undefined"
            ? navigator.language.split("-")[0] // Obtener solo el código del idioma (ej: 'es' de 'es-ES')
            : "en"; // Default a inglés si no está disponible

        // Enviar la preferencia de idioma al servidor
        const response = await fetch("/api/user/language-preference", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ languagePreference: browserLanguage })
        });

        if (!response.ok) {
          console.error("Failed to update language preference");
        }
      } catch (error) {
        console.error("Error updating language preference:", error);
      }
    }

    updateLanguagePreference();
  }, [user]);
}
