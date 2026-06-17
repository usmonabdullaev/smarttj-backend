-- DropForeignKey
ALTER TABLE "OrderItem" DROP CONSTRAINT "OrderItem_productVariantId_fkey";

-- AlterTable
ALTER TABLE "OrderItem" ALTER COLUMN "productVariantId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Product" ALTER COLUMN "publishedAt" DROP DEFAULT;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_productVariantId_fkey" FOREIGN KEY ("productVariantId") REFERENCES "ProductVariant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
