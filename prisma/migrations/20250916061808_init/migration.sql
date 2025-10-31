/*
  Warnings:

  - You are about to alter the column `salary` on the `Employee` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Integer`.
  - Changed the type of `status` on the `Employee` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "Employee" DROP CONSTRAINT "Employee_userId_fkey";

-- DropIndex
DROP INDEX "Employee_userId_key";

-- AlterTable
ALTER TABLE "Employee" ALTER COLUMN "salary" SET DATA TYPE INTEGER,
DROP COLUMN "status",
ADD COLUMN     "status" "EmployeeStatus" NOT NULL;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
