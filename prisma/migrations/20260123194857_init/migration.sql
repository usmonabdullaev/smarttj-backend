/*
  Warnings:

  - You are about to drop the `MonthlyReport` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "MonthlyReport";

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "ordersCount" INTEGER NOT NULL,
    "revenue" DECIMAL(14,2) NOT NULL,
    "avgOrderValue" DECIMAL(14,2) NOT NULL,
    "paidOrdersCount" INTEGER NOT NULL,
    "refundedAmount" DECIMAL(14,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Report_year_idx" ON "Report"("year");

-- CreateIndex
CREATE UNIQUE INDEX "Report_year_month_key" ON "Report"("year", "month");
