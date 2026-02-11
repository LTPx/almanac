import { NextRequest } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import prisma from "@/lib/prisma";
import {
  getTranslatableContentFields,
  buildTranslatedContent
} from "@/lib/question-translation";

const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

// Tamaño del lote y delay entre lotes para no saturar la API de Gemini
const BATCH_SIZE = 3;
const BATCH_DELAY_MS = 4000;

function sseEvent(data: object): string {
  return `data: ${JSON.stringify(data)}\n\n`;
}

async function translateFields(
  fields: Record<string, string>,
  from: string,
  to: string
): Promise<Record<string, string>> {
  if (!genAI) throw new Error("GEMINI_API_KEY no configurado");

  const fromLabel = from === "EN" ? "English" : "Spanish";
  const toLabel = to === "EN" ? "English" : "Spanish";

  const fieldsText = Object.entries(fields)
    .filter(([, v]) => v?.trim())
    .map(([k, v]) => `${k}: "${v}"`)
    .join("\n");

  const prompt = `Translate the following educational content from ${fromLabel} to ${toLabel}.
Return ONLY a valid JSON object with the same keys and translated values.
Keep technical terms accurate for an educational platform.

Content to translate:
${fieldsText}

Return ONLY JSON, no explanation.`;

  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    generationConfig: { responseMimeType: "application/json", temperature: 0.2 }
  });

  const result = await model.generateContent(prompt);
  return JSON.parse(result.response.text());
}

