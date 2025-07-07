import type { AnyBlock, Block } from "@slack/types";
import { app } from "./bolt";
import { prisma } from "./prisma";
import { addFeedback, addGuild } from "./airtable";

app.client.chat.postMessage({
    channel: `U04QD71QWS0`, //set to your slack id
	"blocks": [
		{
			"type": "actions",
			"elements": [
				{
					"type": "button",
					"text": {
						"type": "plain_text",
						"text": "??",
						"emoji": true
					},
					"action_id": "start"
				}
			]
		}
	]
})

app.action("start", async ({ body, ack }) => {
    /*
     WELCOME, [@name]. Just one final task before you gain permissions to speak in this channel. :thread: 
 
     After numerous trials and tribulations, you’re finally at the end of the Highway. You step out and brush dust off yourself, waiting... but waiting for what? Feeling a little lost, you look around the starry landscape. 
 
     On your right, a crumbling structure catches your eye. You turn, and see that just ahead lies a gate - an imposing obsidian structure carved with arcane patterns... and dog heads?
 
     Either way, something about this gate feels enthralling, as if behind its doors, a whole new world lies just for you. Anticipation filling your chest, you approach it. 
 
     [image 1: gate without light]
 
     Suddenly, a shadow falls over you. Looking up, you make contact with not one, but three sets of eyes.
 
     [image 2: got shadowed by 3 dawg heads and glowing coloured eyes]
 
     You now stand in front of the Cerberus, the eternal guardian of the gates to Undercity. It pins you with its gaze.
    */

    await ack();

    await prisma.user.upsert({
        where: {
            slackId: body.user.id
        },
        update: {
            flowStep: 0
        },
        create: {
            slackId: body.user.id,
        }
    });

    await app.client.chat.postMessage({
        channel: body.user.id,
        text: `WELCOME, [@name]. Just one final task before you gain permissions to speak in this channel. :thread: 

After numerous trials and tribulations, you’re finally at the end of the Highway. You step out and brush dust off yourself, waiting... but waiting for what? Feeling a little lost, you look around the starry landscape.`
    });

    await Bun.sleep(1000);

    await app.client.chat.postMessage({
        channel: body.user.id,
        text: `On your right, a crumbling structure catches your eye. You turn, and see that just ahead lies a gate - an imposing obsidian structure carved with arcane patterns... and dog heads?
    
Either way, something about this gate feels enthralling, as if behind its doors, a whole new world lies just for you. Anticipation filling your chest, you approach it.`
    });

    await Bun.sleep(1000);

    await app.client.chat.postMessage({
        channel: body.user.id,
        blocks: [
            {
                "type": "image",
                "image_url": "https://assets3.thrillist.com/v1/image/1682388/size/tl-horizontal_main.jpg",
                "alt_text": "delicious tacos"
            },
            {
                "type": "section",
                "text": {
                    "type": "plain_text",
                    "text": `[image 1: gate without light]

Suddenly, a shadow falls over you. Looking up, you make contact with not one, but three sets of eyes.`,
                    "emoji": true
                }
            }
        ]
    });

    await Bun.sleep(1000)

    await app.client.chat.postMessage({
        channel: body.user.id,
        blocks: [
            {
                "type": "image",
                "image_url": "https://assets3.thrillist.com/v1/image/1682388/size/tl-horizontal_main.jpg",
                "alt_text": "delicious tacos"
            },
            {
                "type": "section",
                "text": {
                    "type": "plain_text",
                    "text": `[image 2: got shadowed by 3 dawg heads and glowing coloured eyes]

You now stand in front of the Cerberus, the eternal guardian of the gates to Undercity. It pins you with its gaze.`,
                    "emoji": true
                }
            }
        ]
    })

    await Bun.sleep(1000);

    /*
        :cerb-blue::cerb-red::cerb-yellow:: Welcome, @[name]. How have you found your journey through the Highway? (Reply in thread!)
        [free answer, feedback]
 
        :cerb-blue::cerb-red::cerb-yellow:: And what have you built? (Reply in thread!)
        [free answer, list your project(s)]
    */

    await app.client.chat.postMessage({
        channel: body.user.id,
        blocks: [
            {
                "type": "input",
                "element": {
                    "type": "plain_text_input",
                    "action_id": "feedback",
                    "multiline": true,
                },
                "label": {
                    "type": "plain_text",
                    "text": ":cerb-blue::cerb-red::cerb-yellow:: Welcome, @[name]. How have you found your journey through the Highway?",
                    "emoji": true
                },
                "block_id": "feedback"
            },
            {
                "type": "input",
                "element": {
                    "type": "plain_text_input",
                    "action_id": "projects",
                    "multiline": true,
                },
                "label": {
                    "type": "plain_text",
                    "text": ":cerb-blue::cerb-red::cerb-yellow:: And what have you built?",
                    "emoji": true
                },
                "block_id": "projects"
            },
            {
                "type": "actions",
                "elements": [
                    {
                        "type": "button",
                        "text": {
                            "type": "plain_text",
                            "text": "Next",
                            "emoji": true
                        },
                        "action_id": "1"
                    }
                ]
            }
        ]
    });

    await prisma.user.update({
        where: {
            slackId: body.user.id
        },
        data: {
            flowStep: 1
        }
    });
});

