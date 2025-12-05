-- CreateTable
CREATE TABLE "public"."ad" (
    "id" SERIAL NOT NULL,
    "unitId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT NOT NULL,
    "targetUrl" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ad_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ad_view" (
    "id" SERIAL NOT NULL,
    "adId" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ad_view_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ad_click" (
    "id" SERIAL NOT NULL,
    "adId" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "clickedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ad_click_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."ad" ADD CONSTRAINT "ad_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "public"."unit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ad_view" ADD CONSTRAINT "ad_view_adId_fkey" FOREIGN KEY ("adId") REFERENCES "public"."ad"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ad_view" ADD CONSTRAINT "ad_view_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ad_click" ADD CONSTRAINT "ad_click_adId_fkey" FOREIGN KEY ("adId") REFERENCES "public"."ad"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ad_click" ADD CONSTRAINT "ad_click_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
