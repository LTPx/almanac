-- CreateEnum
CREATE TYPE "public"."payment_platform" AS ENUM ('STRIPE', 'GOOGLE_PLAY', 'APPLE');

-- CreateEnum
CREATE TYPE "public"."subscription_status" AS ENUM ('FREE', 'TRIALING', 'ACTIVE', 'PAST_DUE', 'CANCELED', 'UNPAID', 'INCOMPLETE', 'INCOMPLETE_EXPIRED', 'PAUSED', 'PENDING', 'ON_HOLD', 'EXPIRED');

-- CreateEnum
CREATE TYPE "public"."transaction_type" AS ENUM ('SUBSCRIPTION_START', 'SUBSCRIPTION_RENEWAL', 'SUBSCRIPTION_CANCEL', 'REFUND', 'TRIAL_CONVERSION');

-- AlterTable
ALTER TABLE "public"."user" ADD COLUMN     "subscriptionCancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "subscriptionCurrentPeriodEnd" TIMESTAMP(3),
ADD COLUMN     "subscriptionStatus" "public"."subscription_status" NOT NULL DEFAULT 'FREE',
ADD COLUMN     "subscriptionTrialEnd" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "public"."subscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "platform" "public"."payment_platform" NOT NULL,
    "stripeSubscriptionId" TEXT,
    "stripeCustomerId" TEXT,
    "stripePriceId" TEXT,
    "stripeProductId" TEXT,
    "googlePlaySubscriptionId" TEXT,
    "googlePlayProductId" TEXT,
    "googlePlayOrderId" TEXT,
    "googlePlayPackageName" TEXT,
    "appleTransactionId" TEXT,
    "appleOriginalTransactionId" TEXT,
    "appleProductId" TEXT,
    "status" "public"."subscription_status" NOT NULL DEFAULT 'TRIALING',
    "currentPeriodStart" TIMESTAMP(3) NOT NULL,
    "currentPeriodEnd" TIMESTAMP(3) NOT NULL,
    "trialStart" TIMESTAMP(3),
    "trialEnd" TIMESTAMP(3),
    "canceledAt" TIMESTAMP(3),
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "endedAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."payment_transaction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "platform" "public"."payment_platform" NOT NULL,
    "transactionId" TEXT NOT NULL,
    "type" "public"."transaction_type" NOT NULL,
    "amount" INTEGER,
    "currency" TEXT,
    "status" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_transaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "subscription_userId_key" ON "public"."subscription"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "subscription_stripeSubscriptionId_key" ON "public"."subscription"("stripeSubscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "subscription_googlePlaySubscriptionId_key" ON "public"."subscription"("googlePlaySubscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "subscription_appleTransactionId_key" ON "public"."subscription"("appleTransactionId");

-- CreateIndex
CREATE INDEX "subscription_stripeSubscriptionId_idx" ON "public"."subscription"("stripeSubscriptionId");

-- CreateIndex
CREATE INDEX "subscription_googlePlaySubscriptionId_idx" ON "public"."subscription"("googlePlaySubscriptionId");

-- CreateIndex
CREATE INDEX "subscription_appleTransactionId_idx" ON "public"."subscription"("appleTransactionId");

-- CreateIndex
CREATE INDEX "subscription_platform_status_idx" ON "public"."subscription"("platform", "status");

-- CreateIndex
CREATE INDEX "payment_transaction_userId_idx" ON "public"."payment_transaction"("userId");

-- CreateIndex
CREATE INDEX "payment_transaction_platform_idx" ON "public"."payment_transaction"("platform");

-- CreateIndex
CREATE INDEX "payment_transaction_transactionId_idx" ON "public"."payment_transaction"("transactionId");

-- AddForeignKey
ALTER TABLE "public"."subscription" ADD CONSTRAINT "subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
