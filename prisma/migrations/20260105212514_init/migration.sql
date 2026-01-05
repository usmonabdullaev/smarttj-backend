/*
  Warnings:

  - You are about to alter the column `minOrderAmount` on the `Coupon` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,2)`.
  - You are about to drop the column `discount` on the `ProductVariant` table. All the data in the column will be lost.
  - You are about to drop the column `discountEndDate` on the `ProductVariant` table. All the data in the column will be lost.
  - Added the required column `urlId` to the `Image` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "iconId" TEXT;

-- AlterTable
ALTER TABLE "Coupon" ADD COLUMN     "maxOrderAmount" DECIMAL(10,2),
ALTER COLUMN "minOrderAmount" SET DATA TYPE DECIMAL(10,2);

-- AlterTable
ALTER TABLE "Image" ADD COLUMN     "urlId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "price" DECIMAL(10,2);

-- AlterTable
ALTER TABLE "ProductVariant" DROP COLUMN "discount",
DROP COLUMN "discountEndDate";

-- AlterTable
ALTER TABLE "Transaction" ALTER COLUMN "status" SET DEFAULT 'PENDING';