app.action("1", async ({ body, ack }) => {
    /*
    The Cerberus relaxes, and a weight lifts off your chest. It approves of what you’ve made. You’ve passed; you are worthy of the crossing. It steps aside and motions you forwards. The gate starts transforming: glowing neon lights slowly run through the curves and cracks, lighting up the entire structure, slowly opening to reveal a looming portal.

    [image 3: animation? glowing gate]

    :cerb-blue:: This is the portal to Undercity! 
    :cerb-red:: You’re almost there - just one final step.
    :cerb-yellow:: Step into the labyrinth... to find your place in Undercity.

    [BUTTON: Step through the portal]
    */

    await ack();

    const values = (body as any).state.values;

    if (!values.feedback.feedback.value || !values.projects.projects.value) {
        await app.client.chat.postEphemeral({
            channel: body.user.id,
            text: "wot???",
            user: body.user.id
        });
        return;
    }

    await app.client.chat.postMessage({
        channel: body.user.id,
        blocks: [
            {
                "type": "section",
                "text": {
                    "type": "plain_text",
                    "text": `The Cerberus relaxes, and a weight lifts off your chest. It approves of what you’ve made. You’ve passed; you are worthy of the crossing. It steps aside and motions you forwards. The gate starts transforming: glowing neon lights slowly run through the curves and cracks, lighting up the entire structure, slowly opening to reveal a looming portal.`,
                    "emoji": true
                }
            },
            {
                "type": "image",
                "image_url": "https://assets3.thrillist.com/v1/image/1682388/size/tl-horizontal_main.jpg",
                "alt_text": "delicious tacos"
            },
            {
                "type": "section",
                "text": {
                    "type": "plain_text",
                    "text": `:cerb-blue:: This is the portal to Undercity!
:cerb-red:: You’re almost there - just one final step.
:cerb-yellow:: Step into the labyrinth... to find your place in Undercity.`,
                    "emoji": true
                }
            },
            {
                "type": "actions",
                "elements": [
                    {
                        "type": "button",
                        "text": {
                            "type": "plain_text",
                            "text": "Step through the portal",
                            "emoji": true
                        },
                        "action_id": "2"
                    }
                ]
            }
        ]
    });

    await prisma.user.update({
        where: {
            slackId: body.user.id
        },
        data: {
            flowStep: 2
        }
    });

    await addFeedback(
        body.user.id,
        values.feedback.feedback.value || "",
        values.projects.projects.value || ""
    )
});

