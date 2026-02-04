/*
  Warnings:

  - Made the column `paymentMethodId` on table `Order` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_paymentMethodId_fkey";

-- DropIndex
DROP INDEX "PaymentMethod_name_key";

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "comment" TEXT,
ALTER COLUMN "paymentMethodId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_paymentMethodId_fkey" FOREIGN KEY ("paymentMethodId") REFERENCES "PaymentMethod"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
