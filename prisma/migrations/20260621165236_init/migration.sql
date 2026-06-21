-- AlterEnum
ALTER TYPE "SmsLogStatus" ADD VALUE 'NEW';

-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'PARTNER_EMPLOYEE';

-- AlterTable
ALTER TABLE "ProductVariant" ADD COLUMN     "label" TEXT,
ADD COLUMN     "variantId" TEXT;

-- AlterTable
ALTER TABLE "SmsLog" ADD COLUMN     "messageId" TEXT;

-- AddForeignKey
ALTER TABLE "ProductVariant" ADD CONSTRAINT "ProductVariant_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
