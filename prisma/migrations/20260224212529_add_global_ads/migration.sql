-- DropForeignKey
ALTER TABLE "public"."ad" DROP CONSTRAINT "ad_curriculumId_fkey";

-- AlterTable
ALTER TABLE "public"."ad" ALTER COLUMN "curriculumId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."ad" ADD CONSTRAINT "ad_curriculumId_fkey" FOREIGN KEY ("curriculumId") REFERENCES "public"."Curriculum"("id") ON DELETE SET NULL ON UPDATE CASCADE;
