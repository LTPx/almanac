import prisma from "@/lib/prisma";
import { NextRequest } from "next/server";

type Section = "curriculums" | "units" | "lessons" | "questions";

function sseEvent(data: object): string {
  return `data: ${JSON.stringify(data)}\n\n`;
}

async function migrateCurriculums(send: (d: object) => void) {
  send({ type: "section", label: "Currículums" });
  const [curriculums, curriculumENIds] = await Promise.all([
    prisma.curriculum.findMany({ select: { id: true, title: true } }),
    prisma.curriculumTranslation.findMany({
      where: { language: "EN" },
      select: { curriculumId: true }
    })
  ]);
  const existingIds = new Set(curriculumENIds.map((t) => t.curriculumId));
  const toMigrate = curriculums.filter((c) => !existingIds.has(c.id));
  if (toMigrate.length > 0) {
    await prisma.curriculumTranslation.createMany({
      data: toMigrate.map((c) => ({
        curriculumId: c.id,
        language: "EN",
        title: c.title
      })),
      skipDuplicates: true
    });
  }
  send({
    type: "section_done",
    label: "Currículums",
    migrated: toMigrate.length,
    skipped: curriculums.length - toMigrate.length,
    total: curriculums.length
  });
  return { migrated: toMigrate.length, skipped: curriculums.length - toMigrate.length };
}

async function migrateUnits(send: (d: object) => void) {
  send({ type: "section", label: "Unidades" });
  const [units, unitENIds] = await Promise.all([
    prisma.unit.findMany({ select: { id: true, name: true, description: true } }),
    prisma.unitTranslation.findMany({
      where: { language: "EN" },
      select: { unitId: true }
    })
  ]);
  const existingIds = new Set(unitENIds.map((t) => t.unitId));
  const toMigrate = units.filter((u) => !existingIds.has(u.id));
  if (toMigrate.length > 0) {
    await prisma.unitTranslation.createMany({
      data: toMigrate.map((u) => ({
        unitId: u.id,
        language: "EN",
        name: u.name,
        description: u.description
      })),
      skipDuplicates: true
    });
  }
  send({
    type: "section_done",
    label: "Unidades",
    migrated: toMigrate.length,
    skipped: units.length - toMigrate.length,
    total: units.length
  });
  return { migrated: toMigrate.length, skipped: units.length - toMigrate.length };
}

async function migrateLessons(send: (d: object) => void) {
  send({ type: "section", label: "Lecciones" });
  const [lessons, lessonENIds] = await Promise.all([
    prisma.lesson.findMany({ select: { id: true, name: true, description: true } }),
    prisma.lessonTranslation.findMany({
      where: { language: "EN" },
      select: { lessonId: true }
    })
  ]);
  const existingIds = new Set(lessonENIds.map((t) => t.lessonId));
  const toMigrate = lessons.filter((l) => !existingIds.has(l.id));
  if (toMigrate.length > 0) {
    await prisma.lessonTranslation.createMany({
      data: toMigrate.map((l) => ({
        lessonId: l.id,
        language: "EN",
        name: l.name,
        description: l.description
      })),
      skipDuplicates: true
    });
  }
  send({
    type: "section_done",
    label: "Lecciones",
    migrated: toMigrate.length,
    skipped: lessons.length - toMigrate.length,
    total: lessons.length
  });
  return { migrated: toMigrate.length, skipped: lessons.length - toMigrate.length };
}

async function migrateQuestions(send: (d: object) => void) {
  send({ type: "section", label: "Preguntas" });
  const [questions, questionENIds] = await Promise.all([
    prisma.question.findMany({ select: { id: true, title: true, content: true } }),
    prisma.questionTranslation.findMany({
      where: { language: "EN" },
      select: { questionId: true }
    })
  ]);
  const existingIds = new Set(questionENIds.map((t) => t.questionId));
  const toMigrate = questions.filter((q) => !existingIds.has(q.id));
  if (toMigrate.length > 0) {
    await prisma.questionTranslation.createMany({
      data: toMigrate.map((q) => ({
        questionId: q.id,
        language: "EN",
        title: q.title,
        content: q.content as any
      })),
      skipDuplicates: true
    });
  }
  send({
    type: "section_done",
    label: "Preguntas",
    migrated: toMigrate.length,
    skipped: questions.length - toMigrate.length,
    total: questions.length
  });
  return { migrated: toMigrate.length, skipped: questions.length - toMigrate.length };
}

export async function GET(req: NextRequest) {
  const section = (req.nextUrl.searchParams.get("section") || "all") as Section | "all";
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => {
        controller.enqueue(encoder.encode(sseEvent(data)));
      };

      try {
        let totalMigrated = 0;
        let totalSkipped = 0;

        if (section === "curriculums" || section === "all") {
          const r = await migrateCurriculums(send);
          totalMigrated += r.migrated;
          totalSkipped += r.skipped;
        }
        if (section === "units" || section === "all") {
          const r = await migrateUnits(send);
          totalMigrated += r.migrated;
          totalSkipped += r.skipped;
        }
        if (section === "lessons" || section === "all") {
          const r = await migrateLessons(send);
          totalMigrated += r.migrated;
          totalSkipped += r.skipped;
        }
        if (section === "questions" || section === "all") {
          const r = await migrateQuestions(send);
          totalMigrated += r.migrated;
          totalSkipped += r.skipped;
        }

        send({ type: "done", totalMigrated, totalSkipped });
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