// to make sure i DRY, let's create a helper function
function quiz(step: string, blocks: AnyBlock[]) {
    app.action(step, async ({ body, ack }) => {
        await ack();

        const values = (body as any).state.values;

        const user = await prisma.user.findUnique({
            where: {
                slackId: body.user.id
            }
        });

        if (!user || user.flowStep !== parseInt(step)) {
            console.log("User not found or flow step mismatch");
            console.log(user?.flowStep, step);

            await app.client.chat.postEphemeral({
                channel: body.user.id,
                text: "lol you already answered this",
                user: body.user.id
            });

            return;
        }

        await app.client.chat.postMessage({
            channel: body.user.id,
            blocks
        });

        if (values && values.question && values.question.q) {
            const guild = values.question.q.value;

            await prisma.user.update({
                where: {
                    slackId: body.user.id
                },
                data: {
                    flowStep: parseInt(step) + 1,
                    red: { increment: guild === "red" ? 1 : 0 },
                    blue: { increment: guild === "blue" ? 1 : 0 },
                    yellow: { increment: guild === "yellow" ? 1 : 0 }
                }
            });
        } else {
            await prisma.user.update({
                where: {
                    slackId: body.user.id
                },
                data: {
                    flowStep: parseInt(step) + 1
                }
            });
        }
    });
}

/*
    Immediately, everything fades to black. You drift for an indeterminate amount of time, but upon waking up…

    What’s your first thought?

    * where’s the fun at? (blue?)
    * i need to find something to keep me alive (yellow)
    * im ready to face all challenges ahead (red?)
*/
quiz("2", [
    {
        "type": "section",
        "text": {
            "type": "plain_text",
            "text": "Immediately, everything fades to black. You drift for an indeterminate amount of time, but upon waking up…",
            "emoji": true
        }
    },
    {
        "type": "input",
        "element": {
            "type": "radio_buttons",
            "options": [
                {
                    "text": {
                        "type": "plain_text",
                        "text": "where’s the fun at?",
                        "emoji": true
                    },
                    "value": "blue"
                },
                {
                    "text": {
                        "type": "plain_text",
                        "text": "i need to find something to keep me alive",
                        "emoji": true
                    },
                    "value": "yellow"
                },
                {
                    "text": {
                        "type": "plain_text",
                        "text": "im ready to face all challenges ahead",
                        "emoji": true
                    },
                    "value": "red"
                }
            ],
            "action_id": "q"
        },
        "label": {
            "type": "plain_text",
            "text": "What’s your first thought?",
            "emoji": true
        },
        block_id: "question"
    },
    {
        "type": "actions",
        "elements": [
            {
                "type": "button",
                "text": {
                    "type": "plain_text",
                    "text": "Next",
                    "emoji": true
                },
                "action_id": "3"
            }
        ]
    }
]);

/*
    You look around, and you find yourself in a huge labyrinth, challenges lurking in every corner. Right in front of you lies a raging river, one that you must cross to continue. However, the water level seems to be rising slowly but steadily, and threatens to swallow you whole.

    Beside you lies some materials, what do you do?

    * Make yourself some stylish armour first, then build something to cross the waters. [red]
    * Analyse the situation, and immediately build a sturdy boat to cross [yellow]
    * OMG MATERIALS!!! Let’s make a giant lightsaber for funsies!! (☆▽☆)✨ Who cares about some silly water anyways  [blue]
*/
quiz("3", [
    {
        "type": "section",
        "text": {
            "type": "plain_text",
            "text": `You look around, and you find yourself in a huge labyrinth, challenges lurking in every corner. Right in front of you lies a raging river, one that you must cross to continue. However, the water level seems to be rising slowly but steadily, and threatens to swallow you whole.`,
            "emoji": true
        }
    },
    {
        "type": "input",
        "element": {
            "type": "radio_buttons",
            "options": [
                {
                    "text": {
                        "type": "plain_text",
                        "text": "Make yourself some stylish armour first, then build something to cross the waters.",
                        "emoji": true
                    },
                    "value": "red"
                },
                {
                    "text": {
                        "type": "plain_text",
                        "text": "Analyse the situation, and immediately build a sturdy boat to cross",
                        "emoji": true
                    },
                    "value": "yellow"
                },
                {
                    "text": {
                        "type": "plain_text",
                        "text": `OMG MATERIALS!!! Let’s make a giant lightsaber for funsies!! (☆▽☆)✨ Who cares about some silly water anyways`,
                        "emoji": true
                    },
                    "value": "blue"
                }
            ],
            "action_id": "q"
        },
        label: {
            type: 'plain_text',
            text: "Beside you lies some materials, what do you do?",
            emoji: true
        },
        block_id: "question"
    },
    {
        "type": "actions",
        "elements": [
            {
                "type": "button",
                "text": {
                    "type": "plain_text",
                    "text": "Next",
                    "emoji": true
                },
                "action_id": "4"
            }
        ]
    }
]);

