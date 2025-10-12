import { z } from "zod";

// Schema para Answer
export const answerSchema = z.object({
  text: z.string().min(1, "Answer text is required"),
  isCorrect: z.boolean(),
  order: z.number().int().positive("Order must be a positive integer")
});

// Schema para Question Content basado en el tipo
export const multipleChoiceContentSchema = z.object({
  options: z.array(z.string()).min(2, "Must have at least 2 options"),
  correctAnswer: z.string(),
  explanation: z.string().optional()
});

export const fillInBlankContentSchema = z.object({
  sentence: z.string().min(1, "Sentence is required"),
  correctAnswer: z.string(),
  explanation: z.string().optional()
});

export const trueFalseContentSchema = z.object({
  correctAnswer: z.boolean(),
  explanation: z.string().optional()
});

export const orderWordsContentSchema = z.object({
  sentence: z.string().min(1, "Sentence is required"),
  words: z.array(z.string()).min(2, "Must have at least 2 words"),
  correctOrder: z.array(z.string()).min(2, "Correct order is required"),
  explanation: z.string().optional()
});

// Schema para Question
export const questionSchema = z
  .object({
    type: z.enum([
      "MULTIPLE_CHOICE",
      "FILL_IN_BLANK",
      "TRUE_FALSE",
      "ORDER_WORDS"
    ]),
    title: z.string().min(1, "Question title is required"),
    order: z.number().int().positive("Order must be a positive integer"),
    content: z.union([
      multipleChoiceContentSchema,
      fillInBlankContentSchema,
      trueFalseContentSchema,
      orderWordsContentSchema
    ]),
    answers: z.array(answerSchema)
  })
  .refine(
    (data) => {
      // Validar que preguntas de opción múltiple tengan respuestas
      if (data.type === "MULTIPLE_CHOICE" || data.type === "TRUE_FALSE") {
        return data.answers.length > 0;
      }
      return true;
    },
    {
      message: "Multiple choice and true/false questions must have answers"
    }
  )
  .refine(
    (data) => {
      // Validar que al menos una respuesta sea correcta
      if (data.type === "MULTIPLE_CHOICE" || data.type === "TRUE_FALSE") {
        return data.answers.some((a) => a.isCorrect);
      }
      return true;
    },
    {
      message: "At least one answer must be correct"
    }
  );

// Schema para Lesson
export const lessonSchema = z.object({
  name: z.string().min(1, "Lesson name is required"),
  description: z.string().min(1, "Lesson description is required"),
  position: z.number().int().positive("Position must be a positive integer"),
  experiencePoints: z
    .number()
    .int()
    .min(0, "Experience points must be non-negative"),
  questions: z
    .array(questionSchema)
    .min(1, "Lesson must have at least one question")
});

// Schema para Unit
export const unitSchema = z.object({
  name: z.string().min(1, "Unit name is required"),
  description: z.string().min(1, "Unit description is required"),
  order: z.number().int().positive("Order must be a positive integer"),
  lessons: z.array(lessonSchema).min(1, "Unit must have at least one lesson")
});

// Schema completo para el array de unidades
export const contentUploadSchema = z
  .array(unitSchema)
  .min(1, "Must have at least one unit");

// Tipo TypeScript inferido del schema
export type ContentUpload = z.infer<typeof contentUploadSchema>;
export type Unit = z.infer<typeof unitSchema>;
export type Lesson = z.infer<typeof lessonSchema>;
export type Question = z.infer<typeof questionSchema>;
export type Answer = z.infer<typeof answerSchema>;
