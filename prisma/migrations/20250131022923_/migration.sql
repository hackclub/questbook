/*
  Warnings:

  - You are about to drop the column `step` on the `Quests` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Quests" DROP COLUMN "step",
ADD COLUMN     "progress" DOUBLE PRECISION NOT NULL DEFAULT 0;
