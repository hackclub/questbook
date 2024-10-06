import { prisma } from "../util/prisma.js";
import Quest from "./base.js";
import app from "../util/bolt.js";

class WelcomeQuest extends Quest {
    public questId = "Welcome Quest";
    public description = "Welcome to the team! Complete this quest to get started.";
    public tier = 1;
    public completion = 1;

    public async register({slackId}: {slackId: string}): Promise<void> {
        // Register the user for the quest
        await prisma.quest.create({
            data: {
                questId: this.questId,
                user: {
                    connectOrCreate: {
                        where: { slackId: slackId },
                        create: { slackId: slackId },
                    }
                },
                completion: this.completion,
            },
        });

        await prisma.user.upsert({
            where: { slackId: slackId },
            update: {
                quests: {
                    create: [
                        {
                            questId: this.questId,
                            completion: this.completion,
                        }
                    ],
                },
            },
            create: {
                slackId: slackId, 
                quests: {
                    create: [
                        {
                            questId: this.questId,
                            completion: this.completion,
                        }
                    ],
                },
            },
        });
    }

    public poll({slackId}: {slackId: string}): void {
        // No need to poll for this quest
    }

    public async listen(): Promise<void> {
        const usersInQuest = (await prisma.quest.findMany({
            where: {
                questId: this.questId,
            },
        })).map((quest) => quest.slackId);

        app.message(async ({ message }) => {
            if ((message as any).user in usersInQuest) {
                await prisma.quest.updateMany({
                    where: {
                        slackId: (message as any).user,
                        questId: this.questId,
                    },
                    data: {
                        completion: 1,
                    },
                });
            }
        });
    }
}