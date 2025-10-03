/*
  Warnings:

  - A unique constraint covering the columns `[walletAddress]` on the table `user` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."user" ADD COLUMN     "encryptedKey" TEXT,
ADD COLUMN     "walletAddress" TEXT;

-- CreateTable
CREATE TABLE "public"."EducationalNFT" (
    "id" TEXT NOT NULL,
    "tokenId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "unitId" TEXT NOT NULL,
    "contractAddress" TEXT NOT NULL,
    "transactionHash" TEXT,
    "metadataUri" TEXT NOT NULL,
    "mintedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EducationalNFT_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_walletAddress_key" ON "public"."user"("walletAddress");

-- AddForeignKey
ALTER TABLE "public"."EducationalNFT" ADD CONSTRAINT "EducationalNFT_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
