export const es = {
  home: {
    loading: "Cargando",
    loadingProgress: "Cargando tu progreso",
    preparingAll: "Preparando todo para ti..."
  },
  contents: {
    loadingUnits: "Cargando unidades...",
    noCurriculum: "No se ha seleccionado un curriculum",
    noData: "Sin datos",
    retry: "Reintentar",
    noHearts: "Sin Corazones",
    start: "Empezar",
    locked: "Bloqueada",
    topics: "Temas",
    yourHistory: "Tu Historia",
    concepts: "Conceptos",
    errors: "Errores",
    reviewRecentErrors: "Repasa tus errores recientes",
    startReview: "EMPEZAR MI REPASO"
  },
  errorsPage: {
    backToContents: "Volver a Contenidos",
    yourErrors: "Tus Errores",
    question: "pregunta",
    questions: "preguntas",
    noErrors: "No tienes errores registrados",
    correctAnswer: "Respuesta correcta:",
    correctOrder: "Orden correcto:",
    startReview: "EMPEZAR MI REPASO",
    missingParams: "Faltan parámetros requeridos",
    errorFetching: "Error al obtener errores"
  },
  leaderboard: {
    loading: "Cargando leaderboard...",
    division: "División Papel",
    days: "3 Días",
    promotionZone: "Zona de Ascenso",
    demotionZone: "Zona de Descenso",
    unknownError: "Error desconocido",
    errorLoading: "Error al cargar el leaderboard",
    serverError: "Error en la respuesta del servidor"
  },
  achievements: {
    medals: "Medallas",
    available: "Disponible",
    explore: "Explorar"
  },
  payments: {
    successTitle: "¡Pago completado! 🎉",
    tokensText:
      "Gracias por tu compra. Tus tokens estarán disponibles en tu cuenta en unos momentos.",
    subscriptionText:
      "Hemos activado tu subscription. No mas anuncios y vidas sin limites.",
    backToExam: "Volver al examen",
    backToHome: "Volver al inicio",
    cancelTitle: "Pago cancelado ❌",
    cancelDescription:
      "Parece que el proceso de pago no se completó. Puedes intentarlo nuevamente cuando quieras."
  },
  settings: {
    title: "Configuración",
    languageSection: "Idioma / Language",
    selectLanguage: "Selecciona tu idioma",
    account: "Cuenta",
    preferences: "Preferencias",
    profile: "Perfil",
    notifications: "Notificaciones",
    privacy: "Ajustes de privacidad",
    help: "Ayuda",
    faq: "F.A.Q.",
    support: "Soporte",
    logout: "Cerrar sesión",
    loggingOut: "Cerrando sesión...",
    logoutSuccess: "Sesión cerrada con éxito",
    logoutError: "Error al cerrar sesión",
    languageUpdated: "Idioma actualizado con éxito",
    languageUpdateError: "Error al actualizar idioma"
  },
  tutorial: {
    contentsTitle: "Explora los Contenidos",
    contentsDesc: "Revisa las explicaciones detalladas",
    testTitle: "Práctica Interactiva",
    testDesc: "Demo del sistema de pruebas",
    chatTitle: "Demo del Tutor",
    chatDesc: "Conoce a tu tutor personal",
    nftTitle: "Crea tu Medalla NFT",
    nftDesc: "Aprende a mintear tus certificados"
  },
  general: {
    startTest: "Empezar mi Prueba"
  },
  profile: {
    addFriends: "Agrega Amigos",
    viewTutorial: "Ver Tutorial",
    summary: "Resumen",
    streakDays: "Días de racha",
    xpEarned: "XP obtenidos",
    challenges: "Desafíos",
    currentDivision: "División actual",
    achievementsTitle: "Logros",
    noAchievements: "No tienes logros aún",
    completeToUnlock: "Completa desafíos para desbloquear logros"
  }
} as const;

export type Translations = typeof es;
