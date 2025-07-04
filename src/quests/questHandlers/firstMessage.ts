import { app } from "../../bolt";
import { CONFIG } from "../../entry";
import { prisma } from "../../prisma";
import { getTemplate } from "../../util/transcript";
import { complete } from "../quests";

const QUEST_ID = 'firstMessage';

/*
pretty basic structure, but here's how it works

somewhere else --> calls register('firstMessage', slackId)

this file --> listens or polls data source to check quest completion

if quest is completed --> calls complete(quest.uid)
*/

app.message(async ({ message }) => {
    const slackId = (message as any).user;

    if (message.subtype && message.channel != CONFIG.botNotSpam) { // Make sure you're not registering a channel join
        return;
    }


    const quest = await prisma.quests.findFirst({
        where: {
            questId: QUEST_ID,
            user: {
                slackId,
            }
        }
    });

    if (quest && !quest.completed) {
        await complete(quest.uid);

        await app.client.chat.postEphemeral({
            token: process.env.SLACK_BOT_TOKEN,
            channel: message.channel,
            text: getTemplate('quests.firstMessage.completed'),
            user: slackId,
        });
    }
});
