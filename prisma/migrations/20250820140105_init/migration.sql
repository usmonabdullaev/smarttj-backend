/*
  Warnings:

  - You are about to drop the column `providerTxId` on the `Transaction` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name,brandId]` on the table `Model` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `popular` to the `Brand` table without a default value. This is not possible if the table is not empty.
  - Added the required column `popular` to the `Model` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Brand" ADD COLUMN     "popular" BOOLEAN NOT NULL;

-- AlterTable
ALTER TABLE "Model" ADD COLUMN     "popular" BOOLEAN NOT NULL;

-- AlterTable
ALTER TABLE "ProductVariant" ADD COLUMN     "discountEndDate" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "providerTxId",
ADD COLUMN     "providerId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Model_name_brandId_key" ON "Model"("name", "brandId");

-- CreateIndex
CREATE INDEX "ProductVariant_code_idx" ON "ProductVariant"("code");
