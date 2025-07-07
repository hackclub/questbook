/*
  Warnings:

  - You are about to drop the column `feedback` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `projects` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "feedback",
DROP COLUMN "projects";
