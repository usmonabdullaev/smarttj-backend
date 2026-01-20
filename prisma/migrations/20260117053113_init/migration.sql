/*
  Warnings:

  - Added the required column `short_name` to the `Category` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "short_name" TEXT NOT NULL;
