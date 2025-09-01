-- CreateTable
CREATE TABLE "public"."Contenido" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Contenido_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Tema" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "contenidoId" INTEGER NOT NULL,

    CONSTRAINT "Tema_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Tema" ADD CONSTRAINT "Tema_contenidoId_fkey" FOREIGN KEY ("contenidoId") REFERENCES "public"."Contenido"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
