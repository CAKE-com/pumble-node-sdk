import { App, JsonFileTokenStore, start, V1 } from '../pumble-sdk/src';
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
    "botScopes": ["messages:read", "messages:write", "files:write"],
    "userScopes": ["messages:read, "files:write"]
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
                viewId: 'view-1',
                sourceType: 'VIEW',
                handlers: {
                    onClick1: async (ctx) => {
                        ctx.ack();
                        console.log(ctx);
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
            
                console.log('Received slash command!');
            },
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
