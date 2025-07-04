import { app } from "../../bolt";
import { prisma } from "../../prisma";
import { getTemplate } from "../../util/transcript";
import { complete } from "../quests";
import { CONFIG } from "../../entry"

const QUEST_ID = 'joinChannel';

app.event('member_joined_channel', async ({ payload }) => {
    app.logger.info('member_joined_channel event received', payload);

    const slackId = payload.user;

    if (CONFIG["defaultChannels"].includes(payload.channel)) {
        return;
    }

    console.log(`slackId: ${slackId} joined channel ${payload.channel}`);

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
            channel: payload.channel,
            text: getTemplate('quests.joinChannel.completed'),
            user: slackId,
        });
    }
});
