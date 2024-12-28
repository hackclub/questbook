/*
  Warnings:

  - You are about to drop the column `questName` on the `Quests` table. All the data in the column will be lost.
  - Added the required column `metadata` to the `Quests` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Quests" DROP COLUMN "questName",
ADD COLUMN     "metadata" JSONB NOT NULL;
