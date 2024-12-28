-- CreateTable
CREATE TABLE "User" (
    "slackId" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("slackId")
);

-- CreateTable
CREATE TABLE "Quests" (
    "uid" TEXT NOT NULL,
    "questId" TEXT NOT NULL,
    "questName" TEXT NOT NULL,
    "step" INTEGER NOT NULL,
    "slackId" TEXT NOT NULL,

    CONSTRAINT "Quests_pkey" PRIMARY KEY ("uid")
);

-- AddForeignKey
ALTER TABLE "Quests" ADD CONSTRAINT "Quests_slackId_fkey" FOREIGN KEY ("slackId") REFERENCES "User"("slackId") ON DELETE RESTRICT ON UPDATE CASCADE;
