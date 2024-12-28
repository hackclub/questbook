import { app } from "./bolt";
import { prisma } from "./prisma";

const QUEST_META = {
    'id': 'first_message',
    'name': 'First Message!',
    'description': 'Send your first message in the Slack!',
    'completeStep': 1,
}

app.message(async ({ message }) => {
    app.logger.info('Message received', message);

    const slackId = (message as any).user;

    const quest = await prisma.quests.findFirst({
        where: {
            questId: QUEST_META.id,
            user: {
                slackId,
            }
        }
    });

    if (quest) {
        await prisma.quests.update({
            where: {
                uid: quest.uid,
            },
            data: {
                step: QUEST_META.completeStep,
            }
        });

        await app.client.chat.postMessage({
            token: process.env.SLACK_BOT_TOKEN,
            channel: slackId,
            text: `Congratulations! You have completed the quest: ${QUEST_META.name}`,
            username: 'questbook'
        });
    }
});
