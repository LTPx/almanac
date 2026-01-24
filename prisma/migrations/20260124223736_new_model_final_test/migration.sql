-- AlterTable
ALTER TABLE "public"."heart_transaction" ADD COLUMN     "relatedFinalTestAttemptId" INTEGER;

-- CreateTable
CREATE TABLE "public"."final_test" (
    "id" SERIAL NOT NULL,
    "curriculumId" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "passingScore" DOUBLE PRECISION NOT NULL DEFAULT 70,
    "totalQuestions" INTEGER NOT NULL DEFAULT 10,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "final_test_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."final_test_question" (
    "id" SERIAL NOT NULL,
    "finalTestId" INTEGER NOT NULL,
    "questionId" INTEGER NOT NULL,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "final_test_question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."final_test_attempt" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "finalTestId" INTEGER NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "totalQuestions" INTEGER NOT NULL,
    "correctAnswers" INTEGER NOT NULL,
    "isPassed" BOOLEAN NOT NULL DEFAULT false,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "questionOrder" JSONB,

    CONSTRAINT "final_test_attempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."final_test_answer" (
    "id" SERIAL NOT NULL,
    "finalTestAttemptId" INTEGER NOT NULL,
    "questionId" INTEGER NOT NULL,
    "userAnswer" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "timeSpent" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "final_test_answer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "final_test_curriculumId_key" ON "public"."final_test"("curriculumId");

-- CreateIndex
CREATE UNIQUE INDEX "final_test_question_finalTestId_questionId_key" ON "public"."final_test_question"("finalTestId", "questionId");

-- AddForeignKey
ALTER TABLE "public"."final_test" ADD CONSTRAINT "final_test_curriculumId_fkey" FOREIGN KEY ("curriculumId") REFERENCES "public"."Curriculum"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."final_test_question" ADD CONSTRAINT "final_test_question_finalTestId_fkey" FOREIGN KEY ("finalTestId") REFERENCES "public"."final_test"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."final_test_question" ADD CONSTRAINT "final_test_question_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "public"."question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."final_test_attempt" ADD CONSTRAINT "final_test_attempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."final_test_attempt" ADD CONSTRAINT "final_test_attempt_finalTestId_fkey" FOREIGN KEY ("finalTestId") REFERENCES "public"."final_test"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."final_test_answer" ADD CONSTRAINT "final_test_answer_finalTestAttemptId_fkey" FOREIGN KEY ("finalTestAttemptId") REFERENCES "public"."final_test_attempt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."final_test_answer" ADD CONSTRAINT "final_test_answer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "public"."question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."heart_transaction" ADD CONSTRAINT "heart_transaction_relatedFinalTestAttemptId_fkey" FOREIGN KEY ("relatedFinalTestAttemptId") REFERENCES "public"."final_test_attempt"("id") ON DELETE SET NULL ON UPDATE CASCADE;
