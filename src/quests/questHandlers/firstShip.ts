import type { BaseSlackEvent } from "@slack/bolt";
import { app } from "../../bolt";
import { CONFIG } from "../../entry";
import { prisma } from "../../prisma";
import { getTemplate } from "../../util/transcript";
import { complete } from "../quests";
import type { FileSharedEvent } from "@slack/types";

const QUEST_ID = 'firstShip';

function isValidShip(payload: FileSharedEvent): boolean {
    return payload.channel_id == CONFIG.botNotSpam;
}

app.event('file_shared', async ({ payload }) => { // TODO: Change to on message event and just look for links or whatnot
    console.log(payload);
    const slackId = payload.user_id;

    app.logger.info(`file_share event received from ${slackId}, questId: ${QUEST_ID}, channel: ${payload.channel_id}`);

    const quest = await prisma.quests.findFirst({
        where: {
            questId: QUEST_ID,
            user: {
                slackId,
            }
        }
    });

    if (quest && !quest.completed && isValidShip(payload)) {
        await complete(quest.uid);
        await app.client.chat.postEphemeral({
            token: process.env.SLACK_BOT_TOKEN,
            channel: payload.channel_id,
            text: getTemplate('quests.firstShip.completed'),
            user: slackId,
        });
    }
});
