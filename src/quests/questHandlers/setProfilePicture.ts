import { app } from "../../bolt";
import { prisma } from "../../prisma";
import { getTemplate } from "../../util/transcript";
import { complete } from "../quests";

const QUEST_ID = 'setProfilePicture';

app.event('user_profile_changed', async ({ payload }) => {
    app.logger.info('Message received', payload);

    const slackId = payload.user.id;

    if (!slackId) { return; }
    
    const quest = await prisma.quests.findFirst({
        where: {
            questId: QUEST_ID,
            user: {
                slackId,
            }
        }
    });

    // For now, just check if there was an update in the first place
    if (quest && !quest.completed ) { //&& payload.user.profile.is_custom_image) { 
        await complete(quest.uid);

        await app.client.chat.postMessage({
            token: process.env.SLACK_BOT_TOKEN,
            channel: slackId,
            text: getTemplate('quests.setProfilePicture.completed'),
        });
    }
});
