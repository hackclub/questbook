import { app } from "./bolt";
import { prisma } from "./prisma";

const QUEST_META = {
    'id': 'first_message',
    'name': 'First Message!',
    'description': 'Send your first message in the Slack!',
    'completeStep': 1,
}

app.message(async ({ message }) => {
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
        
    }
});
