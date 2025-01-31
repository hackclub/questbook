import { getTemplate } from './util/transcript';
import { Stage } from '@prisma/client';

import { app } from './bolt';
import { prisma } from './prisma';

import { register } from './quests/quests';

import { CONFIG } from './entry';

async function flowStep(stage: Stage, inner: Parameters<typeof app.action>[1]) {
    app.action(stage, async (args) => {
        await args.ack();
     
        await prisma.user.update({
            where: {
                slackId: args.body.user.id,
            },
            data: {
                tutorial_stage: stage,
            }
        });

        await inner(args);
    });
}

// @questbook
app.command('/test-start', async ({ ack, body, client }) => {
    // Add an entry to the database and start the quest
    await ack();

    await prisma.user.upsert({
        where: {
            slackId: body.user_id,
        }, 
        update: {
            tutorial_stage: 'INITIALIZED',
        },
        create: {
            slackId: body.user_id,
        }
    });

    await app.client.chat.postMessage({
        token: process.env.SLACK_BOT_TOKEN,
        channel: body.user_id,
        text: getTemplate('findGarbage'),
        blocks: [
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": getTemplate('findGarbage'),
                },
            },
            {
                "type": "actions",
                "elements": [
                    {
                        "type": "button",
                        "text": {
                            "type": "plain_text",
                            "text": "open the lid (click me)",
                        },
                        "action_id": Stage.OPEN_LID, 
                    },
                ],
            },
        ],
    });

    // await prisma.quests.create({
    //     data: {
    //         questId: 'first_message',
    //         user: {
    //             connect: {
    //                 slackId: body.user_id,
    //             }
    //         }
    //     }
    // });
});

flowStep(Stage.OPEN_LID, async ({ ack, body, client }) => {
    await app.client.chat.postMessage({
        token: process.env.SLACK_BOT_TOKEN,
        channel: body.user.id,
        text: getTemplate('openGarbage'),
        blocks: [
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": getTemplate('openGarbage'),
                },
            },
            {
                "type": "actions",
                "elements": [
                    {
                        "type": "button",
                        "text": {
                            "type": "plain_text",
                            "text": "Show me! (click me)",
                        },
                        "action_id": Stage.SHOW_COC, 
                    },
                ],
            },
        ], 
    });
});

flowStep(Stage.SHOW_COC, async ({ ack, body, client }) => {
    await app.client.chat.postMessage({
        token: process.env.SLACK_BOT_TOKEN,
        channel: body.user.id,
        text: getTemplate('codeOfConduct'),
        unfurl_links: false,
        blocks: [
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": getTemplate('codeOfConduct'),
                },
            },
            {
                "type": "actions",
                "elements": [
                    {
                        "type": "button",
                        "text": {
                            "type": "plain_text",
                            "text": "I agree! (click me)",
                        },
                        "action_id": Stage.ACCEPTED_COC, 
                    },
                ],
            },
        ], 
    });
});

// Make sure to add users to channels at this step
flowStep(Stage.ACCEPTED_COC, async ({ ack, body, client }) => {
    await app.client.chat.postMessage({
        token: process.env.SLACK_BOT_TOKEN,
        channel: body.user.id,
        text: getTemplate('acceptedCodeOfConduct'),
        unfurl_links: true,
        blocks: [
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": getTemplate('acceptedCodeOfConduct'),
                },
            },
            {
                "type": "actions",
                "elements": [
                    {
                        "type": "button",
                        "text": {
                            "type": "plain_text",
                            "text": "awesome!",
                        },
                        "action_id": Stage.SLACK_TUTORIAL, 
                    },
                ],
            },
        ],
    });
    
    let add_to = async (channel_id: string) => {
        try {
            console.log(`   - Adding ${body.user.id} to ${channel_id}`);
            await app.client.conversations.invite({
                users: body.user.id,
                channel: channel_id,
            });
        } catch (e: any) {
            if (e.data.error === 'already_in_channel') {
                console.log(`   - User ${body.user.id} is already in channel ${channel_id}`);
                return;
            } else {
                // todo: handle
                console.error(e.data);
            }
        }
    }

    console.log(`${body.user.id} accepted the CoC:`)
    Promise.all(CONFIG['defaultChannels'].map(add_to));
});

flowStep(Stage.SLACK_TUTORIAL, async ({ ack, body, client }) => {
    await app.client.chat.postMessage({
        token: process.env.SLACK_BOT_TOKEN,
        channel: body.user.id,
        text: getTemplate('slackTutorial'),
        unfurl_links: false,
        blocks: [
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": getTemplate('slackTutorial'),
                },
            },
            {
                "type": "image",
                "title": {
                    "type": "plain_text",
                    "text": "Click home to get to the home tab!",
                    "emoji": true
                },
                "image_url": "https://cloud-r93w7tl06-hack-club-bot.vercel.app/0screenshot_2025-01-30_at_10.31.09___pm.png",
                "alt_text": "Click home to get to the home tab"
            }
        ], 
    });

    register('firstMessage', body.user.id);
    register('joinChannel', body.user.id);
    register('setProfilePicture', body.user.id);
});