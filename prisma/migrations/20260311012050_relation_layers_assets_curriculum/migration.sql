-- AlterTable
ALTER TABLE "public"."layer_trait" ADD COLUMN     "curriculumId" TEXT;

-- AddForeignKey
ALTER TABLE "public"."layer_trait" ADD CONSTRAINT "layer_trait_curriculumId_fkey" FOREIGN KEY ("curriculumId") REFERENCES "public"."Curriculum"("id") ON DELETE SET NULL ON UPDATE CASCADE;
