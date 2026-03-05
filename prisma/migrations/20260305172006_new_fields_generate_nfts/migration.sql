-- CreateTable
CREATE TABLE "public"."layer_category" (
    "id" TEXT NOT NULL,
    "collectionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "layer_category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."layer_trait" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "weight" INTEGER NOT NULL DEFAULT 100,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "layer_trait_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "layer_category_collectionId_name_key" ON "public"."layer_category"("collectionId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "layer_trait_categoryId_name_key" ON "public"."layer_trait"("categoryId", "name");

-- AddForeignKey
ALTER TABLE "public"."layer_category" ADD CONSTRAINT "layer_category_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "public"."nft_collection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."layer_trait" ADD CONSTRAINT "layer_trait_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."layer_category"("id") ON DELETE CASCADE ON UPDATE CASCADE;
