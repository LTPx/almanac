-- CreateTable
CREATE TABLE "public"."answer_translation" (
    "id" SERIAL NOT NULL,
    "answerId" INTEGER NOT NULL,
    "language" "public"."language" NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "answer_translation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "answer_translation_answerId_language_key" ON "public"."answer_translation"("answerId", "language");

-- AddForeignKey
ALTER TABLE "public"."answer_translation" ADD CONSTRAINT "answer_translation_answerId_fkey" FOREIGN KEY ("answerId") REFERENCES "public"."answer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
