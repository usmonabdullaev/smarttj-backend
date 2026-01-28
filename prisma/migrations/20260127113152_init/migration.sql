/*
  Warnings:

  - Added the required column `message` to the `SmsLog` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SmsLog" ADD COLUMN     "message" TEXT NOT NULL;
