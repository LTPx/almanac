import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";

function sseEvent(data: object): string {
  return `data: ${JSON.stringify(data)}\n\n`;
}

export async function GET(_request: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => {
        controller.enqueue(encoder.encode(sseEvent(data)));
      };

      try {
        let totalMigrated = 0;
        let totalSkipped = 0;

        // 1. Curriculums
        send({ type: "section", label: "Currículums" });
        const curriculums = await prisma.curriculum.findMany({
          select: { id: true, title: true }
        });

        for (const item of curriculums) {
          const existing = await prisma.curriculumTranslation.findUnique({
            where: { curriculumId_language: { curriculumId: item.id, language: "EN" } }
          });

          if (!existing) {
            await prisma.curriculumTranslation.create({
              data: { curriculumId: item.id, language: "EN", title: item.title }
            });
            totalMigrated++;
            send({ type: "migrated", entity: "curriculum", name: item.title });
          } else {
            totalSkipped++;
            send({ type: "skipped", entity: "curriculum", name: item.title });
          }
        }

        // 2. Units
        send({ type: "section", label: "Unidades" });
        const units = await prisma.unit.findMany({
          select: { id: true, name: true, description: true }
        });

        for (const item of units) {
          const existing = await prisma.unitTranslation.findUnique({
            where: { unitId_language: { unitId: item.id, language: "EN" } }
          });

          if (!existing) {
            await prisma.unitTranslation.create({
              data: { unitId: item.id, language: "EN", name: item.name, description: item.description }
            });
            totalMigrated++;
            send({ type: "migrated", entity: "unit", name: item.name });
          } else {
            totalSkipped++;
            send({ type: "skipped", entity: "unit", name: item.name });
          }
        }

        // 3. Lessons
        send({ type: "section", label: "Lecciones" });
        const lessons = await prisma.lesson.findMany({
          select: { id: true, name: true, description: true }
        });

        for (const item of lessons) {
          const existing = await prisma.lessonTranslation.findUnique({
            where: { lessonId_language: { lessonId: item.id, language: "EN" } }
          });

          if (!existing) {
            await prisma.lessonTranslation.create({
              data: { lessonId: item.id, language: "EN", name: item.name, description: item.description }
            });
            totalMigrated++;
            send({ type: "migrated", entity: "lesson", name: item.name });
          } else {
            totalSkipped++;
            send({ type: "skipped", entity: "lesson", name: item.name });
          }
        }

        // 4. Questions
        send({ type: "section", label: "Preguntas" });
        const questions = await prisma.question.findMany({
          select: { id: true, title: true, content: true }
        });

        for (const item of questions) {
          const existing = await prisma.questionTranslation.findUnique({
            where: { questionId_language: { questionId: item.id, language: "EN" } }
          });

          if (!existing) {
            await prisma.questionTranslation.create({
              data: { questionId: item.id, language: "EN", title: item.title, content: item.content as any }
            });
            totalMigrated++;
            send({ type: "migrated", entity: "question", name: item.title });
          } else {
            totalSkipped++;
            send({ type: "skipped", entity: "question", name: item.title });
          }
        }

        send({
          type: "done",
          totalMigrated,
          totalSkipped,
          summary: {
            curriculums: curriculums.length,
            units: units.length,
            lessons: lessons.length,
            questions: questions.length
          }
        });
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
