/*
  Warnings:

  - Added the required column `order` to the `Lesson` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Lesson" ADD COLUMN     "experiencePoints" INTEGER NOT NULL DEFAULT 25,
ADD COLUMN     "mandatory" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "order" TEXT NOT NULL;
