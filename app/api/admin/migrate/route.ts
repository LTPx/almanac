import prisma from "@/lib/prisma";

function sseEvent(data: object): string {
  return `data: ${JSON.stringify(data)}\n\n`;
}

export async function GET() {
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
        // Fetch all records and existing EN translations in 2 queries, then createMany in 1
        send({ type: "section", label: "Currículums" });
        const [curriculums, curriculumENIds] = await Promise.all([
          prisma.curriculum.findMany({ select: { id: true, title: true } }),
          prisma.curriculumTranslation.findMany({
            where: { language: "EN" },
            select: { curriculumId: true }
          })
        ]);
        const curriculumExistingIds = new Set(curriculumENIds.map((t) => t.curriculumId));
        const curriculumsToMigrate = curriculums.filter((c) => !curriculumExistingIds.has(c.id));
        if (curriculumsToMigrate.length > 0) {
          await prisma.curriculumTranslation.createMany({
            data: curriculumsToMigrate.map((c) => ({
              curriculumId: c.id,
              language: "EN",
              title: c.title
            })),
            skipDuplicates: true
          });
        }
        totalMigrated += curriculumsToMigrate.length;
        totalSkipped += curriculums.length - curriculumsToMigrate.length;
        send({
          type: "section_done",
          label: "Currículums",
          migrated: curriculumsToMigrate.length,
          skipped: curriculums.length - curriculumsToMigrate.length,
          total: curriculums.length
        });

        // 2. Units
        send({ type: "section", label: "Unidades" });
        const [units, unitENIds] = await Promise.all([
          prisma.unit.findMany({ select: { id: true, name: true, description: true } }),
          prisma.unitTranslation.findMany({
            where: { language: "EN" },
            select: { unitId: true }
          })
        ]);
        const unitExistingIds = new Set(unitENIds.map((t) => t.unitId));
        const unitsToMigrate = units.filter((u) => !unitExistingIds.has(u.id));
        if (unitsToMigrate.length > 0) {
          await prisma.unitTranslation.createMany({
            data: unitsToMigrate.map((u) => ({
              unitId: u.id,
              language: "EN",
              name: u.name,
              description: u.description
            })),
            skipDuplicates: true
          });
        }
        totalMigrated += unitsToMigrate.length;
        totalSkipped += units.length - unitsToMigrate.length;
        send({
          type: "section_done",
          label: "Unidades",
          migrated: unitsToMigrate.length,
          skipped: units.length - unitsToMigrate.length,
          total: units.length
        });

        // 3. Lessons
        send({ type: "section", label: "Lecciones" });
        const [lessons, lessonENIds] = await Promise.all([
          prisma.lesson.findMany({ select: { id: true, name: true, description: true } }),
          prisma.lessonTranslation.findMany({
            where: { language: "EN" },
            select: { lessonId: true }
          })
        ]);
        const lessonExistingIds = new Set(lessonENIds.map((t) => t.lessonId));
        const lessonsToMigrate = lessons.filter((l) => !lessonExistingIds.has(l.id));
        if (lessonsToMigrate.length > 0) {
          await prisma.lessonTranslation.createMany({
            data: lessonsToMigrate.map((l) => ({
              lessonId: l.id,
              language: "EN",
              name: l.name,
              description: l.description
            })),
            skipDuplicates: true
          });
        }
        totalMigrated += lessonsToMigrate.length;
        totalSkipped += lessons.length - lessonsToMigrate.length;
        send({
          type: "section_done",
          label: "Lecciones",
          migrated: lessonsToMigrate.length,
          skipped: lessons.length - lessonsToMigrate.length,
          total: lessons.length
        });

        // 4. Questions
        send({ type: "section", label: "Preguntas" });
        const [questions, questionENIds] = await Promise.all([
          prisma.question.findMany({ select: { id: true, title: true, content: true } }),
          prisma.questionTranslation.findMany({
            where: { language: "EN" },
            select: { questionId: true }
          })
        ]);
        const questionExistingIds = new Set(questionENIds.map((t) => t.questionId));
        const questionsToMigrate = questions.filter((q) => !questionExistingIds.has(q.id));
        if (questionsToMigrate.length > 0) {
          await prisma.questionTranslation.createMany({
            data: questionsToMigrate.map((q) => ({
              questionId: q.id,
              language: "EN",
              title: q.title,
              content: q.content as any
            })),
            skipDuplicates: true
          });
        }
        totalMigrated += questionsToMigrate.length;
        totalSkipped += questions.length - questionsToMigrate.length;
        send({
          type: "section_done",
          label: "Preguntas",
          migrated: questionsToMigrate.length,
          skipped: questions.length - questionsToMigrate.length,
          total: questions.length
        });

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