/*
    Eventually, you do find a way to get through the river (even if you did use that lightsaber as a floatie in the end) and you find a monster sleeping under a cave blocking your path. How do you cross without the monster noticing you?

    * Camouflage yourself and slowly walk past (yellow)
    * Run as fast as you can and hope it doesn't wake up (blue)
    * Distract it with something else and sneak away (red)
*/
quiz("4", [
    {
        "type": "section",
        "text": {
            "type": "plain_text",
            "text": `Eventually, you do find a way to get through the river (even if you did use that lightsaber as a floatie in the end) and you find a monster sleeping under a cave blocking your path. How do you cross without the monster noticing you?`,
            "emoji": true
        }
    },
    {
        "type": "input",
        "element": {
            "type": "radio_buttons",
            "options": [
                {
                    "text": {
                        "type": "plain_text",
                        "text": `Camouflage yourself and slowly walk past`,
                        "emoji": true
                    },
                    "value": "yellow"
                },
                {
                    "text": {
                        "type": "plain_text",
                        "text": `Run as fast as you can and hope it doesn't wake up`,
                        "emoji": true
                    },
                    "value": "blue"
                },
                {
                    "text": {
                        "type": "plain_text",
                        "text": `Distract it with something else and sneak away`,
                        "emoji": true
                    },
                    "value": "red"
                }
            ],
            action_id: 'q'
        },
        label: {
            type: 'plain_text',
            text: "How do you cross without the monster noticing you?",
            emoji: true
        },
        block_id: "question"
    },
    {
        "type": "actions",
        "elements": [
            {
                "type": "button",
                "text": {
                    "type": "plain_text",
                    "text": "Next",
                    "emoji": true
                },
                "action_id": "5"
            }
        ]
    }
]);

/*
    You made it past!! While walking, you managed to scrounge up some parts to make a vehicle. But eventually, your vehicle does break. How do you fix it?

    * Duct tape and glue the parts back up together. It works, but it's clear aesthetics weren't a concern [yellow]
    * Nah. I’m gonna drink so much celcius and make a whole new ride. [blue]
    * Fix it, and add maybe a sword... some wings... and now it looks defensive and agile! [red]
*/
quiz("5", [
    {
        "type": "section",
        "text": {
            "type": "plain_text",
            "text": `You made it past!! While walking, you managed to scrounge up some parts to make a vehicle. But eventually, your vehicle does break. How do you fix it?`,
            "emoji": true
        }
    },
    {
        "type": "input",
        "element": {
            "type": "radio_buttons",
            "options": [
                {
                    "text": {
                        "type": "plain_text",
                        "text": `Duct tape and glue the parts back up together. It works, but it's clear aesthetics weren't a concern`,
                        "emoji": true
                    },
                    "value": "yellow"
                },
                {
                    "text": {
                        "type": "plain_text",
                        "text": `Nah. I’m gonna drink so much celcius and make a whole new ride.`,
                        "emoji": true
                    },
                    "value": "blue"
                },
                {
                    "text": {
                        "type": "plain_text",
                        "text": `Fix it, and add maybe a sword... some wings... and now it looks defensive and agile!`,
                        "emoji": true
                    },
                    "value": "red"
                }
            ],
            action_id: 'q'
        },
        label: {
            type: 'plain_text',
            text: 'How do you fix it?',
            emoji: true
        },
        block_id: 'question'
    },
    {
        type: 'actions',
        elements: [
            {
                type: 'button',
                text: {
                    type: 'plain_text',
                    text: 'Next',
                    emoji: true
                },
                action_id: '6'
            }
        ]
    }
]);

