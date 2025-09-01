/*
  Warnings:

  - You are about to drop the `Contenido` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Tema` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Tema" DROP CONSTRAINT "Tema_contenidoId_fkey";

-- DropTable
DROP TABLE "public"."Contenido";

-- DropTable
DROP TABLE "public"."Tema";

-- CreateTable
CREATE TABLE "public"."Unit" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Unit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Lesson" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "unitId" INTEGER NOT NULL,

    CONSTRAINT "Lesson_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Lesson" ADD CONSTRAINT "Lesson_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "public"."Unit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
