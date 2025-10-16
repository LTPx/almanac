/*
  Warnings:

  - You are about to drop the column `experiencePoints` on the `lesson` table. All the data in the column will be lost.
  - You are about to drop the column `mandatory` on the `lesson` table. All the data in the column will be lost.
  - You are about to drop the column `lessonId` on the `question` table. All the data in the column will be lost.
  - You are about to drop the column `lessonId` on the `test_attempt` table. All the data in the column will be lost.
  - You are about to drop the column `lessonId` on the `user_progress` table. All the data in the column will be lost.
  - You are about to drop the `user_lesson_progress` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[userId,unitId]` on the table `user_progress` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `unitId` to the `question` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unitId` to the `test_attempt` table without a default value. This is not possible if the table is not empty.
  - Made the column `unitId` on table `user_progress` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "public"."question" DROP CONSTRAINT "question_lessonId_fkey";

-- DropForeignKey
ALTER TABLE "public"."test_attempt" DROP CONSTRAINT "test_attempt_lessonId_fkey";

-- DropForeignKey
ALTER TABLE "public"."user_lesson_progress" DROP CONSTRAINT "user_lesson_progress_lessonId_fkey";

-- DropForeignKey
ALTER TABLE "public"."user_lesson_progress" DROP CONSTRAINT "user_lesson_progress_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."user_progress" DROP CONSTRAINT "user_progress_lessonId_fkey";

-- DropForeignKey
ALTER TABLE "public"."user_progress" DROP CONSTRAINT "user_progress_unitId_fkey";

-- DropIndex
DROP INDEX "public"."user_progress_userId_lessonId_key";

-- AlterTable
ALTER TABLE "public"."lesson" DROP COLUMN "experiencePoints",
DROP COLUMN "mandatory";

-- AlterTable
ALTER TABLE "public"."question" DROP COLUMN "lessonId",
ADD COLUMN     "unitId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "public"."test_attempt" DROP COLUMN "lessonId",
ADD COLUMN     "unitId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "public"."unit" ADD COLUMN     "experiencePoints" INTEGER NOT NULL DEFAULT 25,
ADD COLUMN     "mandatory" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "position" INTEGER;

-- AlterTable
ALTER TABLE "public"."user_progress" DROP COLUMN "lessonId",
ALTER COLUMN "unitId" SET NOT NULL;

-- DropTable
DROP TABLE "public"."user_lesson_progress";

-- CreateIndex
CREATE UNIQUE INDEX "user_progress_userId_unitId_key" ON "public"."user_progress"("userId", "unitId");

-- AddForeignKey
ALTER TABLE "public"."question" ADD CONSTRAINT "question_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "public"."unit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_progress" ADD CONSTRAINT "user_progress_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "public"."unit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."test_attempt" ADD CONSTRAINT "test_attempt_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "public"."unit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
