-- CreateEnum
CREATE TYPE "nft_token_type" AS ENUM ('CERTIFICATE', 'COLLECTIBLE');

-- AlterTable: EducationalNFT
ALTER TABLE "educational_nft" ADD COLUMN "tokenType" "nft_token_type" NOT NULL DEFAULT 'CERTIFICATE';
ALTER TABLE "educational_nft" ADD COLUMN "linkedCertTokenId" TEXT;
ALTER TABLE "educational_nft" ADD COLUMN "isTradeable" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "educational_nft" ADD COLUMN "artistAddress" TEXT;
ALTER TABLE "educational_nft" ADD COLUMN "royaltyBps" INTEGER;

-- AlterTable: NFTCollection
ALTER TABLE "nft_collection" ADD COLUMN "defaultArtistAddress" TEXT;
ALTER TABLE "nft_collection" ADD COLUMN "defaultRoyaltyBps" INTEGER DEFAULT 500;
ALTER TABLE "nft_collection" ADD COLUMN "maxSupply" INTEGER;
ALTER TABLE "nft_collection" ADD COLUMN "certificateContractAddress" TEXT;
ALTER TABLE "nft_collection" ADD COLUMN "collectibleContractAddress" TEXT;
