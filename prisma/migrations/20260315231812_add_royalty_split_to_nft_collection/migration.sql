-- AlterTable
ALTER TABLE "public"."nft_collection" ADD COLUMN     "platformShareBps" INTEGER,
ADD COLUMN     "platformWallet" TEXT,
ADD COLUMN     "royaltySplitterAddress" TEXT;
