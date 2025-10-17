/*
  Warnings:

  - You are about to drop the column `totalCurriculumsCompleted` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."user" DROP COLUMN "totalCurriculumsCompleted",
ADD COLUMN     "totalCurriculumsCompleted" INTEGER NOT NULL DEFAULT 0;
