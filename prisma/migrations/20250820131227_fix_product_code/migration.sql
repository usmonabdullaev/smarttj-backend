/*
  Warnings:

  - You are about to drop the column `code` on the `Product` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[code]` on the table `ProductVariant` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Category" DROP CONSTRAINT "Category_parentId_fkey";

-- DropIndex
DROP INDEX "Product_code_key";

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "code";

-- AlterTable
ALTER TABLE "ProductVariant" ADD COLUMN     "code" SERIAL NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "bonus" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE UNIQUE INDEX "ProductVariant_code_key" ON "ProductVariant"("code");

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ManualCode
ALTER SEQUENCE "ProductVariant_code_seq" RESTART WITH 5000000;
