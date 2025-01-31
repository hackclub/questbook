import type { AnyBlock, SectionBlock, View } from "@slack/types";
import { app } from "../bolt";
import { prisma } from "../prisma";

import fs from "fs";
import { parse } from "yaml";
import { genProgressBar, getTemplate } from "../util/transcript";
import { Stage } from "@prisma/client";

const questsFile = fs.readFileSync("./src/quests/quests.yaml", "utf8");
const questsMetadata = parse(questsFile)['quests'];

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

    const questsFinished = await prisma.quests.count({
        where: {
            user: {
                slackId: quest.slackId,
            },
            completed: true,
        }
    });

    if (questsFinished > 3) {
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

app.event('app_home_opened', async ({ event, context }) => {
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
        const { user } = event;
        const slackId = user;

        const quests = await prisma.quests.findMany({
            where: {
                user: {
                    slackId,
                },
                // completed: false,
            }
        });

        if (!quests.length) {
            // wip
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
            
            if (!quest.completed && (questData["url"] || questData["tutorial"])) {
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
                if (questData["tutorial"]) {
                    button_base.elements.push({
                        "type": "button",
                        "text": {
                            "type": "plain_text",
                            "text": ":question: Tutorial",
                        },
                        "action_id": questData["tutorial"],
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
});