import 'dotenv/config';
import { app } from './bolt';
import { prisma } from './prisma';

app.command('/quest-test', async ({ ack, body, client }) => {
    await ack();

    await prisma.user.create({
        data: {
            slackId: body.user_id,
        }
    });
});

await app.start(process.env.PORT || 3000);

app.logger.info('⚡️ Bolt app is running!');