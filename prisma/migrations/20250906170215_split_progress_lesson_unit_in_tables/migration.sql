-- CreateTable
CREATE TABLE "public"."user_lesson_progress" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "lessonId" INTEGER,
    "experiencePoints" INTEGER NOT NULL DEFAULT 0,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_lesson_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_unit_progress" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "unitId" INTEGER NOT NULL,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_unit_progress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_lesson_progress_userId_lessonId_key" ON "public"."user_lesson_progress"("userId", "lessonId");

-- CreateIndex
CREATE UNIQUE INDEX "user_unit_progress_userId_unitId_key" ON "public"."user_unit_progress"("userId", "unitId");

-- AddForeignKey
ALTER TABLE "public"."user_lesson_progress" ADD CONSTRAINT "user_lesson_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_lesson_progress" ADD CONSTRAINT "user_lesson_progress_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "public"."lesson"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_unit_progress" ADD CONSTRAINT "user_unit_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_unit_progress" ADD CONSTRAINT "user_unit_progress_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "public"."unit"("id") ON DELETE CASCADE ON UPDATE CASCADE;
