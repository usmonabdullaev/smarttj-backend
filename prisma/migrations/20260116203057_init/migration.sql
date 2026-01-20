/*
  Warnings:

  - A unique constraint covering the columns `[parentKey,slug]` on the table `Category` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Category_slug_idx";

-- DropIndex
DROP INDEX "Category_slug_key";

-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "parentKey" TEXT NOT NULL DEFAULT 'ROOT';

-- CreateIndex
CREATE UNIQUE INDEX "Category_parentKey_slug_key" ON "Category"("parentKey", "slug");
