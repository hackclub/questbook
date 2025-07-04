import type { AnyBlock, SectionBlock, View } from "@slack/types";
import { app } from "../bolt";
import { prisma } from "../prisma";

import fs from "fs";
import { parse } from "yaml";
import { genProgressBar, getTemplate } from "../util/transcript";
import { Stage } from "@prisma/client";
import { CONFIG } from '../entry';

const questsFile = fs.readFileSync("./src/quests/quests.yaml", "utf8");
const questConfigData = parse(questsFile);
export const questsMetadata = questConfigData['quests'];

export async function register(questId: string, slackId: string) {
    if (!slackId) { // check if user exists
        console.log("User doesn't exist! Skipping flow.");
    } else {
        // check if they're in the database or not
        const user = await prisma.user.findFirst({
            where: {
                slackId,
            }
        });

        if (!user) {
            console.log("User doesn't exist in database! Skipping flow.");
        } else {
            const quest = await prisma.quests.findFirst({
                where: {
                    questId,
                    user: {
                        slackId,
                    }
                }
            });

            await prisma.quests.upsert({
                where: {
                    uid: quest?.uid || "unknown",
                },
                update: {}, // prevent duplicate entries
                create: {
                    questId,
                    user: {
                        connect: {
                            slackId,
                        }
                    }
                }
            });            
        }
    }
}

export async function complete(uid: string) {
    // when the quest is complete, this will be called -
    const quest = await prisma.quests.update({
        where: {
            uid,
        },
        data: {
            progress: 1,
            completed: true,
            dateCompleted: new Date(),
        }
    });

    const questsTotal = await prisma.quests.count({
        where: {
            user: {
                slackId: quest.slackId,
            },
        }
    });

    if (questsTotal == 3) {
        const questsFinished = await prisma.quests.count({
            where: {
                user: {
                    slackId: quest.slackId,
                },
            }
        });

        if (questsFinished == 3) {
            // send more quests
            await app.client.chat.postMessage({
                token: process.env.SLACK_BOT_TOKEN,
                channel: quest.slackId,
                text: getTemplate('questsTutorialComplete'),
            });   

            await prisma.user.update({
                where: {
                    slackId: quest.slackId,
                },
                data: {
                    tutorial_stage: Stage.FINISHED
                }
            });
        }
    }
}

