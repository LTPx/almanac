-- CreateEnum
CREATE TYPE "public"."language" AS ENUM ('EN', 'ES');

-- CreateTable
CREATE TABLE "public"."curriculum_translation" (
    "id" SERIAL NOT NULL,
    "curriculumId" TEXT NOT NULL,
    "language" "public"."language" NOT NULL,
    "title" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "curriculum_translation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."unit_translation" (
    "id" SERIAL NOT NULL,
    "unitId" INTEGER NOT NULL,
    "language" "public"."language" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "unit_translation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."lesson_translation" (
    "id" SERIAL NOT NULL,
    "lessonId" INTEGER NOT NULL,
    "language" "public"."language" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lesson_translation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."question_translation" (
    "id" SERIAL NOT NULL,
    "questionId" INTEGER NOT NULL,
    "language" "public"."language" NOT NULL,
    "title" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "question_translation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "curriculum_translation_curriculumId_language_key" ON "public"."curriculum_translation"("curriculumId", "language");

-- CreateIndex
CREATE UNIQUE INDEX "unit_translation_unitId_language_key" ON "public"."unit_translation"("unitId", "language");

-- CreateIndex
CREATE UNIQUE INDEX "lesson_translation_lessonId_language_key" ON "public"."lesson_translation"("lessonId", "language");

-- CreateIndex
CREATE UNIQUE INDEX "question_translation_questionId_language_key" ON "public"."question_translation"("questionId", "language");

-- AddForeignKey
ALTER TABLE "public"."curriculum_translation" ADD CONSTRAINT "curriculum_translation_curriculumId_fkey" FOREIGN KEY ("curriculumId") REFERENCES "public"."Curriculum"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."unit_translation" ADD CONSTRAINT "unit_translation_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "public"."unit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."lesson_translation" ADD CONSTRAINT "lesson_translation_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "public"."lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."question_translation" ADD CONSTRAINT "question_translation_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "public"."question"("id") ON DELETE CASCADE ON UPDATE CASCADE;
