import { GoogleGenerativeAI } from "@google/generative-ai";
import prisma from "@/lib/prisma";
import {
  getTranslatableContentFields,
  buildTranslatedContent
} from "@/lib/question-translation";

// ─── Config ──────────────────────────────────────────────────────────────────

export const BATCH_SIZE = 3;
export const BATCH_DELAY_MS = 5000;

const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

// ─── Types ───────────────────────────────────────────────────────────────────

export type SendFn = (data: object) => void;

type QItem = {
  id: number;
  title: string;
  type: string;
  content: any;
  answers: { id: number; text: string; order: number }[];
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

export async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function callGemini(
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

/**
 * Generic batch runner. Iterates items in groups of BATCH_SIZE,
 * calls processItem for each, and sends progress/error SSE events.
 */
export async function runBatches<T extends { id: number | string }>(
  items: T[],
  send: SendFn,
  processItem: (item: T) => Promise<{ name: string; translated?: string }>
): Promise<{ processed: number; errors: number; total: number }> {
  let processed = 0;
  let errors = 0;
  const total = items.length;

  for (let i = 0; i < items.length; i += BATCH_SIZE) {
    const batch = items.slice(i, i + BATCH_SIZE);

    await Promise.allSettled(
      batch.map(async (item) => {
        try {
          const { name, translated } = await processItem(item);
          processed++;
          send({ type: "progress", processed, total, errors, current: { id: item.id, name, translated } });
        } catch (err: any) {
          errors++;
          processed++;
          send({ type: "error", processed, total, errors, current: { id: item.id, name: String((item as any).title ?? (item as any).name ?? item.id), error: err.message } });
        }
      })
    );

    if (i + BATCH_SIZE < items.length) {
      await delay(BATCH_DELAY_MS);
    }
  }

  return { processed, errors, total };
}

// ─── Section translators ─────────────────────────────────────────────────────

export async function translateCurriculums(send: SendFn, onlyMissing: boolean) {
  let items: { id: string; title: string }[];

  if (onlyMissing) {
    const translated = await prisma.curriculumTranslation.findMany({
      where: { language: "ES" },
      select: { curriculumId: true }
    });
    const ids = translated.map((t) => t.curriculumId);
    items = await prisma.curriculum.findMany({
      where: { id: { notIn: ids } },
      select: { id: true, title: true },
      orderBy: { createdAt: "asc" }
    });
  } else {
    items = await prisma.curriculum.findMany({
      select: { id: true, title: true },
      orderBy: { createdAt: "asc" }
    });
  }

  send({ type: "start", total: items.length });

  const result = await runBatches(items, send, async (item) => {
    const enT = await prisma.curriculumTranslation.findUnique({
      where: { curriculumId_language: { curriculumId: item.id, language: "EN" } }
    });
    const sourceTitle = enT?.title || item.title;
    const { title } = await callGemini({ title: sourceTitle }, "EN", "ES");

    await prisma.curriculumTranslation.upsert({
      where: { curriculumId_language: { curriculumId: item.id, language: "ES" } },
      update: { title: title || sourceTitle },
      create: { curriculumId: item.id, language: "ES", title: title || sourceTitle }
    });

    return { name: sourceTitle, translated: title };
  });

  send({ type: "done", ...result });
}

export async function translateUnits(send: SendFn, onlyMissing: boolean) {
  let items: { id: number; name: string; description: string | null }[];

  if (onlyMissing) {
    const translated = await prisma.unitTranslation.findMany({
      where: { language: "ES" },
      select: { unitId: true }
    });
    const ids = translated.map((t) => t.unitId);
    items = await prisma.unit.findMany({
      where: { id: { notIn: ids } },
      select: { id: true, name: true, description: true },
      orderBy: { id: "asc" }
    });
  } else {
    items = await prisma.unit.findMany({
      select: { id: true, name: true, description: true },
      orderBy: { id: "asc" }
    });
  }

  send({ type: "start", total: items.length });

  const result = await runBatches(items, send, async (item) => {
    const enT = await prisma.unitTranslation.findUnique({
      where: { unitId_language: { unitId: item.id, language: "EN" } }
    });
    const sourceName = enT?.name || item.name;
    const sourceDescription = enT?.description || item.description || "";

    const fields: Record<string, string> = { name: sourceName };
    if (sourceDescription) fields.description = sourceDescription;

    const t = await callGemini(fields, "EN", "ES");

    await prisma.unitTranslation.upsert({
      where: { unitId_language: { unitId: item.id, language: "ES" } },
      update: { name: t.name || sourceName, description: t.description || null },
      create: { unitId: item.id, language: "ES", name: t.name || sourceName, description: t.description || null }
    });

    return { name: sourceName, translated: t.name };
  });

  send({ type: "done", ...result });
}

export async function translateLessons(send: SendFn, onlyMissing: boolean) {
  let items: { id: number; name: string; description: string | null }[];

  if (onlyMissing) {
    const translated = await prisma.lessonTranslation.findMany({
      where: { language: "ES" },
      select: { lessonId: true }
    });
    const ids = translated.map((t) => t.lessonId);
    items = await prisma.lesson.findMany({
      where: { id: { notIn: ids } },
      select: { id: true, name: true, description: true },
      orderBy: { id: "asc" }
    });
  } else {
    items = await prisma.lesson.findMany({
      select: { id: true, name: true, description: true },
      orderBy: { id: "asc" }
    });
  }

  send({ type: "start", total: items.length });

  const result = await runBatches(items, send, async (item) => {
    const enT = await prisma.lessonTranslation.findUnique({
      where: { lessonId_language: { lessonId: item.id, language: "EN" } }
    });
    const sourceName = enT?.name || item.name;
    const sourceDescription = enT?.description || item.description || "";

    const fields: Record<string, string> = { name: sourceName };
    if (sourceDescription) fields.description = sourceDescription;

    const t = await callGemini(fields, "EN", "ES");

    await prisma.lessonTranslation.upsert({
      where: { lessonId_language: { lessonId: item.id, language: "ES" } },
      update: { name: t.name || sourceName, description: t.description || null },
      create: { lessonId: item.id, language: "ES", name: t.name || sourceName, description: t.description || null }
    });

    return { name: sourceName, translated: t.name };
  });

  send({ type: "done", ...result });
}

export async function translateQuestions(send: SendFn, onlyMissing: boolean) {
  let items: QItem[];

  if (onlyMissing) {
    const translated = await prisma.questionTranslation.findMany({
      where: { language: "ES" },
      select: { questionId: true }
    });
    const ids = translated.map((t) => t.questionId);
    items = (await prisma.question.findMany({
      where: { id: { notIn: ids } },
      select: {
        id: true, title: true, type: true, content: true,
        answers: { select: { id: true, text: true, order: true }, orderBy: { order: "asc" } }
      },
      orderBy: { id: "asc" }
    })) as QItem[];
  } else {
    items = (await prisma.question.findMany({
      select: {
        id: true, title: true, type: true, content: true,
        answers: { select: { id: true, text: true, order: true }, orderBy: { order: "asc" } }
      },
      orderBy: { id: "asc" }
    })) as QItem[];
  }

  send({ type: "start", total: items.length });

  const result = await runBatches(items, send, async (item) => {
    const enT = await prisma.questionTranslation.findUnique({
      where: { questionId_language: { questionId: item.id, language: "EN" } }
    });
    const sourceTitle = enT?.title || item.title;
    const sourceContent = enT?.content ?? item.content;

    const fields: Record<string, string> = { title: sourceTitle };
    Object.assign(fields, getTranslatableContentFields(item.type as any, sourceContent));

    const t = await callGemini(fields, "EN", "ES");
    const translatedContent = buildTranslatedContent(item.type as any, sourceContent, t);

    // Save ES and EN QuestionTranslation
    await prisma.questionTranslation.upsert({
      where: { questionId_language: { questionId: item.id, language: "ES" } },
      update: { title: t.title || sourceTitle, content: translatedContent },
      create: { questionId: item.id, language: "ES", title: t.title || sourceTitle, content: translatedContent }
    });
    await prisma.questionTranslation.upsert({
      where: { questionId_language: { questionId: item.id, language: "EN" } },
      update: { title: sourceTitle, content: sourceContent },
      create: { questionId: item.id, language: "EN", title: sourceTitle, content: sourceContent }
    });

    // Save AnswerTranslation for MULTIPLE_CHOICE
    if (item.type === "MULTIPLE_CHOICE" && Array.isArray(translatedContent?.options)) {
      for (let j = 0; j < item.answers.length; j++) {
        const ans = item.answers[j];
        const esText = translatedContent.options[j];
        if (esText?.trim()) {
          await prisma.answerTranslation.upsert({
            where: { answerId_language: { answerId: ans.id, language: "ES" } },
            update: { text: esText },
            create: { answerId: ans.id, language: "ES", text: esText }
          });
        }
        await prisma.answerTranslation.upsert({
          where: { answerId_language: { answerId: ans.id, language: "EN" } },
          update: { text: ans.text },
          create: { answerId: ans.id, language: "EN", text: ans.text }
        });
      }
    }

    return { name: sourceTitle, translated: t.title };
  });

  send({ type: "done", ...result });
}
