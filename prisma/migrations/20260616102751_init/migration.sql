/*
  Warnings:

  - You are about to drop the column `slug` on the `Attribute` table. All the data in the column will be lost.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AttributeType" ADD VALUE 'SELECT';
ALTER TYPE "AttributeType" ADD VALUE 'MULTISELECT';

-- DropIndex
DROP INDEX "Attribute_slug_key";

-- AlterTable
ALTER TABLE "Attribute" DROP COLUMN "slug",
ADD COLUMN     "categoryId" TEXT;

-- AddForeignKey
ALTER TABLE "Attribute" ADD CONSTRAINT "Attribute_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;
