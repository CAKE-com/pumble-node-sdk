import { App, JsonFileTokenStore, start, V1 } from '../pumble-sdk/src';
import CreateScheduledMessageRequest = V1.CreateScheduledMessageRequest;
var mime = require('mime-types')
var path = require('path');
var fs = require('fs');

/*
Insert this value in manifest.json in the root of your project project
{
  "name": "example-1",
  "displayName": "Example 1",
  "botTitle": "Example 1 Bot",
  "bot": true,
  "scopes": {
    "botScopes": ["messages:read", "messages:write", "files:write", "messages:delete"],
    "userScopes": ["messages:read, "files:write", "messages:delete"]
  }
}
 */

const app: App = {
    dynamicMenus: [{
        onAction: "dropDown1",
        producer: async (ctx) => {
            return  [
                    {text: {type: "plain_text", text: "Option 1"}, value: "1"},
                    {text: {type: "plain_text", text: "Option 2"}, value: "2"}
                ]
            }

    }],
    blockInteraction: {
        interactions: [
            {
                sourceType: 'VIEW',
                handlers: {
                    onClick1: async (ctx) => {
                        const view = ctx.payload.view;
                        if (!view) {
                            return;
                        }
                        console.log(view);
                        const blocksToAdd: V1.MainBlock[] = [
                            {
                                type: "rich_text",
                                elements: [{
                                    type: "rich_text_section",
                                    elements: [{
                                        type: "text",
                                        text: "This is some additional text"
                                    }]
                                }]
                            },
                            {
                                type: "input",
                                blockId: "input_text_field_2",
                                label: {
                                    type: "plain_text",
                                    text: "Additional input field"
                                },
                                dispatchAction: true,
                                optional: true,
                                element: {
                                    type: "plain_text_input",
                                    onAction: "input_text_2",
                                    placeholder: {
                                        type: "plain_text",
                                        text: "Type something"
                                    },
                                    interaction_triggers: ["on_input"]
                                },
                            }
                        ];

                        const updatedView = ctx.viewBuilder(view)
                            .insertBlocksAt(1, blocksToAdd)
                            .updateTitle({ type: 'plain_text', text: 'Updated modal' })
                            .removeBlockAt(0)
                            .updateNotifyOnClose(false)
                            .updateCallbackId('otherViewCallback')
                            .updateSubmit({ type: 'plain_text', text: 'New submit button' })
                            .removeClose()
                            .updateState({
                                values: {
                                    input_static_1: {
                                        ssm1: {
                                            type: 'static_select_menu',
                                            value: '2'
                                        }
                                    }
                                }
                            })
                            .build();
                        await ctx.updateView({...updatedView, notifyOnClose: false});
                    },
                },
            },
            {
                sourceType: 'MESSAGE',
                handlers: {
                    onClickAnything: async (ctx) => {
                        ctx.ack();
                        console.log(ctx);
                    },
                },
            },
            {
                sourceType: 'EPHEMERAL_MESSAGE',
                handlers: {
                    onClickk: (ctx) => {
                        ctx.ack();
                        console.log(ctx);
                    },
                },
            },
        ],
    },
    viewAction: {
        onSubmit: {
            view1Callback: async (ctx) => {
                await ctx.ack();
                console.log("View submitted");
            },
            otherViewCallback: async (ctx) => {
                await ctx.ack();
                console.log(`Other view submitted: ${ctx.viewId}`);
                // do whatever
            }
        },
        onClose: {
            view1Callback: async (ctx) => {
                await ctx.ack();
                console.log("View closed");
            }
        }
    },
    slashCommands: [
        {
            command: '/all_messages_1',
            description: 'Slash command description',
            usageHint: 'Slash usage hint',
            handler: async (ctx) => {
                console.log('OK');
                await ctx.ack();
                const client = await ctx.getUserClient();
                if (client) {
                    const result = await client.v1.messages.postMessageToChannel(ctx.payload.channelId, {
                        text: 'hello',
                        blocks: [
                            {
                                type: 'rich_text',
                                elements: [
                                    {
                                        type: 'rich_text_section',
                                        elements: [{type: 'link', url: 'https://example.com'}],
                                    },
                                ],
                            },
                            {
                                type: "actions",
                                elements: [{
                                    type: "dynamic_select_menu",
                                    min_query_length: 3,
                                    onAction: "dropDown1",
                                    placeholder: {text: "Select something", type: "plain_text"}
                                }]
                            }
                        ],
                    });
                    await ctx.say(
                        JSON.stringify({
                            tx: result.text,
                            aid: result.author,
                            cid: result.channelId,
                        })
                    );
                }
                console.log('Received slash command!');
            },
        },
        {
            command: '/slash_2',
            handler: async (ctx) => {
                await ctx.ack();
                console.log('Received slash command!');
            },
        },
        {
            command: '/slash_3',
            handler: async (ctx) => {
                await ctx.ack();
                const client = await ctx.getUserClient();  
                if (client) {
                    try {
                        const filePath = "./fileupload/example.jpg";     
                        const files: V1.FileToUpload[] = []; 
                        files.push({input: filePath})

                        const fileBuffer = fs.readFileSync(filePath);
                        const mimeType = mime.lookup(filePath);
                        const name = path.parse(filePath).base;
                        files.push({input: fileBuffer, options: {name: name, mimeType: mimeType}});

                        const blob = new Blob([fileBuffer], {type: mimeType});
                        files.push({input: blob, options: {name: name, mimeType: mimeType}});

                        const message = await client.v1.messages.postMessageToChannel(ctx.payload.channelId, {
                            text: "File in message",
                            files: files
                        })
                    } catch(e) {
                        console.log(e)
                    }
                }
            }
        },
        {
            command: '/slash_4',
            handler: async (ctx) => {
                await ctx.ack();
                const client = await ctx.getUserClient();

                if (client) {
                    const ephemeralMessage = await client.v1.messages.postEphemeral(ctx.payload.channelId, {text: "Test ephemeral message"}, ctx.payload.userId);
                    client.v1.messages.editEphemeralMessage(ephemeralMessage.id, ephemeralMessage.channelId, {text: "Edited ephemeral message.", ephemeral: {sendToUsers: [ctx.payload.userId]}})
                }
                console.log('Received slash command!');
            },
        },
        {
            command: '/slash_5',
            handler: async (ctx) => {
                await ctx.ack();
                const client = await ctx.getUserClient();

                const commandParts = ctx.payload.text.split(' ').map((x) => x.trim());
                const messageId: string|null = commandParts?.at(0) ? commandParts?.at(0) as string : null

                if (!messageId) {
                    return;
                }

                if (client) {
                    client.v1.messages.deleteEphemeralMessage(messageId, ctx.payload.channelId, {deleteForUsers: [ctx.payload.userId]})
                }
                console.log('Finished slash command 5!');
            },
        },
        {
            command: '/slash_6',
            handler: async (ctx) => {
                await ctx.ack();
                const client = await ctx.getUserClient();

                let userGroups = await  client!.v1.users.listUserGroups();

                console.log('user groups : ', userGroups);

                console.log('Finished slash command 5!');
            },
        },
        {
            command: '/slash_7',
            usageHint: 'file_name file_path',
            handler: async (ctx) => {
                await ctx.ack();
                const client = await ctx.getUserClient();
                const commandParts = ctx.payload.text.split(' ').map((x) => x.trim());
                const fileName = commandParts[0];
                const fileUrl = commandParts[1];
                if (fileName && fileUrl) {
                    const fileStream = await client!.v1.files.fetchFile(fileUrl);
                    const writer = fs.createWriteStream(`./files/${fileName}`);
                    fileStream.pipe(writer);
                    await ctx.say('File downloaded successfully.');
                }
            }
        },
        {
            command: '/slash_8',
            usageHint: 'message text',
            handler: async (ctx) => {
                await ctx.ack();
                const client = await ctx.getUserClient();
                const scheduledMessageRequest: CreateScheduledMessageRequest = {
                    channelId: ctx.payload.channelId,
                    text: ctx.payload.text,
                    sendAt: Date.now() + 10000,
                    recurrence: {
                        recurrenceType: 'DAILY'
                    },
                    attachments: [{
                        color: 'green',
                        title: 'Attachment',
                        text: 'Attachment text'
                    }]
                }
                const scheduledMessage = await client?.v1.messages.createScheduledMessage(scheduledMessageRequest);
                if (scheduledMessage) {
                    await ctx.say(`Created scheduled message with id ${scheduledMessage.id}`)
                }
            }
        },
        {
            command: '/slash_9',
            handler: async (ctx) => {
                await ctx.ack();
                const client = await ctx.getBotClient();
                if (!client) {
                    return;
                }
                const payload: V1.PublishHomeViewRequest = {
                    title: { type: "plain_text", text: "Playground addon" },
                    blocks: [
                        {
                            type: "rich_text",
                            elements: [{
                                type: "rich_text_section",
                                elements: [{
                                    type: "text",
                                    text: "Hello"
                                }]
                            }]
                        },
                        {
                            type: "actions",
                            elements: [
                                {
                                    type: "button",
                                    text: {type: "plain_text", text: "Click here"}, onAction: "onClick1"
                                }
                            ]
                        }
                    ]
                }
                await client.v1.app.publishHomeView(ctx.payload.userId, payload)
            }
        },
    ],
    globalShortcuts: [
        {
            name: 'Global 1',
            description: 'test',
            handler: async (ctx) => {
                await ctx.ack();
                console.log('Received global shortcut');
            },
        },
        {
            name: 'GDrive Modal',
            description: 'spawn google drive modal',
            handler: async (ctx) => {
                await ctx.spawnModalView({
                    googleAccessToken: 'accessToken',
                    googleAppId: 'appId',
                    googleApiKey: 'apiKey',
                    googleClientId: 'clientId'
                });
            }
        },
        {
            name: 'Native Modal',
            description: 'spawn native modal',
            handler: async (ctx) => {
                await ctx.spawnModalView({
                    callbackId: "view1Callback",
                    type: "MODAL",
                    submit: {type: "plain_text", text: "Submit"},
                    title: {type: "plain_text", text: "Title"},
                    close: {type: "plain_text", text: "Close"},
                    notifyOnClose: true,
                    state: {
                        values: {
                            input_static_1: {
                                ssm1: {
                                    type: 'static_select_menu',
                                    value: '1'
                                }
                            }
                        }
                    },
                    blocks: [
                        {
                            type: "rich_text",
                            elements: [{
                                type: "rich_text_section",
                                elements: [{type: "text", text: "Really cool view content"}]
                            }]
                        },
                        {
                            type: "input",
                            blockId: "input_static_1",
                            label: {text: "Input static menu", type: "plain_text"},
                            element: {
                                type: "static_select_menu",
                                placeholder: {text: "text", type: "plain_text"},
                                onAction: "ssm1",
                                options: [
                                    {text: {type: "plain_text", text: "Option 1"}, value: "1"},
                                    {text: {type: "plain_text", text: "Option 2"}, value: "2"}
                                ]
                            },
                            dispatchAction: true
                        },
                        {
                            type: "actions",
                            elements: [
                                {type: "button", text: {type: "plain_text", text: "BTN"}, onAction: "onClick1"},
                                {type: "plain_text_input", onAction: "input_text_1"}
                            ]
                        }
                    ],
                });
            }
        }
    ],
    messageShortcuts: [
        {
            name: 'Message',
            description: 'test message shortcut 22',
            handler: async (ctx) => {
                await ctx.ack();
                console.log('Received message shortcut');
            },
        },
        {
            name: 'Message 22',
            description: 'test message shortcut',
            handler: async (ctx) => {
                await ctx.ack();
                console.log('Received message shortcut');
            },
        },
    ],
    events: [
        {
            name: 'APP_UNAUTHORIZED',
            handler: (ctx) => {
                console.log('OK');
            },
        },
        {
            name: 'REACTION_ADDED',
            options: {match: ':robot_face:'},
            handler: async (ctx) => {
                await ctx.say('RECEIVED ROBOT FACE');
            },
        },
        {
            name: 'REACTION_ADDED',
            options: {match: ':beetle:'},
            handler: async (ctx) => {
                await ctx.say('RECEIVED BEETLE');
            },
        },
        {
            name: 'NEW_MESSAGE',
            options: {includeBotMessages: false, match: /^test/},
            handler: async (ctx) => {
                console.log('Received message', ctx.payload.body.mId);
                await ctx.say('received it', 'in_channel', true);
            },
        },
        {
            name: 'NEW_MESSAGE',
            handler: (ctx) => {
                console.log('RECEIVED MESSAGE');
            },
        },
        {
            name: 'UPDATED_MESSAGE',
            options: {includeBotMessages: false, match: /^test/},
            handler: async (ctx) => {
                console.log('Updated message', ctx.payload.body.mId);
                await ctx.say('updated it', 'in_channel', true);
            }
        }
    ],
    onServerConfiguring: (e, addon) => {
    },
    tokenStore: new JsonFileTokenStore('tokens.json'),
    listingUrl: 'https://listing.com',
    helpUrl: 'https://help.com',
    welcomeMessage: 'Hello',
    offlineMessage: 'Demo app cannot respond at this moment. Please try again later',
};

async function main() {
    const addon = await start(app);
}

main();