async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") as "curriculums" | "units" | "lessons" | "questions" | null;
  const onlyMissing = searchParams.get("onlyMissing") !== "false";

  if (!type || !["curriculums", "units", "lessons", "questions"].includes(type)) {
    return new Response("type must be 'curriculums', 'units', 'lessons' or 'questions'", { status: 400 });
  }

  if (!genAI) {
    return new Response("GEMINI_API_KEY no configurado", { status: 500 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => {
        controller.enqueue(encoder.encode(sseEvent(data)));
      };

      try {
        // 1. Obtener registros sin traducción ES
        // Curriculum uses String id and only has 'title'; units/lessons use Int id and have 'name'+'description'
        let curriculumItems: { id: string; title: string }[] = [];
        let items: { id: number; name: string; description: string | null }[] = [];

        if (type === "curriculums") {
          if (onlyMissing) {
            const alreadyTranslated = await prisma.curriculumTranslation.findMany({
              where: { language: "ES" },
              select: { curriculumId: true }
            });
            const translatedIds = alreadyTranslated.map((t) => t.curriculumId);
            curriculumItems = await prisma.curriculum.findMany({
              where: { id: { notIn: translatedIds } },
              select: { id: true, title: true },
              orderBy: { createdAt: "asc" }
            });
          } else {
            curriculumItems = await prisma.curriculum.findMany({
              select: { id: true, title: true },
              orderBy: { createdAt: "asc" }
            });
          }
        } else if (type === "units") {
          if (onlyMissing) {
            // Solo units sin traducción ES
            const alreadyTranslated = await prisma.unitTranslation.findMany({
              where: { language: "ES" },
              select: { unitId: true }
            });
            const translatedIds = alreadyTranslated.map((t) => t.unitId);
            items = await prisma.unit.findMany({
              where: { id: { notIn: translatedIds } },
              select: { id: true, name: true, description: true },
              orderBy: { id: "asc" }
            });
          } else {
            items = await prisma.unit.findMany({
              select: { id: true, name: true, description: true },
              orderBy: { id: "asc" }
            });
          }
        } else {
          if (onlyMissing) {
            const alreadyTranslated = await prisma.lessonTranslation.findMany({
              where: { language: "ES" },
              select: { lessonId: true }
            });
            const translatedIds = alreadyTranslated.map((t) => t.lessonId);
            items = await prisma.lesson.findMany({
              where: { id: { notIn: translatedIds } },
              select: { id: true, name: true, description: true },
              orderBy: { id: "asc" }
            });
          } else {
            items = await prisma.lesson.findMany({
              select: { id: true, name: true, description: true },
              orderBy: { id: "asc" }
            });
          }
        }

        const total = type === "curriculums" ? curriculumItems.length : items.length;
        send({ type: "start", total });

        let processed = 0;
        let errors = 0;

        // 2. Procesar en lotes
        if (type === "curriculums") {
          for (let i = 0; i < curriculumItems.length; i += BATCH_SIZE) {
            const batch = curriculumItems.slice(i, i + BATCH_SIZE);

            await Promise.allSettled(
              batch.map(async (item) => {
                try {
                  // Obtener traducción EN como fuente
                  const enTranslation = await prisma.curriculumTranslation.findUnique({
                    where: { curriculumId_language: { curriculumId: item.id, language: "EN" } }
                  });
                  const sourceTitle = enTranslation?.title || item.title;

                  const translated = await translateFields({ title: sourceTitle }, "EN", "ES");

                  await prisma.curriculumTranslation.upsert({
                    where: { curriculumId_language: { curriculumId: item.id, language: "ES" } },
                    update: { title: translated.title || sourceTitle },
                    create: { curriculumId: item.id, language: "ES", title: translated.title || sourceTitle }
                  });

                  processed++;
                  send({
                    type: "progress",
                    processed,
                    total,
                    errors,
                    current: { id: item.id, name: sourceTitle, translated: translated.title }
                  });
                } catch (err: any) {
                  errors++;
                  processed++;
                  send({
                    type: "error",
                    processed,
                    total,
                    errors,
                    current: { id: item.id, name: item.title, error: err.message }
                  });
                }
              })
            );

            if (i + BATCH_SIZE < curriculumItems.length) {
              await delay(BATCH_DELAY_MS);
            }
          }
        } else {
        for (let i = 0; i < items.length; i += BATCH_SIZE) {
          const batch = items.slice(i, i + BATCH_SIZE);

          await Promise.allSettled(
            batch.map(async (item) => {
              try {
                // Obtener traducción EN como fuente
                let sourceName = item.name;
                let sourceDescription = item.description || "";

                if (type === "units") {
                  const enTranslation = await prisma.unitTranslation.findUnique(
                    {
                      where: {
                        unitId_language: { unitId: item.id, language: "EN" }
                      }
                    }
                  );
                  if (enTranslation) {
                    sourceName = enTranslation.name;
                    sourceDescription = enTranslation.description || "";
                  }
                } else {
                  const enTranslation =
                    await prisma.lessonTranslation.findUnique({
                      where: {
                        lessonId_language: { lessonId: item.id, language: "EN" }
                      }
                    });
                  if (enTranslation) {
                    sourceName = enTranslation.name;
                    sourceDescription = enTranslation.description || "";
                  }
                }

                const fields: Record<string, string> = { name: sourceName };
                if (sourceDescription) fields.description = sourceDescription;

                const translated = await translateFields(fields, "EN", "ES");

                // Guardar traducción ES en la DB
                if (type === "units") {
                  await prisma.unitTranslation.upsert({
                    where: {
                      unitId_language: { unitId: item.id, language: "ES" }
                    },
                    update: {
                      name: translated.name || sourceName,
                      description: translated.description || null
                    },
                    create: {
                      unitId: item.id,
                      language: "ES",
                      name: translated.name || sourceName,
                      description: translated.description || null
                    }
                  });
                } else {
                  await prisma.lessonTranslation.upsert({
                    where: {
                      lessonId_language: { lessonId: item.id, language: "ES" }
                    },
                    update: {
                      name: translated.name || sourceName,
                      description: translated.description || null
                    },
                    create: {
                      lessonId: item.id,
                      language: "ES",
                      name: translated.name || sourceName,
                      description: translated.description || null
                    }
                  });
                }

                processed++;
                send({
                  type: "progress",
                  processed,
                  total,
                  errors,
                  current: {
                    id: item.id,
                    name: sourceName,
                    translated: translated.name
                  }
                });
              } catch (err: any) {
                errors++;
                processed++;
                send({
                  type: "error",
                  processed,
                  total,
                  errors,
                  current: { id: item.id, name: item.name, error: err.message }
                });
              }
            })
          );

          // Delay entre lotes para no saturar Gemini
          if (i + BATCH_SIZE < items.length) {
            await delay(BATCH_DELAY_MS);
          }
        }
        } // end else (units/lessons)

        // ── QUESTIONS ──────────────────────────────────────────────
        if (type === "questions") {
          type QItem = { id: number; title: string; type: string; content: any; answers: { id: number; text: string; order: number }[] };
          let questionItems: QItem[] = [];

          if (onlyMissing) {
            const alreadyTranslated = await prisma.questionTranslation.findMany({
              where: { language: "ES" },
              select: { questionId: true }
            });
            const translatedIds = alreadyTranslated.map((t) => t.questionId);
            questionItems = await prisma.question.findMany({
              where: { id: { notIn: translatedIds } },
              select: { id: true, title: true, type: true, content: true, answers: { select: { id: true, text: true, order: true }, orderBy: { order: "asc" } } },
              orderBy: { id: "asc" }
            }) as QItem[];
          } else {
            questionItems = await prisma.question.findMany({
              select: { id: true, title: true, type: true, content: true, answers: { select: { id: true, text: true, order: true }, orderBy: { order: "asc" } } },
              orderBy: { id: "asc" }
            }) as QItem[];
          }

          const qTotal = questionItems.length;
          send({ type: "start", total: qTotal });

          if (qTotal === 0) {
            send({ type: "done", processed: 0, total: 0, errors: 0 });
            controller.close();
            return;
          }

          let qProcessed = 0;
          let qErrors = 0;

          for (let i = 0; i < questionItems.length; i += BATCH_SIZE) {
            const batch = questionItems.slice(i, i + BATCH_SIZE);

            await Promise.allSettled(
              batch.map(async (item) => {
                try {
                  // Get EN translation as source
                  const enT = await prisma.questionTranslation.findUnique({
                    where: { questionId_language: { questionId: item.id, language: "EN" } }
                  });
                  const sourceTitle = enT?.title || item.title;
                  const sourceContent = enT?.content ?? item.content;

                  // Build flat fields: title + content fields
                  const fields: Record<string, string> = { title: sourceTitle };
                  const contentFields = getTranslatableContentFields(
                    item.type as any,
                    sourceContent
                  );
                  Object.assign(fields, contentFields);

                  const translated = await translateFields(fields, "EN", "ES");

                  // Rebuild translated content
                  const translatedContent = buildTranslatedContent(
                    item.type as any,
                    sourceContent,
                    translated
                  );

                  // Upsert QuestionTranslation ES
                  await prisma.questionTranslation.upsert({
                    where: { questionId_language: { questionId: item.id, language: "ES" } },
                    update: { title: translated.title || sourceTitle, content: translatedContent },
                    create: { questionId: item.id, language: "ES", title: translated.title || sourceTitle, content: translatedContent }
                  });

                  // Ensure EN QuestionTranslation exists
                  await prisma.questionTranslation.upsert({
                    where: { questionId_language: { questionId: item.id, language: "EN" } },
                    update: { title: sourceTitle, content: sourceContent },
                    create: { questionId: item.id, language: "EN", title: sourceTitle, content: sourceContent }
                  });

                  // Create AnswerTranslation for MULTIPLE_CHOICE
                  if (item.type === "MULTIPLE_CHOICE" && Array.isArray(translatedContent?.options)) {
                    const translatedOptions: string[] = translatedContent.options;
                    for (let j = 0; j < item.answers.length; j++) {
                      const ans = item.answers[j];
                      const translatedText = translatedOptions[j];
                      if (translatedText?.trim()) {
                        await prisma.answerTranslation.upsert({
                          where: { answerId_language: { answerId: ans.id, language: "ES" } },
                          update: { text: translatedText },
                          create: { answerId: ans.id, language: "ES", text: translatedText }
                        });
                      }
                      // EN answer translation
                      await prisma.answerTranslation.upsert({
                        where: { answerId_language: { answerId: ans.id, language: "EN" } },
                        update: { text: ans.text },
                        create: { answerId: ans.id, language: "EN", text: ans.text }
                      });
                    }
                  }

                  qProcessed++;
                  send({
                    type: "progress",
                    processed: qProcessed,
                    total: qTotal,
                    errors: qErrors,
                    current: { id: item.id, name: sourceTitle, translated: translated.title }
                  });
                } catch (err: any) {
                  qErrors++;
                  qProcessed++;
                  send({
                    type: "error",
                    processed: qProcessed,
                    total: qTotal,
                    errors: qErrors,
                    current: { id: item.id, name: item.title, error: err.message }
                  });
                }
              })
            );

            if (i + BATCH_SIZE < questionItems.length) {
              await delay(BATCH_DELAY_MS);
            }
          }
          send({ type: "done", processed: qProcessed, total: qTotal, errors: qErrors });
          return;
        }
        // ── END QUESTIONS ──────────────────────────────────────────

        send({ type: "done", processed, total, errors });
      } catch (err: any) {
        send({ type: "fatal", error: err.message });
      } finally {
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive"
    }
  });
}
