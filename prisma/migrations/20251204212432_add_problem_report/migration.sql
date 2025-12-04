-- CreateEnum
CREATE TYPE "public"."problem_report_status" AS ENUM ('PENDING', 'IN_REVIEW', 'RESOLVED', 'DISMISSED');

-- CreateTable
CREATE TABLE "public"."problem_report" (
    "id" SERIAL NOT NULL,
    "questionId" INTEGER NOT NULL,
    "userId" TEXT,
    "reason" TEXT NOT NULL,
    "description" TEXT,
    "status" "public"."problem_report_status" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "problem_report_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."problem_report" ADD CONSTRAINT "problem_report_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "public"."question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."problem_report" ADD CONSTRAINT "problem_report_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