/*
    After some time, you reach a patch of fog, with no way to get through unless you ask for help. 3 magical creatures offer to help you and be your companion for this journey, who do you choose?

    * A hyper baby dragon [blue]
    * An old and experienced griffin [yellow]
    * An elegant and refined chimera [red]
*/
quiz("6", [
    {
        "type": "section",
        "text": {
            "type": "plain_text",
            "text": `After some time, you reach a patch of fog, with no way to get through unless you ask for help. 3 magical creatures offer to help you and be your companion for this journey, who do you choose?`,
            "emoji": true
        }
    },
    {
        "type": "input",
        "element": {
            "type": "radio_buttons",
            "options": [
                {
                    "text": {
                        "type": "plain_text",
                        "text": `A hyper baby dragon`,
                        "emoji": true
                    },
                    "value": "blue"
                },
                {
                    "text": {
                        "type": "plain_text",
                        "text": `An old and experienced griffin`,
                        "emoji": true
                    },
                    "value": "yellow"
                },
                {
                    "text": {
                        "type": "plain_text",
                        "text": `An elegant and refined chimera`,
                        "emoji": true
                    },
                    "value": "red"
                }
            ],
            action_id: 'q'
        },
        label: {
            type: 'plain_text',
            text: 'Who do you choose?',
            emoji: true
        },
        block_id: 'question'
    },
    {
        type: 'actions',
        elements: [
            {
                type: 'button',
                text: {
                    type: 'plain_text',
                    text: 'Next',
                    emoji: true
                },
                action_id: '7'
            }
        ]
    }
]);

/*
    Inside the fog, you meet a group of lost and hungry villagers. You promise to lead them out, but first make them some food. What do you cook?

    * You bake a cake together! it looks wonky, but it was fun  ദ്ദി ˉ͈̀꒳ˉ͈́ )✧ [blue]
    * Cook them a proper meal, and you pay attention to plating everything to perfection. [red]
    * You teach them agriculture and ensure they have food for generations to come. [yellow]
*/
quiz("7", [
    {
        "type": "section",
        "text": {
            "type": "plain_text",
            "text": `Inside the fog, you meet a group of lost and hungry villagers. You promise to lead them out, but first make them some food. What do you cook?`,
            "emoji": true
        }
    },
    {
        "type": "input",
        "element": {
            "type": "radio_buttons",
            "options": [
                {
                    "text": {
                        "type": "plain_text",
                        "text": `You bake a cake together! it looks wonky, but it was fun`,
                        "emoji": true
                    },
                    "value": "blue"
                },
                {
                    "text": {
                        "type": "plain_text",
                        "text": `Cook them a proper meal, and you pay attention to plating everything to perfection.`,
                        "emoji": true
                    },
                    "value": "red"
                },
                {
                    "text": {
                        "type": "plain_text",
                        "text": `You teach them agriculture and ensure they have food for generations to come.`,
                        "emoji": true
                    },
                    "value": "yellow"
                }
            ],
            action_id: 'q'
        },
        label: {
            type: 'plain_text',
            text: 'What do you cook?',
            emoji: true
        },
        block_id: 'question'
    },
    {
        type: 'actions',
        elements: [
            {
                type: 'button',
                text: {
                    type: 'plain_text',
                    text: 'Next',
                    emoji: true
                },
                action_id: '8'
            }
        ]
    }
]);