async function openHomepage(slackId: string, context: any) {
    let HOME_PAYLOAD: View = {
        "type": "home",
        "blocks": [
            {
                "type": "header",
                "text": {
                    "type": "plain_text",
                    "text": "Quests in Progress",
                    "emoji": true
                }
            },
            {
                "type": "section",
                "text": {
                    "type": "plain_text",
                    "text": "Work on these (or not) at your own pace!",
                    "emoji": true
                }
            },
        ]
    }
    
    let HOME_COMPLETED_PAYLOAD: AnyBlock[] = [
        {
            "type": "header",
            "text": {
                "type": "plain_text",
                "text": "Completed Quests",
                "emoji": true
            }
        },
        {
            "type": "divider"
        },
    ];
    
    try {
        const quests = await prisma.quests.findMany({
            where: {
                user: {
                    slackId,
                },
                // completed: false,
            }
        });
    
        if (!quests.length) {
            await app.client.views.publish({
                token: context.botToken,
                user_id: slackId,
                view: {
                    "type": "home",
                    "blocks": [
                        {
                            "type": "header",
                            "text": {
                                "type": "plain_text",
                                "text": "Hello! :rac_woah:",
                                "emoji": true
                            }
                        },
                        {
                            "type": "section",
                            "text": {
                                "type": "mrkdwn",
                                "text": "I'm heidi the hakkuun :D! Meet me at the messages tab and I'll show you around! Check back here afterwards, I got some cool stuff for you :rac_info:!"
                            }
                        },
                        {
                            "type": "actions",
                            "elements": [
                                {
                                    "type": "button",
                                    "text": {
                                        "type": "plain_text",
                                        "text": "Sure Thing :thumbsup-dino:",
                                        "emoji": true
                                    },
                                    "url": `slack://app?team=${CONFIG.TEAM_ID}&id=${CONFIG.APP_ID}&tab=messages`,
                                    "action_id": questConfigData['messagesActionId']
                                }
                            ]
                        }
                    ]
                },
            });
            return;
        };
    
        quests.forEach((quest) => {
            const questID = quest.questId;
            const questData = questsMetadata[questID];
    
            let base: SectionBlock = {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": `*${questData['title']}*\n${questData["description"]}\n\n\n${genProgressBar(20, quest.progress)} ${(quest.progress * 100).toFixed(0)}%`,
                }
            };
            if (questData["image"] && questData["imageAlt"]) {
                base["accessory"] = {
                    "type": "image",
                    "image_url": questData["image"],
                    "alt_text": questData["imageAlt"]
                }
            };
            
            (quest.completed ? HOME_COMPLETED_PAYLOAD : HOME_PAYLOAD.blocks).push(base);
            
            if (!quest.completed && (questData["url"] || questData["tutorialActionId"])) {
                let button_base: any = {
                    "type": "actions",
                    "elements": []
                };
                if (questData["url"]) {
                    button_base.elements.push({
                        "type": "button",
                        "text": {
                            "type": "plain_text",
                            "text": "View Quest",
                        },
                        "url": questData["url"],
                    });
                };
                if (questData["tutorialActionId"]) {
                    button_base.elements.push({
                        "type": "button",
                        "text": {
                            "type": "plain_text",
                            "text": ":question: Tutorial",
                        },
                        "action_id": questData["tutorialActionId"],
                    });
                };
                HOME_PAYLOAD.blocks.push(button_base);
            };
    
            (quest.completed ? HOME_COMPLETED_PAYLOAD : HOME_PAYLOAD.blocks).push({ // divider
                "type": "divider"
            });
        }); 
    
        if(HOME_COMPLETED_PAYLOAD.length > 1) HOME_PAYLOAD.blocks.push(...HOME_COMPLETED_PAYLOAD);
    
        await app.client.views.publish({
            token: context.botToken,
            user_id: slackId,
            view: HOME_PAYLOAD,
        });
    } catch (error) {
        console.error(error);
    } 
}


app.event('app_home_opened', async ({ event, context }) => {
    openHomepage(event.user, context);
});


Object.entries(questsMetadata).forEach(([questID, questData]: [string, any]) => {
    if (questData["tutorialActionId"]) {
        app.action(questData["tutorialActionId"], async ({ ack, body, context }) => {
            console.log("triggered", questData["tutorialActionId"])
            await ack();
            
            let TUTORIAL_PAYLOAD: View = {
                "type": "home",
                "blocks": [
                    {
                        "type": "actions",
                        "elements": [
                            {
                                "type": "button",
                                "text": {
                                    "type": "plain_text",
                                    "text": ":arrow_left: Back to Homepage",
                                    "emoji": true
                                },
                                "action_id": "quests-homepage"
                            }
                        ]
                    },
                    {
                        "type": "header",
                        "text": {
                            "type": "plain_text",
                            "text": `Tutorial: ${questsMetadata[questID]['title']}`,
                            "emoji": true
                        }
                    },
                    {
                        "type": "divider"
                    },
                ]
            }
        
            questsMetadata[questID]['tutorial'].forEach((tutorialStep: any) => {
                TUTORIAL_PAYLOAD.blocks.push({
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": tutorialStep["description"],
                    }
                });
        
                if (tutorialStep['image'] && tutorialStep['imageAlt']) {
                    TUTORIAL_PAYLOAD.blocks.push({
                        "type": "image",
                        "image_url": tutorialStep['image'],
                        "alt_text": tutorialStep['imageAlt'],
                    });
                }
        
                TUTORIAL_PAYLOAD.blocks.push({
                    "type": "divider"
                });
            });
        
            await app.client.views.publish({
                token: context.botToken,
                user_id: body.user.id,
                view: TUTORIAL_PAYLOAD,
            });
        });
    }
});

app.action("quests-homepage", async ({ ack, body, context }) => {
    await ack();
    openHomepage(body.user.id, context);
});

app.action(questConfigData['messagesActionId'], async ({ ack }) => {
    await ack();
});