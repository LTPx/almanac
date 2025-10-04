/*
  Warnings:

  - The values [RARO,EPICO,UNICO] on the enum `nft_rarity` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."nft_rarity_new" AS ENUM ('NORMAL', 'RARE', 'EPIC', 'UNIQUE');
ALTER TABLE "public"."nft_asset" ALTER COLUMN "rarity" TYPE "public"."nft_rarity_new" USING ("rarity"::text::"public"."nft_rarity_new");
ALTER TYPE "public"."nft_rarity" RENAME TO "nft_rarity_old";
ALTER TYPE "public"."nft_rarity_new" RENAME TO "nft_rarity";
DROP TYPE "public"."nft_rarity_old";
COMMIT;