/*
    Finally, you get through the fog and see a giant plaque bordering the edge of huge city. Answer some final questions and Undercity is all yours. 

    What’s your favourite part of hardware?

    * Actually, coding the software! [blue]
    * Making the pcb [red?]
    * Making the cad [yellow]
*/
quiz("8", [
    {
        "type": "section",
        "text": {
            "type": "plain_text",
            "text": `Finally, you get through the fog and see a giant plaque bordering the edge of huge city. Answer some final questions and Undercity is all yours.`,
            "emoji": true
        }
    },
    {
        "type": "input",
        "element": {
            "type": "radio_buttons",
            "options": [
                {
                    "text": {
                        "type": "plain_text",
                        "text": `Actually, coding the software!`,
                        "emoji": true
                    },
                    "value": "blue"
                },
                {
                    "text": {
                        "type": "plain_text",
                        "text": `Making the pcb`,
                        "emoji": true
                    },
                    "value": "red"
                },
                {
                    "text": {
                        "type": "plain_text",
                        "text": `Making the cad`,
                        "emoji": true
                    },
                    "value": "yellow"
                }
            ],
            action_id: 'q'
        },
        label: {
            type: 'plain_text',
            text: 'What’s your favourite part of hardware?',
            emoji: true
        },
        block_id: 'question'
    },
    {
        type: 'actions',
        elements: [
            {
                type: 'button',
                text: {
                    type: 'plain_text',
                    text: 'Next',
                    emoji: true
                },
                action_id: '9'
            }
        ]
    }
]);

/*
    Last question: at undercity, what do you wish to build?

    * Something fun
    * Something cool
    * Something useful
*/
quiz("9", [
    {
        "type": "section",
        "text": {
            "type": "plain_text",
            "text": `Last question: at undercity, what do you wish to build?`,
            "emoji": true
        }
    },
    {
        "type": "input",
        "element": {
            "type": "radio_buttons",
            "options": [
                {
                    "text": {
                        "type": "plain_text",
                        "text": `Something fun`,
                        "emoji": true
                    },
                    "value": "blue"
                },
                {
                    "text": {
                        "type": "plain_text",
                        "text": `Something cool`,
                        "emoji": true
                    },
                    "value": "yellow"
                },
                {
                    "text": {
                        "type": "plain_text",
                        "text": `Something useful`,
                        "emoji": true
                    },
                    "value": "red"
                }
            ],
            action_id: 'q'
        },
        label: {
            type: 'plain_text',
            text: 'What do you wish to build?',
            emoji: true
        },
        block_id: 'question'
    },
    {
        type: 'actions',
        elements: [
            {
                type: 'button',
                text: {
                    type: 'plain_text',
                    text: 'Next',
                    emoji: true
                },
                action_id: '10'
            }
        ]
    }
]);

