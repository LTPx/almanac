-- CreateEnum
CREATE TYPE "public"."difficulty_level" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');

-- AlterTable
ALTER TABLE "public"."unit" ADD COLUMN     "curriculumId" TEXT;

-- CreateTable
CREATE TABLE "public"."Curriculum" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "audienceAgeRange" TEXT,
    "difficulty" "public"."difficulty_level" NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Curriculum_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."LearningObjective" (
    "id" SERIAL NOT NULL,
    "text" TEXT NOT NULL,
    "unitId" INTEGER,
    "lessonId" INTEGER,

    CONSTRAINT "LearningObjective_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Fact" (
    "id" SERIAL NOT NULL,
    "lessonId" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "core" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Fact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Citation" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "authors" TEXT,
    "year" INTEGER,
    "factId" INTEGER,
    "questionId" INTEGER,

    CONSTRAINT "Citation_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."LearningObjective" ADD CONSTRAINT "LearningObjective_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "public"."unit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LearningObjective" ADD CONSTRAINT "LearningObjective_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "public"."lesson"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Fact" ADD CONSTRAINT "Fact_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "public"."lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Citation" ADD CONSTRAINT "Citation_factId_fkey" FOREIGN KEY ("factId") REFERENCES "public"."Fact"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Citation" ADD CONSTRAINT "Citation_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "public"."question"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."unit" ADD CONSTRAINT "unit_curriculumId_fkey" FOREIGN KEY ("curriculumId") REFERENCES "public"."Curriculum"("id") ON DELETE SET NULL ON UPDATE CASCADE;
