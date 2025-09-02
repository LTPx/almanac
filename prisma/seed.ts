
import { PrismaClient, QuestionType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Clean up existing data
  await prisma.question.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.unit.deleteMany();

  // Create a new Unit
  const unit1 = await prisma.unit.create({
    data: {
      name: 'Unidad de Introducción',
      description: 'Conceptos básicos de programación',
      order: 1,
      lessons: {
        create: [
          {
            name: 'Lección 1: Variables',
            description: 'Aprende sobre los diferentes tipos de variables',
            position: 1,
            experiencePoints: 25,
            questions: {
              create: [
                {
                  type: QuestionType.MULTIPLE_CHOICE,
                  title: '¿Cuál de los siguientes es un tipo de variable de número entero?',
                  order: 1,
                  content: {
                    options: ['string', 'integer', 'float', 'boolean'],
                    correctAnswer: 'integer',
                  },
                },
                {
                  type: QuestionType.TRUE_FALSE,
                  title: '¿"Hola Mundo" es una cadena (string)?',
                  order: 2,
                  content: {
                    correctAnswer: true,
                  },
                },
              ],
            },
          },
          {
            name: 'Lección 2: Funciones',
            description: 'Aprende a declarar y usar funciones',
            position: 2,
            experiencePoints: 50,
            questions: {
              create: [
                {
                  type: QuestionType.FILL_IN_BLANK,
                  title: 'Para declarar una función en JavaScript, usas la palabra clave ________.',
                  order: 1,
                  content: {
                    correctAnswer: 'function',
                  },
                },
              ],
            },
          },
        ],
      },
    },
  });

  console.log({ unit1 });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