/*
You blink, and Undercity is right in front of you. The Cerberus appears once more, and a single head welcomes you.

[image 4: split 3 where diff head addresses you depending on your guild]

---

:cerb-blue:: Hey! You! Yeah, you! [Y/N]! Congrats on joining us~ you'll be hanging out here with us in Club Cobalt! ٩(^ᗜ^ )و ´ We're the Blue Guild - It’s sosososo cool that you’re here, we can’t wait to see what stuff you make!!! I’m sure it’ll be awesome ദ്ദി(˵ •̀ ᴗ - ˵ ) ✧

:cerb-blue:: Oh! You wanna chill? Nahhh, rest later - let’s go celebrate instead!! I got cake for ya, hurry before I eat it all 🤩🤩

Welcome to the Blue Guild! You’re fun, you’re creative, you’re sparkly. Sometimes, you move a little too quick, but you’re never stuck doing the same thing twice. Fast iteration is the name of the game, and as far as anyone’s concerned, you’re winning.

---

:cerb-red:: Hello? [Y/N]? I’m here to give you a warm welcome to us and the Agate Allies here, I hope you have a good time with you and your new friends. Your projects are simply magnificent and we cannot wait to see what you do next.

:cerb-red:: Oh dear, you look exhausted. Come with me and I’ll get you all the stuff you need, Agate is here for you always!

Welcome to the Red Guild! You’re cool, you’re creative, you get things done. Sometimes, your creations are messy, but if they work, they work. It’s imperfect, but that’s what makes us human. You put your soul into your creations, and in turn, they appear alive. 

:cerb-yellow:: [Y/N]. Hi there. Welcome to the Sulfur Society. Feel free to take a look around here; you're stuck with me for the meantime. Though I gotta say, those projects of yours? I like em. Plenty practical. 

:cerb-yellow:: Hm? You’re tired? Ohhh yeah, you’re definitely plenty roughed up. Let’s go in and get you some rest. Welcome again.

Welcome to the Yellow Guild! You’re practical, you’re useful, [word]. Sometimes, you’re too focused on the details and mechanisms of a project, but they always turn out intricate. You make for a better world, both for yourself and others. 
*/
app.action("10", async ({ body, ack }) => {
    await ack();

    const values = (body as any).state.values;

    let user = await prisma.user.findUnique({
        where: {
            slackId: body.user.id
        }
    });

    if (!user || user.flowStep !== 10) {
        console.log("User not found or flow step mismatch");
        console.log(user?.flowStep, 10);

        await app.client.chat.postEphemeral({
            channel: body.user.id,
            text: "lol you already answered this",
            user: body.user.id
        });

        return;
    }

    if (values && values.question && values.question.q) {
        const guild = values.question.q.value;

        await prisma.user.update({
            where: {
                slackId: body.user.id
            },
            data: {
                flowStep: 11,
                red: { increment: guild === "red" ? 1 : 0 },
                blue: { increment: guild === "blue" ? 1 : 0 },
                yellow: { increment: guild === "yellow" ? 1 : 0 }
            }
        });
    } else {
        await prisma.user.update({
            where: {
                slackId: body.user.id
            },
            data: {
                flowStep: 11
            }
        });
    }

    user = await prisma.user.findUniqueOrThrow({
        where: {
            slackId: body.user.id
        }
    });


    let blocks: AnyBlock[] = [
        // You blink, and Undercity is right in front of you. The Cerberus appears once more, and a single head welcomes you.
        {
            type: "section",
            text: {
                type: "plain_text",
                text: `You blink, and Undercity is right in front of you. The Cerberus appears once more, and a single head welcomes you.`,
                emoji: true
            }
        }
    ];

    if (user.blue >= user.red && user.blue >= user.yellow) {
        /*
        :cerb-blue:: Hey! You! Yeah, you! [Y/N]! Congrats on joining us~ you'll be hanging out here with us in Club Cobalt! ٩(^ᗜ^ )و ´ We're the Blue Guild - It’s sosososo cool that you’re here, we can’t wait to see what stuff you make!!! I’m sure it’ll be awesome ദ്ദി(˵ •̀ ᴗ - ˵ ) ✧

        :cerb-blue:: Oh! You wanna chill? Nahhh, rest later - let’s go celebrate instead!! I got cake for ya, hurry before I eat it all 🤩🤩

        Welcome to the Blue Guild! You’re fun, you’re creative, you’re sparkly. Sometimes, you move a little too quick, but you’re never stuck doing the same thing twice. Fast iteration is the name of the game, and as far as anyone’s concerned, you’re winning.
        */
        blocks.push({
            type: "section",
            text: {
                type: "plain_text",
                text: `:cerb-blue:: Hey! You! Yeah, you, <@${user.slackId}>! Congrats on joining us~ you'll be hanging out here with us in Club Cobalt! ٩(^ᗜ^ )و ´ We're the Blue Guild - It’s sosososo cool that you’re here, we can’t wait to see what stuff you make!!! I’m sure it’ll be awesome ദ്ദി(˵ •̀ ᴗ - ˵ ) ✧`,
                emoji: true
            }
        }, {
            type: "section",
            text: {
                type: "plain_text",
                text: `:cerb-blue:: Oh! You wanna chill? Nahhh, rest later - let’s go celebrate instead!! I got cake for ya, hurry before I eat it all 🤩🤩`,
                emoji: true
            }
        }, {
            type: "section",
            text: {
                type: "plain_text",
                text: `Welcome to the Blue Guild! You’re fun, you’re creative, you’re sparkly. Sometimes, you move a little too quick, but you’re never stuck doing the same thing twice. Fast iteration is the name of the game, and as far as anyone’s concerned, you’re winning.`,
                emoji: true
            }
        });

        await addGuild(body.user.id, "blue");
    } else if (user.red >= user.blue && user.red >= user.yellow) {
        /*
        :cerb-red:: Hello? [Y/N]? I’m here to give you a warm welcome to us and the Agate Allies here, I hope you have a good time with you and your new friends. Your projects are simply magnificent and we cannot wait to see what you do next.

        :cerb-red:: Oh dear, you look exhausted. Come with me and I’ll get you all the stuff you need, Agate is here for you always!

        Welcome to the Red Guild! You’re cool, you’re creative, you get things done. Sometimes, your creations are messy, but if they work, they work. It’s imperfect, but that’s what makes us human. You put your soul into your creations, and in turn, they appear alive.
        */
        blocks.push({
            type: "section",
            text: {
                type: "plain_text",
                text: `:cerb-red:: Hello? <@${user.slackId}>? I’m here to give you a warm welcome to us and the Agate Allies here, I hope you have a good time with you and your new friends. Your projects are simply magnificent and we cannot wait to see what you do next.`,
                emoji: true
            }
        }, {
            type: "section",
            text: {
                type: "plain_text",
                text: `:cerb-red:: Oh dear, you look exhausted. Come with me and I’ll get you all the stuff you need, Agate is here for you always!`,
                emoji: true
            }
        }, {
            type: "section",
            text: {
                type: "plain_text",
                text: `Welcome to the Red Guild! You’re cool, you’re creative, you
get things done. Sometimes, your creations are messy, but if they work, they work. It’s imperfect, but that’s what makes us human. You put your soul into your creations, and in turn, they appear alive.`,
                emoji: true
            }
        });

        await addGuild(body.user.id, "red");
    } else {
        /*
        :cerb-yellow:: [Y/N]. Hi there. Welcome to the Sulfur Society. Feel free to take a look around here; you're stuck with me for the meantime. Though I gotta say, those projects of yours? I like em. Plenty practical. 

        :cerb-yellow:: Hm? You’re tired? Ohhh yeah, you’re definitely plenty roughed up. Let’s go in and get you some rest. Welcome again.

        Welcome to the Yellow Guild! You’re practical, you’re useful, [word]. Sometimes, you’re too focused on the details and mechanisms of a project, but they always turn out intricate. You make for a better world, both for yourself and others.
        */
        blocks.push({
            type: "section",
            text: {
                type: "plain_text",
                text: `:cerb-yellow:: <@${user.slackId}>. Hi there. Welcome to the Sulfur Society. Feel free to take a look around here; you're stuck with me for the meantime. Though I gotta say, those projects of yours? I like em. Plenty practical.`,
                emoji: true
            }
        }, {
            type: "section",
            text: {
                type: "plain_text",
                text: `:cerb-yellow:: Hm? You’re tired? Ohhh yeah, you’re definitely plenty roughed up. Let’s go in and get you some rest. Welcome again.`,
                emoji: true
            }
        }, {
            type: "section",
            text: {
                type: "plain_text",
                text: `Welcome to the Yellow Guild! You’re practical, you’re useful, <@${user.slackId}>. Sometimes, you’re too focused on the details and mechanisms of a project, but they always turn out intricate. You make for a better world, both for yourself and others.`,
                emoji: true
            }
        });

        await addGuild(body.user.id, "yellow");
    }

    await app.client.chat.postMessage({
        channel: body.user.id,
        blocks
    });


    //logic to add user to channel goes here
});