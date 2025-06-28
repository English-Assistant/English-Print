/*
  Warnings:

  - You are about to drop the column `description` on the `Paper` table. All the data in the column will be lost.
  - Made the column `courseId` on table `Paper` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Paper" DROP CONSTRAINT "Paper_courseId_fkey";

-- AlterTable
ALTER TABLE "Paper" DROP COLUMN "description",
ADD COLUMN     "coreWords" TEXT,
ADD COLUMN     "keySentences" TEXT,
ADD COLUMN     "remark" TEXT,
ALTER COLUMN "courseId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Paper" ADD CONSTRAINT "Paper_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
