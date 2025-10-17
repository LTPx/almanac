/*
  Warnings:

  - You are about to drop the column `unitId` on the `educational_nft` table. All the data in the column will be lost.
  - You are about to drop the column `relatedUnitId` on the `zap_transaction` table. All the data in the column will be lost.
  - You are about to drop the `user_unit_token` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `curriculumId` to the `educational_nft` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."user_unit_token" DROP CONSTRAINT "user_unit_token_unitId_fkey";

-- DropForeignKey
ALTER TABLE "public"."user_unit_token" DROP CONSTRAINT "user_unit_token_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."zap_transaction" DROP CONSTRAINT "zap_transaction_relatedUnitId_fkey";

-- AlterTable
ALTER TABLE "public"."educational_nft" DROP COLUMN "unitId",
ADD COLUMN     "curriculumId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."zap_transaction" DROP COLUMN "relatedUnitId",
ADD COLUMN     "relatedCurriculumId" TEXT;

-- DropTable
DROP TABLE "public"."user_unit_token";

-- CreateTable
CREATE TABLE "public"."user_curriculum_token" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "curriculumId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "earnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_curriculum_token_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_curriculum_token_userId_curriculumId_key" ON "public"."user_curriculum_token"("userId", "curriculumId");

-- AddForeignKey
ALTER TABLE "public"."user_curriculum_token" ADD CONSTRAINT "user_curriculum_token_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_curriculum_token" ADD CONSTRAINT "user_curriculum_token_curriculumId_fkey" FOREIGN KEY ("curriculumId") REFERENCES "public"."Curriculum"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."zap_transaction" ADD CONSTRAINT "zap_transaction_relatedCurriculumId_fkey" FOREIGN KEY ("relatedCurriculumId") REFERENCES "public"."Curriculum"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."educational_nft" ADD CONSTRAINT "educational_nft_curriculumId_fkey" FOREIGN KEY ("curriculumId") REFERENCES "public"."Curriculum"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
