/*
  Warnings:

  - A unique constraint covering the columns `[phone,role]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "User_phone_key";

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_role_key" ON "User"("phone", "role");
