-- CreateEnum
CREATE TYPE "public"."zap_transaction_type" AS ENUM ('UNIT_COMPLETED', 'HEART_PURCHASE', 'LESSON_COMPLETED', 'DAILY_BONUS', 'ADMIN_ADJUSTMENT');

-- CreateEnum
CREATE TYPE "public"."heart_transaction_type" AS ENUM ('DAILY_RESET', 'TEST_FAILED', 'PURCHASED', 'BONUS', 'ADMIN_ADJUSTMENT');

-- AlterTable
ALTER TABLE "public"."user" ADD COLUMN     "hearts" INTEGER NOT NULL DEFAULT 5,
ADD COLUMN     "lastHeartReset" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "totalUnitsCompleted" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "zapTokens" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "public"."user_unit_token" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "unitId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "earnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_unit_token_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."heart_transaction" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "public"."heart_transaction_type" NOT NULL,
    "amount" INTEGER NOT NULL,
    "reason" TEXT,
    "relatedTestAttemptId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "heart_transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."zap_transaction" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "public"."zap_transaction_type" NOT NULL,
    "amount" INTEGER NOT NULL,
    "reason" TEXT,
    "relatedUnitId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "zap_transaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_unit_token_userId_unitId_key" ON "public"."user_unit_token"("userId", "unitId");

-- AddForeignKey
ALTER TABLE "public"."user_unit_token" ADD CONSTRAINT "user_unit_token_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_unit_token" ADD CONSTRAINT "user_unit_token_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "public"."unit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."heart_transaction" ADD CONSTRAINT "heart_transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."heart_transaction" ADD CONSTRAINT "heart_transaction_relatedTestAttemptId_fkey" FOREIGN KEY ("relatedTestAttemptId") REFERENCES "public"."test_attempt"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."zap_transaction" ADD CONSTRAINT "zap_transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."zap_transaction" ADD CONSTRAINT "zap_transaction_relatedUnitId_fkey" FOREIGN KEY ("relatedUnitId") REFERENCES "public"."unit"("id") ON DELETE SET NULL ON UPDATE CASCADE;
