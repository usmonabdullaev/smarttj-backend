/*
  Warnings:

  - A unique constraint covering the columns `[userId,fingerprint]` on the table `Session` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Session_fingerprint_idx";

-- DropIndex
DROP INDEX "Session_userId_idx";

-- CreateIndex
CREATE UNIQUE INDEX "Session_userId_fingerprint_key" ON "Session"("userId", "fingerprint");
