import type { BaseSlackEvent } from "@slack/bolt";
import { app } from "../../bolt";
import { CONFIG } from "../../entry";
import { prisma } from "../../prisma";
import { getTemplate } from "../../util/transcript";
import { complete } from "../quests";

const QUEST_ID = 'firstShip';

app.event('file_share', async ({ payload }) => {
    const slackId = (payload as any).user;

    const quest = await prisma.quests.findFirst({
        where: {
            questId: QUEST_ID,
            user: {
                slackId,
            }
        }
    });

    if (quest && !quest.completed && (payload as any).channel == CONFIG.botNotSpam) {
        await complete(quest.uid);
        await app.client.chat.postEphemeral({
            token: process.env.SLACK_BOT_TOKEN,
            channel: (payload as any).channel,
            text: getTemplate('quests.firstShip.completed'),
            user: slackId,
        });
    }
});
