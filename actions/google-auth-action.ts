import { authClient } from "@/lib/auth-client";

export const signInWithGoogle = async () => {
  // Detectar el idioma del navegador
  const browserLanguage = typeof navigator !== 'undefined'
    ? navigator.language.split('-')[0] // Obtener solo el código del idioma (ej: 'es' de 'es-ES')
    : 'en'; // Default a inglés si no está disponible

  // Guardar el idioma en sessionStorage para usarlo después del callback de OAuth
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.setItem('preferredLanguage', browserLanguage);
  }

  await authClient.signIn.social({
    provider: "google"
  });
};
