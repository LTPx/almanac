/*
  Warnings:

  - You are about to drop the `user_progress` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."user_progress" DROP CONSTRAINT "user_progress_unitId_fkey";

-- DropForeignKey
ALTER TABLE "public"."user_progress" DROP CONSTRAINT "user_progress_userId_fkey";

-- DropTable
DROP TABLE "public"."user_progress";

-- CreateTable
CREATE TABLE "public"."user_curriculum_progress" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "curriculumId" TEXT NOT NULL,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "experiencePoints" INTEGER NOT NULL DEFAULT 0,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_curriculum_progress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_curriculum_progress_userId_curriculumId_key" ON "public"."user_curriculum_progress"("userId", "curriculumId");

-- AddForeignKey
ALTER TABLE "public"."user_curriculum_progress" ADD CONSTRAINT "user_curriculum_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_curriculum_progress" ADD CONSTRAINT "user_curriculum_progress_curriculumId_fkey" FOREIGN KEY ("curriculumId") REFERENCES "public"."Curriculum"("id") ON DELETE CASCADE ON UPDATE CASCADE;
