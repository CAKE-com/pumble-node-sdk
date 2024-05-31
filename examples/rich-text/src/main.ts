import { App, JsonFileTokenStore, start } from "pumble-sdk";

const addon: App = {
  globalShortcuts: [
    {
      name: "Global shortcut",
      handler: async (ctx) => {
        await ctx.ack();
        console.log("Received global shortcut!");
        await ctx.say("Received global shortcut!");
      },
    },
  ],
  messageShortcuts: [
    {
      name: "Attach something",
      handler: async (ctx) => {
        await ctx.ack();
        const message = await ctx.fetchMessage();
        const client = await ctx.getUserClient();
        if (message && client) {
          client?.v1.messages.editAttachments(message.id, message.channelId, [{
            color: "purple",
            author_name: "Developer",
            author_link: "https://github.com/CAKE-com/pumble-node-sdk",
            author_icon: "https://github.githubassets.com/assets/GitHub-Mark-ea2971cee799.png",
            title: "Pumble addon documentation",
            title_link: "https://cake-com.github.io/pumble-node-sdk/getting-started",
            fields: [{title: "Addon development", value: "Field 1", short: true}],
            footer: "CAKE-com/rich_text",
            footer_icon: "https://github.githubassets.com/assets/GitHub-Mark-ea2971cee799.png",
            ts: new Date().getTime()
          }])
        } else {
          await ctx.say("Error occurred");
        }
      },
    },
  ],
  slashCommands: [
    {
      command: "/send_rich_text_example",
      handler: async (ctx) => {
        await ctx.ack();
        await ctx.say({
          text: "fallback text",
          blocks: [{
            type: "rich_text",
            elements: [
              {
                type: "rich_text_section",
                elements: [
                  {type: "text", text: "This is my first rich text example with docs at "},
                  {type: "link", url: "https://cake-com.github.io/pumble-node-sdk/getting-started", text: "SDK docs "},
                  {type: "emoji", name: "tada"}
                ]
              }
            ]
          }]
        });
      },
    },
    {
      command: "/send_code_example",
      handler: async (ctx) => {
        await ctx.ack();
        await ctx.say({
          text: "fallback text",
          blocks: [{
            type: "rich_text",
            elements: [
              {
                type: "rich_text_preformatted",
                elements: [
                  {type: "text", text: "function main() { \n   console.log('Hello world!');\n}"}
                ]
              }
            ]
          }]
        }, 'in_channel');
      },
    },
    {
      command: "/send_list_example",
      handler: async (ctx) => {
        await ctx.ack();
        const client = await ctx.getUserClient();
        await client?.v1.messages.postMessageToChannel(ctx.payload.channelId, {
          text: "fallback text",
          blocks: [{
            type: "rich_text",
            elements: [
              {
                type: "rich_text_list",
                border: 1,
                indent: 1,
                style: "bullet",
                elements: [
                  {type: "rich_text_section", elements: [{type: "text", text: "API integration at "}, {type: "link", url: "https://pumble.com/help/integrations/add-pumble-apps/api-keys-integration/"}]},
                  {type: "rich_text_section", elements: [{type: "text", text: "GitHub integration at "}, {type: "link", url: "https://pumble.com/help/integrations/add-pumble-apps/github-integration/"}]},
                  {type: "rich_text_section", elements: [{type: "text", text: "Zapier integration at "}, {type: "link", url: "https://pumble.com/help/integrations/add-pumble-apps/zapier-integration/"}]}
                ]
              }
            ]
          }]
        });
      },
    }
  ],
  events: [
    {
      name: "NEW_MESSAGE",
      handler: (ctx) => {
        console.log("Received new message!", ctx.payload.body);
      },
    },
  ],
  eventsPath: "/hook",
  redirect: { enable: true, path: "/redirect" },
  tokenStore: new JsonFileTokenStore("tokens.json"),
};

start(addon);
