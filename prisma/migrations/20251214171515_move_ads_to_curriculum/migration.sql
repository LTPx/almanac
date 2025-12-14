/*
  Warnings:

  - You are about to drop the column `unitId` on the `ad` table. All the data in the column will be lost.
  - Added the required column `curriculumId` to the `ad` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."ad" DROP CONSTRAINT "ad_unitId_fkey";

-- AlterTable
ALTER TABLE "public"."ad" DROP COLUMN "unitId",
ADD COLUMN     "curriculumId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."ad" ADD CONSTRAINT "ad_curriculumId_fkey" FOREIGN KEY ("curriculumId") REFERENCES "public"."Curriculum"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
