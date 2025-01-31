/*
  Warnings:

  - A unique constraint covering the columns `[questId]` on the table `Quests` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Quests_questId_key" ON "Quests"("questId");
