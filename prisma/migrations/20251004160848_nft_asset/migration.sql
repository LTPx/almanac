/*
  Warnings:

  - You are about to drop the `EducationalNFT` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."nft_rarity" AS ENUM ('NORMAL', 'RARO', 'EPICO', 'UNICO');

-- DropForeignKey
ALTER TABLE "public"."EducationalNFT" DROP CONSTRAINT "EducationalNFT_userId_fkey";

-- DropTable
DROP TABLE "public"."EducationalNFT";

-- CreateTable
CREATE TABLE "public"."educational_nft" (
    "id" TEXT NOT NULL,
    "tokenId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "unitId" TEXT NOT NULL,
    "contractAddress" TEXT NOT NULL,
    "transactionHash" TEXT,
    "metadataUri" TEXT NOT NULL,
    "mintedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nftAssetId" INTEGER,

    CONSTRAINT "educational_nft_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."nft_asset" (
    "id" SERIAL NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "rarity" "public"."nft_rarity" NOT NULL,
    "isUsed" BOOLEAN NOT NULL DEFAULT false,
    "metadataUri" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usedAt" TIMESTAMP(3),

    CONSTRAINT "nft_asset_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "educational_nft_nftAssetId_key" ON "public"."educational_nft"("nftAssetId");

-- AddForeignKey
ALTER TABLE "public"."educational_nft" ADD CONSTRAINT "educational_nft_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."educational_nft" ADD CONSTRAINT "educational_nft_nftAssetId_fkey" FOREIGN KEY ("nftAssetId") REFERENCES "public"."nft_asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;
