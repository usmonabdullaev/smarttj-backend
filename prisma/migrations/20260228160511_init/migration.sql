-- AlterTable
ALTER TABLE "ProductAttribute" ADD COLUMN     "label" TEXT,
ADD COLUMN     "valueBoolean" BOOLEAN,
ADD COLUMN     "valueNumber" DOUBLE PRECISION,
ADD COLUMN     "valueString" TEXT;
