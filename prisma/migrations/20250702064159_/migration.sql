-- CreateTable
CREATE TABLE "User" (
    "slackId" TEXT NOT NULL,
    "blue" INTEGER NOT NULL DEFAULT 0,
    "red" INTEGER NOT NULL DEFAULT 0,
    "yellow" INTEGER NOT NULL DEFAULT 0,
    "flowStep" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "User_pkey" PRIMARY KEY ("slackId")
);
