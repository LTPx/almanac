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
  store: {
    store: "Tienda",
    backToExam: "Volver al examen",
    premiumCardTitle: "Funciones\npara acelerar\ntu aprendizaje",
    premiumCardBenefit:
      "Disfruta de vidas ilimitadas\ny dile adiós a los anuncios",
    activatePremium: "ACTIVA PREMIUM",
    freeTrialOneWeek: "PRUEBA 1 SEMANA GRATIS",
    premiumPrice: "7,99€/mes. Cancela cuando quieras.",
    premiumPromoPrice: "Luego $1/mes. Cancela cuando quieras.",
    specialOffers: "Ofertas especiales",
    lives: "Vidas",
    freeZaps: "Zaps gratis",
    watchAdReward: "Mira un anuncio y gana hasta 20 zaps",
    livesPack: "Set de vidas",
    livesPackDescription:
      "Recarga tus vidas para tener más oportunidades de continuar en tus pruebas.",
    reactivateSubscription: "Reactivar suscripción",
    cancelSubscription: "Cancelar suscripción",
    viewAllBenefits: "Ver todos tus beneficios",
    subscriptionEndsOn: "Tu suscripción finalizará el",
    scheduledCancellation: "Cancelación programada",
    noAds: "Sin anuncios",
    unlimitedLives: "Vidas ilimitadas",
    loading: "Cargando...",
    get: "OBTENER",
    recharge: "Recargar"
  },
  modals: {
    noHeartsTitle: "¡Sin Corazones!",
    noHeartsMessage:
      "Te has quedado sin corazones. Visita la tienda para continuar aprendiendo.",
    goToStore: "Ir a la Tienda",
    exitExam: "Salir del Examen",
    outOfHeartsMessage:
      "Te quedaste sin corazones. ¡Completa otras lecciones o vuelve mañana para obtener más!",
    getHearts: "Obtener Corazones"
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
  learningPath: {
    startTest: "Empezar mi Prueba",
    statusClosed: "CERRADA",
    retryTest: "Volver a intentar",
    statusBlocked: "BLOQUEADO",
    finalTest: "Prueba Final",
    levelLockedMessage:
      "¡Completa todos los niveles anteriores para habilitar este nivel!",
    levelCompletedMessage:
      "¡Nivel completado! Puedes volver a intentarlo para mejorar tu puntuación.",
    finalTestLockedMessage:
      "Completa todas las unidades obligatorias para desbloquear el test final.",
    finalTestReadyMessage:
      "¡Has completado todas las unidades! Pon a prueba todos los conocimientos adquiridos en este test final.",
    finalTestCompletedMessage:
      "¡Felicidades! Has completado el test final. Puedes volver a intentarlo para mejorar tu puntuación."
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

export type Translations = {
  [K in keyof typeof es]: {
    [J in keyof (typeof es)[K]]: string;
  };
};
