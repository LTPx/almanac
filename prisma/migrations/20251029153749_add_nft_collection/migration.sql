-- AlterTable
ALTER TABLE "public"."educational_nft" ADD COLUMN     "collectionId" TEXT;

-- AlterTable
ALTER TABLE "public"."nft_asset" ADD COLUMN     "collectionId" TEXT;

-- CreateTable
CREATE TABLE "public"."nft_collection" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "description" TEXT,
    "contractAddress" TEXT NOT NULL,
    "chainId" INTEGER NOT NULL DEFAULT 80002,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nft_collection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "nft_collection_contractAddress_key" ON "public"."nft_collection"("contractAddress");

-- AddForeignKey
ALTER TABLE "public"."educational_nft" ADD CONSTRAINT "educational_nft_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "public"."nft_collection"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."nft_asset" ADD CONSTRAINT "nft_asset_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "public"."nft_collection"("id") ON DELETE SET NULL ON UPDATE CASCADE;
