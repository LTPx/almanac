const { PrismaClient, QuestionType } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  // 🔄 Limpiar datos previos en orden por las relaciones
  await prisma.testAnswer.deleteMany();
  await prisma.testAttempt.deleteMany();
  await prisma.answer.deleteMany();
  await prisma.question.deleteMany();
  await prisma.userProgress.deleteMany();
  await prisma.userUnitProgress.deleteMany();
  await prisma.learningObjective.deleteMany();
  await prisma.fact.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.unit.deleteMany();

  console.log("🗑️ Datos anteriores eliminados");

  // 📚 Data inicial
  const unitsData = [
    {
      name: "Matemáticas Básicas",
      description:
        "Fundamentos de matemáticas: suma, resta, multiplicación y división",
      order: 1,
      experiencePoints: 75,
      lessons: [
        {
          name: "Suma",
          description: "Aprende a sumar números enteros",
          position: 1
        },
        {
          name: "Resta",
          description: "Aprende a restar números enteros",
          position: 2
        },
        {
          name: "Multiplicación",
          description: "Aprende las tablas de multiplicar",
          position: 3
        }
      ],
      questions: [
        {
          type: QuestionType.MULTIPLE_CHOICE,
          title: "¿Cuál es el resultado de 5 + 4?",
          order: 1,
          content: {
            options: ["7", "8", "9", "10"],
            correctAnswer: "9",
            explanation: "La suma de 5 + 4 = 9"
          },
          answers: [
            { text: "7", isCorrect: false, order: 1 },
            { text: "8", isCorrect: false, order: 2 },
            { text: "9", isCorrect: true, order: 3 },
            { text: "10", isCorrect: false, order: 4 }
          ]
        },
        {
          type: QuestionType.FILL_IN_BLANK,
          title: "Completa: 12 + ___ = 20",
          order: 2,
          content: {
            sentence: "12 + ___ = 20",
            correctAnswer: "8",
            explanation: "Para que 12 + algo = 20, necesitamos 8"
          },
          answers: [{ text: "8", isCorrect: true, order: 1 }]
        },
        {
          type: QuestionType.MULTIPLE_CHOICE,
          title: "¿Cuál es el resultado de 15 - 7?",
          order: 3,
          content: {
            options: ["6", "7", "8", "9"],
            correctAnswer: "8",
            explanation: "La resta de 15 - 7 = 8"
          },
          answers: [
            { text: "6", isCorrect: false, order: 1 },
            { text: "7", isCorrect: false, order: 2 },
            { text: "8", isCorrect: true, order: 3 },
            { text: "9", isCorrect: false, order: 4 }
          ]
        },
        {
          type: QuestionType.MULTIPLE_CHOICE,
          title: "¿Cuál es el resultado de 6 × 7?",
          order: 4,
          content: {
            options: ["40", "41", "42", "43"],
            correctAnswer: "42",
            explanation: "6 × 7 = 42"
          },
          answers: [
            { text: "40", isCorrect: false, order: 1 },
            { text: "41", isCorrect: false, order: 2 },
            { text: "42", isCorrect: true, order: 3 },
            { text: "43", isCorrect: false, order: 4 }
          ]
        }
      ]
    },
    {
      name: "Álgebra Elemental",
      description:
        "Introducción al álgebra: ecuaciones, variables y expresiones",
      order: 2,
      experiencePoints: 75,
      lessons: [
        {
          name: "Variables y Expresiones",
          description: "Comprende qué son las variables en matemáticas",
          position: 1
        },
        {
          name: "Ecuaciones Simples",
          description: "Resuelve ecuaciones de primer grado",
          position: 2
        }
      ],
      questions: [
        {
          type: QuestionType.FILL_IN_BLANK,
          title: "En una _______ la x representa la incógnita o lo desconocido",
          order: 1,
          content: {
            sentence:
              "En una _______ la x representa la incógnita o lo desconocido",
            correctAnswer: "ecuación",
            explanation:
              "En una ecuación, la x es la variable que representa el valor desconocido"
          },
          answers: [{ text: "ecuación", isCorrect: true, order: 1 }]
        },
        {
          type: QuestionType.ORDER_WORDS,
          title: "Ordena la siguiente oración correctamente",
          order: 2,
          content: {
            sentence: "Cuando un valor cambia de signo también cambia de lado",
            words: [
              "Cuando",
              "un",
              "valor",
              "cambia",
              "de",
              "signo",
              "también",
              "cambia",
              "de",
              "lado"
            ],
            correctOrder: [
              "Cuando",
              "un",
              "valor",
              "cambia",
              "de",
              "signo",
              "también",
              "cambia",
              "de",
              "lado"
            ],
            explanation: "Esta es una regla fundamental del álgebra"
          },
          answers: []
        },
        {
          type: QuestionType.MULTIPLE_CHOICE,
          title: "¿Cuál es el valor de x en: x + 5 = 12?",
          order: 3,
          content: {
            options: ["5", "6", "7", "8"],
            correctAnswer: "7",
            explanation: "x + 5 = 12, entonces x = 12 - 5 = 7"
          },
          answers: [
            { text: "5", isCorrect: false, order: 1 },
            { text: "6", isCorrect: false, order: 2 },
            { text: "7", isCorrect: true, order: 3 },
            { text: "8", isCorrect: false, order: 4 }
          ]
        }
      ]
    },
    {
      name: "Programación Básica",
      description: "Conceptos fundamentales de programación",
      order: 3,
      experiencePoints: 200,
      lessons: [
        {
          name: "Variables en Programación",
          description: "Aprende sobre tipos de datos y variables",
          position: 1
        },
        {
          name: "Funciones",
          description: "Aprende a declarar y usar funciones",
          position: 2
        },
        {
          name: "Condicionales",
          description: "Uso de if, else y else if",
          position: 3
        },
        {
          name: "Bucles For",
          description: "Iteración con bucles for",
          position: 4
        },
        {
          name: "Bucles While",
          description: "Uso de bucles while y do-while",
          position: 5
        },
        {
          name: "Arreglos",
          description: "Introducción a listas y arreglos",
          position: 6
        },
        {
          name: "Objetos",
          description: "Uso de objetos en programación",
          position: 7
        },
        {
          name: "Operadores Lógicos",
          description: "AND, OR y NOT en programación",
          position: 8
        },
        {
          name: "Operadores Aritméticos",
          description: "Suma, resta, multiplicación y división",
          position: 9
        },
        {
          name: "Comentarios en el Código",
          description: "Uso de comentarios para documentar programas",
          position: 10
        },
        {
          name: "Entrada y Salida",
          description: "Cómo mostrar mensajes y leer datos",
          position: 11
        },
        {
          name: "Constantes",
          description: "Declaración de constantes en programación",
          position: 12
        }
      ],
      questions: [
        {
          type: QuestionType.MULTIPLE_CHOICE,
          title:
            "¿Cuál de los siguientes es un tipo de variable de número entero?",
          order: 1,
          content: {
            options: ["string", "integer", "float", "boolean"],
            correctAnswer: "integer",
            explanation: "Integer es el tipo de datos para números enteros"
          },
          answers: [
            { text: "string", isCorrect: false, order: 1 },
            { text: "integer", isCorrect: true, order: 2 },
            { text: "float", isCorrect: false, order: 3 },
            { text: "boolean", isCorrect: false, order: 4 }
          ]
        },
        {
          type: QuestionType.TRUE_FALSE,
          title: '¿"Hola Mundo" es una cadena (string)?',
          order: 2,
          content: {
            correctAnswer: true,
            explanation: "Sí, cualquier texto entre comillas es una cadena"
          },
          answers: [
            { text: "Verdadero", isCorrect: true, order: 1 },
            { text: "Falso", isCorrect: false, order: 2 }
          ]
        },
        {
          type: QuestionType.FILL_IN_BLANK,
          title:
            "Para declarar una función en JavaScript, usas la palabra clave ________.",
          order: 3,
          content: {
            sentence:
              "Para declarar una función en JavaScript, usas la palabra clave ________.",
            correctAnswer: "function",
            explanation:
              'La palabra clave "function" se usa para declarar funciones en JavaScript'
          },
          answers: [{ text: "function", isCorrect: true, order: 1 }]
        },
        {
          type: QuestionType.MULTIPLE_CHOICE,
          title: "¿Cuál palabra clave se usa para evaluar una condición?",
          order: 4,
          content: {
            options: ["for", "if", "while", "switch"],
            correctAnswer: "if",
            explanation: "La sentencia if se usa para evaluar condiciones."
          },
          answers: [
            { text: "for", isCorrect: false, order: 1 },
            { text: "if", isCorrect: true, order: 2 },
            { text: "while", isCorrect: false, order: 3 },
            { text: "switch", isCorrect: false, order: 4 }
          ]
        },
        {
          type: QuestionType.TRUE_FALSE,
          title: "Un bucle for siempre se ejecuta al menos una vez.",
          order: 5,
          content: {
            correctAnswer: false,
            explanation:
              "Si la condición inicial es falsa, el bucle for no se ejecuta."
          },
          answers: [
            { text: "Verdadero", isCorrect: false, order: 1 },
            { text: "Falso", isCorrect: true, order: 2 }
          ]
        },
        {
          type: QuestionType.MULTIPLE_CHOICE,
          title: "¿Qué bucle garantiza al menos una ejecución?",
          order: 6,
          content: {
            options: ["for", "while", "do-while"],
            correctAnswer: "do-while",
            explanation:
              "El do-while se ejecuta al menos una vez antes de evaluar la condición."
          },
          answers: [
            { text: "for", isCorrect: false, order: 1 },
            { text: "while", isCorrect: false, order: 2 },
            { text: "do-while", isCorrect: true, order: 3 }
          ]
        },
        {
          type: QuestionType.TRUE_FALSE,
          title:
            "Un arreglo puede contener diferentes tipos de datos en JavaScript.",
          order: 7,
          content: {
            correctAnswer: true,
            explanation:
              "En JavaScript, los arreglos pueden contener datos de diferentes tipos."
          },
          answers: [
            { text: "Verdadero", isCorrect: true, order: 1 },
            { text: "Falso", isCorrect: false, order: 2 }
          ]
        },
        {
          type: QuestionType.FILL_IN_BLANK,
          title: "En JavaScript, los objetos se definen con ________.",
          order: 8,
          content: {
            sentence: "En JavaScript, los objetos se definen con ________.",
            correctAnswer: "llaves {}",
            explanation: "Los objetos se definen usando llaves {}."
          },
          answers: [{ text: "llaves {}", isCorrect: true, order: 1 }]
        },
        {
          type: QuestionType.MULTIPLE_CHOICE,
          title: "¿Cuál operador lógico representa la conjunción?",
          order: 9,
          content: {
            options: ["&&", "||", "!"],
            correctAnswer: "&&",
            explanation: "El operador && representa la conjunción lógica (AND)."
          },
          answers: [
            { text: "&&", isCorrect: true, order: 1 },
            { text: "||", isCorrect: false, order: 2 },
            { text: "!", isCorrect: false, order: 3 }
          ]
        },
        {
          type: QuestionType.TRUE_FALSE,
          title: "El operador % devuelve el resto de una división.",
          order: 10,
          content: {
            correctAnswer: true,
            explanation:
              "El operador módulo (%) devuelve el resto de una división."
          },
          answers: [
            { text: "Verdadero", isCorrect: true, order: 1 },
            { text: "Falso", isCorrect: false, order: 2 }
          ]
        },
        {
          type: QuestionType.MULTIPLE_CHOICE,
          title:
            "¿Qué símbolo se usa para comentarios de una sola línea en JavaScript?",
          order: 11,
          content: {
            options: ["//", "/*", "#", "<!-- -->"],
            correctAnswer: "//",
            explanation:
              "En JavaScript, los comentarios de una sola línea se hacen con //."
          },
          answers: [
            { text: "//", isCorrect: true, order: 1 },
            { text: "/*", isCorrect: false, order: 2 },
            { text: "#", isCorrect: false, order: 3 },
            { text: "<!-- -->", isCorrect: false, order: 4 }
          ]
        },
        {
          type: QuestionType.FILL_IN_BLANK,
          title:
            "En JavaScript, para mostrar un mensaje en la consola usamos ________.",
          order: 12,
          content: {
            sentence:
              "En JavaScript, para mostrar un mensaje en la consola usamos ________.",
            correctAnswer: "console.log",
            explanation: "console.log permite mostrar mensajes en la consola."
          },
          answers: [{ text: "console.log", isCorrect: true, order: 1 }]
        },
        {
          type: QuestionType.TRUE_FALSE,
          title:
            "Las constantes no pueden cambiar su valor después de ser declaradas.",
          order: 13,
          content: {
            correctAnswer: true,
            explanation:
              "Las constantes mantienen el mismo valor una vez declaradas."
          },
          answers: [
            { text: "Verdadero", isCorrect: true, order: 1 },
            { text: "Falso", isCorrect: false, order: 2 }
          ]
        }
      ]
    }
  ];

  // 🌱 Insertar datos en DB con relaciones anidadas
  for (const unit of unitsData) {
    await prisma.unit.create({
      data: {
        name: unit.name,
        description: unit.description,
        order: unit.order,
        experiencePoints: unit.experiencePoints,
        lessons: {
          create: unit.lessons.map((lesson) => ({
            name: lesson.name,
            description: lesson.description,
            position: lesson.position
          }))
        },
        questions: {
          create: unit.questions.map((q) => ({
            type: q.type,
            title: q.title,
            order: q.order,
            content: q.content,
            answers:
              q.answers.length > 0
                ? {
                    create: q.answers.map((a) => ({
                      text: a.text,
                      isCorrect: a.isCorrect,
                      order: a.order
                    }))
                  }
                : undefined
          }))
        }
      }
    });
  }

  console.log("🎉 Seed completado exitosamente");
}

main()
  .catch((e) => {
    console.error("❌ Error en el seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
