import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Iniciando migración de traducciones...\n");

  try {
    // 1️⃣ Migrar Curriculums
    console.log("📚 Migrando Curriculums...");
    const curriculums = await prisma.curriculum.findMany();

    for (const curriculum of curriculums) {
      // Verificar si ya existe traducción en EN
      const existingTranslation = await prisma.curriculumTranslation.findUnique(
        {
          where: {
            curriculumId_language: {
              curriculumId: curriculum.id,
              language: "EN"
            }
          }
        }
      );

      if (!existingTranslation) {
        await prisma.curriculumTranslation.create({
          data: {
            curriculumId: curriculum.id,
            language: "EN",
            title: curriculum.title
          }
        });
        console.log(`  ✅ Curriculum migrado: ${curriculum.title}`);
      } else {
        console.log(
          `  ⏭️  Curriculum ya tiene traducción EN: ${curriculum.title}`
        );
      }
    }
    console.log(`✅ ${curriculums.length} curriculums migrados\n`);

    // 2️⃣ Migrar Units
    console.log("📖 Migrando Units...");
    const units = await prisma.unit.findMany();

    for (const unit of units) {
      const existingTranslation = await prisma.unitTranslation.findUnique({
        where: {
          unitId_language: {
            unitId: unit.id,
            language: "EN"
          }
        }
      });

      if (!existingTranslation) {
        await prisma.unitTranslation.create({
          data: {
            unitId: unit.id,
            language: "EN",
            name: unit.name,
            description: unit.description
          }
        });
        console.log(`  ✅ Unit migrado: ${unit.name}`);
      } else {
        console.log(`  ⏭️  Unit ya tiene traducción EN: ${unit.name}`);
      }
    }
    console.log(`✅ ${units.length} units migrados\n`);

    // 3️⃣ Migrar Lessons
    console.log("📝 Migrando Lessons...");
    const lessons = await prisma.lesson.findMany();

    for (const lesson of lessons) {
      const existingTranslation = await prisma.lessonTranslation.findUnique({
        where: {
          lessonId_language: {
            lessonId: lesson.id,
            language: "EN"
          }
        }
      });

      if (!existingTranslation) {
        await prisma.lessonTranslation.create({
          data: {
            lessonId: lesson.id,
            language: "EN",
            name: lesson.name,
            description: lesson.description
          }
        });
        console.log(`  ✅ Lesson migrado: ${lesson.name}`);
      } else {
        console.log(`  ⏭️  Lesson ya tiene traducción EN: ${lesson.name}`);
      }
    }
    console.log(`✅ ${lessons.length} lessons migrados\n`);

    // 4️⃣ Migrar Questions
    console.log("❓ Migrando Questions...");
    const questions = await prisma.question.findMany();

    for (const question of questions) {
      const existingTranslation = await prisma.questionTranslation.findUnique({
        where: {
          questionId_language: {
            questionId: question.id,
            language: "EN"
          }
        }
      });

      if (!existingTranslation) {
        await prisma.questionTranslation.create({
          data: {
            questionId: question.id,
            language: "EN",
            title: question.title,
            content: question.content as any
          }
        });
        console.log(
          `  ✅ Question migrada: ${question.title.substring(0, 50)}...`
        );
      } else {
        console.log(
          `  ⏭️  Question ya tiene traducción EN: ${question.title.substring(0, 50)}...`
        );
      }
    }
    console.log(`✅ ${questions.length} questions migradas\n`);

    console.log("🎉 ¡Migración completada exitosamente!");
    console.log("\n📊 Resumen:");
    console.log(`  • Curriculums: ${curriculums.length}`);
    console.log(`  • Units: ${units.length}`);
    console.log(`  • Lessons: ${lessons.length}`);
    console.log(`  • Questions: ${questions.length}`);
    console.log(
      "\n✅ Todos los datos están ahora en las tablas de traducción (EN)"
    );
    console.log(
      "ℹ️  Los datos originales siguen intactos en las columnas originales\n"
    );
  } catch (error) {
    console.error("❌ Error durante la migración:", error);
    throw error;
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
