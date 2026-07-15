/*
  Warnings:

  - You are about to drop the column `pushToken` on the `Session` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[expoPushToken]` on the table `Session` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Session_pushToken_key";

-- AlterTable
ALTER TABLE "Session" DROP COLUMN "pushToken",
ADD COLUMN     "expoPushToken" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Session_expoPushToken_key" ON "Session"("expoPushToken");
