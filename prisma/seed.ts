const { PrismaClient, QuestionType } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // 🔄 Limpiar datos previos en orden por las relaciones
  await prisma.testAnswer.deleteMany();
  await prisma.testAttempt.deleteMany();
  await prisma.answer.deleteMany();
  await prisma.question.deleteMany();
  await prisma.userProgress.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.unit.deleteMany();

  console.log('🗑️ Datos anteriores eliminados');

  // 📚 Data inicial
  const unitsData = [
    {
      name: 'Matemáticas Básicas',
      description: 'Fundamentos de matemáticas: suma, resta, multiplicación y división',
      order: 1,
      lessons: [
        {
          name: 'Suma',
          description: 'Aprende a sumar números enteros',
          order: 1,
          position: 1,
          experiencePoints: 25,
          questions: [
            {
              type: QuestionType.MULTIPLE_CHOICE,
              title: '¿Cuál es el resultado de 5 + 4?',
              order: 1,
              content: {
                options: ['7', '8', '9', '10'],
                correctAnswer: '9',
                explanation: 'La suma de 5 + 4 = 9',
              },
              answers: [
                { text: '7', isCorrect: false, order: 1 },
                { text: '8', isCorrect: false, order: 2 },
                { text: '9', isCorrect: true, order: 3 },
                { text: '10', isCorrect: false, order: 4 },
              ],
            },
            {
              type: QuestionType.FILL_IN_BLANK,
              title: 'Completa: 12 + ___ = 20',
              order: 2,
              content: {
                sentence: '12 + ___ = 20',
                correctAnswer: '8',
                explanation: 'Para que 12 + algo = 20, necesitamos 8',
              },
              answers: []
            },
          ],
        },
        {
          name: 'Resta',
          description: 'Aprende a restar números enteros',
          order: 2,
          position: 2,
          experiencePoints: 25,
          questions: [
            {
              type: QuestionType.MULTIPLE_CHOICE,
              title: '¿Cuál es el resultado de 15 - 7?',
              order: 1,
              content: {
                options: ['6', '7', '8', '9'],
                correctAnswer: '8',
                explanation: 'La resta de 15 - 7 = 8',
              },
              answers: [
                { text: '6', isCorrect: false, order: 1 },
                { text: '7', isCorrect: false, order: 2 },
                { text: '8', isCorrect: true, order: 3 },
                { text: '9', isCorrect: false, order: 4 },
              ],
            },
          ],
        },
        {
          name: 'Multiplicación',
          description: 'Aprende las tablas de multiplicar',
          order: 3,
          position: 3,
          experiencePoints: 30,
          questions: [
            {
              type: QuestionType.MULTIPLE_CHOICE,
              title: '¿Cuál es el resultado de 6 × 7?',
              order: 1,
              content: {
                options: ['40', '41', '42', '43'],
                correctAnswer: '42',
                explanation: '6 × 7 = 42',
              },
              answers: [
                { text: '40', isCorrect: false, order: 1 },
                { text: '41', isCorrect: false, order: 2 },
                { text: '42', isCorrect: true, order: 3 },
                { text: '43', isCorrect: false, order: 4 },
              ],
            },
          ],
        },
      ],
    },
    {
      name: 'Álgebra Elemental',
      description: 'Introducción al álgebra: ecuaciones, variables y expresiones',
      order: 2,
      lessons: [
        {
          name: 'Variables y Expresiones',
          description: 'Comprende qué son las variables en matemáticas',
          order: 1,
          position: 1,
          experiencePoints: 35,
          questions: [
            {
              type: QuestionType.FILL_IN_BLANK,
              title: 'En una _______ la x representa la incógnita o lo desconocido',
              order: 1,
              content: {
                sentence: 'En una _______ la x representa la incógnita o lo desconocido',
                correctAnswer: 'ecuación',
                explanation: 'En una ecuación, la x es la variable que representa el valor desconocido',
              },
              answers: []
            },
            {
              type: QuestionType.ORDER_WORDS,
              title: 'Ordena la siguiente oración correctamente',
              order: 2,
              content: {
                sentence: 'Cuando un valor cambia de signo también cambia de lado',
                words: ['cambio', 'Cuando', 'también', 'lado', 'un', 'valor', 'signo', 'de', 'cambia', 'de'],
                correctOrder: ['Cuando', 'un', 'valor', 'cambia', 'de', 'signo', 'también', 'cambia', 'de', 'lado'],
                explanation: 'Esta es una regla fundamental del álgebra',
              },
              answers: []
            },
          ],
        },
        {
          name: 'Ecuaciones Simples',
          description: 'Resuelve ecuaciones de primer grado',
          order: 2,
          position: 2,
          experiencePoints: 40,
          questions: [
            {
              type: QuestionType.MULTIPLE_CHOICE,
              title: '¿Cuál es el valor de x en: x + 5 = 12?',
              order: 1,
              content: {
                options: ['5', '6', '7', '8'],
                correctAnswer: '7',
                explanation: 'x + 5 = 12, entonces x = 12 - 5 = 7',
              },
              answers: [
                { text: '5', isCorrect: false, order: 1 },
                { text: '6', isCorrect: false, order: 2 },
                { text: '7', isCorrect: true, order: 3 },
                { text: '8', isCorrect: false, order: 4 },
              ],
            },
          ],
        },
      ],
    },
    {
      name: 'Programación Básica',
      description: 'Conceptos fundamentales de programación',
      order: 3,
      lessons: [
        {
          name: 'Variables en Programación',
          description: 'Aprende sobre tipos de datos y variables',
          order: 1,
          position: 1,
          experiencePoints: 30,
          questions: [
            {
              type: QuestionType.MULTIPLE_CHOICE,
              title: '¿Cuál de los siguientes es un tipo de variable de número entero?',
              order: 1,
              content: {
                options: ['string', 'integer', 'float', 'boolean'],
                correctAnswer: 'integer',
                explanation: 'Integer es el tipo de datos para números enteros',
              },
              answers: [
                { text: 'string', isCorrect: false, order: 1 },
                { text: 'integer', isCorrect: true, order: 2 },
                { text: 'float', isCorrect: false, order: 3 },
                { text: 'boolean', isCorrect: false, order: 4 },
              ],
            },
            {
              type: QuestionType.TRUE_FALSE,
              title: '¿"Hola Mundo" es una cadena (string)?',
              order: 2,
              content: {
                correctAnswer: true,
                explanation: 'Sí, cualquier texto entre comillas es una cadena',
              },
              answers: [
                { text: 'Verdadero', isCorrect: true, order: 1 },
                { text: 'Falso', isCorrect: false, order: 2 },
              ],
            },
          ],
        },
        {
          name: 'Funciones',
          description: 'Aprende a declarar y usar funciones',
          order: 2,
          position: 2,
          experiencePoints: 40,
          questions: [
            {
              type: QuestionType.FILL_IN_BLANK,
              title: 'Para declarar una función en JavaScript, usas la palabra clave ________.',
              order: 1,
              content: {
                sentence: 'Para declarar una función en JavaScript, usas la palabra clave ________.',
                correctAnswer: 'function',
                explanation: 'La palabra clave "function" se usa para declarar funciones en JavaScript',
              },
              answers: []
            },
          ],
        },
      ],
    },
  ];

  // 🌱 Insertar datos en DB con relaciones anidadas
  for (const unit of unitsData) {
    await prisma.unit.create({
      data: {
        name: unit.name,
        description: unit.description,
        order: unit.order,
        lessons: {
          create: unit.lessons.map((lesson) => ({
            name: lesson.name,
            description: lesson.description,
            position: lesson.position,
            experiencePoints: lesson.experiencePoints,
            questions: {
              create: lesson.questions.map((q) => ({
                type: q.type,
                title: q.title,
                order: q.order,
                content: q.content,
                answers: q.answers?.length
                  ? {
                      create: q.answers.map((a) => ({
                        text: a.text,
                        isCorrect: a.isCorrect,
                        order: a.order,
                      })),
                    }
                  : undefined,
              })),
            },
          })),
        },
      },
    });
  }

  console.log('🎉 Seed completado exitosamente');
}

main()
  .catch((e) => {
    console.error('❌ Error en el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
