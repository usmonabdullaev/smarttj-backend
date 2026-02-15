/*
  Warnings:

  - You are about to drop the column `warrantyEndsAt` on the `OrderItem` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Attribute" ADD COLUMN     "required" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "unit" TEXT;

-- AlterTable
ALTER TABLE "Order" ALTER COLUMN "type" DROP DEFAULT;

-- AlterTable
ALTER TABLE "OrderItem" DROP COLUMN "warrantyEndsAt";
