/*
  Warnings:

  - You are about to drop the `Coupon` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Shop` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `label` on table `Address` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `partnerId` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PartnerStatus" AS ENUM ('IN_MODERATE', 'ACTIVE', 'BLOCKED');

-- CreateEnum
CREATE TYPE "PartnerIdentification" AS ENUM ('MINIMUM', 'STANDART', 'MAXIMUM');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "OrderItemDeliveryStatus" ADD VALUE 'RETURN_PROCESS';
ALTER TYPE "OrderItemDeliveryStatus" ADD VALUE 'RETURN_CANCEL';

-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'PARTNER';

-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_shopId_fkey";

-- DropForeignKey
ALTER TABLE "Shop" DROP CONSTRAINT "Shop_regionId_fkey";

-- AlterTable
ALTER TABLE "Address" ALTER COLUMN "label" SET NOT NULL;

-- AlterTable
ALTER TABLE "Employee" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "partnerId" TEXT NOT NULL;

-- DropTable
DROP TABLE "Coupon";

-- DropTable
DROP TABLE "Shop";

-- DropEnum
DROP TYPE "CouponType";

-- CreateTable
CREATE TABLE "Partner" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bonus" INTEGER NOT NULL DEFAULT 0,
    "status" "PartnerStatus" NOT NULL DEFAULT 'IN_MODERATE',
    "identification" "PartnerIdentification" NOT NULL DEFAULT 'MINIMUM',
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "logo" TEXT,
    "logoId" TEXT,
    "email" TEXT,
    "phone1" TEXT NOT NULL,
    "phone2" TEXT,
    "address1" TEXT,
    "address2" TEXT,
    "about" TEXT,
    "inn" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Partner_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Partner_userId_key" ON "Partner"("userId");

-- AddForeignKey
ALTER TABLE "Partner" ADD CONSTRAINT "Partner_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
