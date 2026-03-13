-- AlterTable
ALTER TABLE "public"."nft_asset" ADD COLUMN     "curriculumId" TEXT;

-- AddForeignKey
ALTER TABLE "public"."nft_asset" ADD CONSTRAINT "nft_asset_curriculumId_fkey" FOREIGN KEY ("curriculumId") REFERENCES "public"."Curriculum"("id") ON DELETE SET NULL ON UPDATE CASCADE;
