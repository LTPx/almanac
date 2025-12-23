-- CreateTable
CREATE TABLE "public"."tutor_session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lessonId" INTEGER NOT NULL,
    "messages" JSONB NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastActive" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "messageCount" INTEGER NOT NULL DEFAULT 0,
    "userMessages" INTEGER NOT NULL DEFAULT 0,
    "tutorMessages" INTEGER NOT NULL DEFAULT 0,
    "wasHelpful" BOOLEAN,

    CONSTRAINT "tutor_session_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "tutor_session_userId_startedAt_idx" ON "public"."tutor_session"("userId", "startedAt");

-- CreateIndex
CREATE INDEX "tutor_session_lessonId_idx" ON "public"."tutor_session"("lessonId");

-- AddForeignKey
ALTER TABLE "public"."tutor_session" ADD CONSTRAINT "tutor_session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."tutor_session" ADD CONSTRAINT "tutor_session_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "public"."lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;
