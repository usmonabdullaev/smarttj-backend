/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `Model` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."Model_slug_brandId_key";

-- CreateIndex
CREATE UNIQUE INDEX "Model_slug_key" ON "Model"("slug");
