import {App, JsonFileTokenStore, start, V1} from "pumble-sdk";
import Option = V1.Option;
import {
  sendMessageWithButtons,
  sendMessageWithSelectMenu,
  sendMessageWithDynamicSelectMenu,
  openModalOnGlobalShortcut,
  sendAttachmentMessage,
  openInfoModal,
  updateModal,
  createBasicHomeView
} from "./helper";

const addon: App = {
  dynamicMenus: [
    {
      onAction: "dynamic_select_menu_action",
      producer: async (ctx) => {
        console.log('Dynamic select menu options called ', ctx.payload);
        return [
          {text: {type: "plain_text", text: "First"}, value: "1"},
          {text: {type: "plain_text", text: "Second"}, value: "2"},
          {text: {type: "plain_text", text: "Third"}, value: "3"}
        ].filter(op => !ctx.payload.query ||
            op.text.text.toLowerCase().includes(ctx.payload.query.toLowerCase()) ||
            op.value.toLowerCase().includes(ctx.payload.query.toLowerCase())) as Option[];
      }
    }
  ],
  blockInteraction: {
    interactions: [
      {
        sourceType: "MESSAGE",
        handlers: {
          bttn_1_action: async (ctx) => {
            await ctx.ack();
            await ctx.say("Button 1 pressed", "ephemeral");
          },
          bttn_2_action: async (ctx) => {
            await ctx.ack();
            await ctx.say("Button 2 pressed", "ephemeral");
          },
          static_select_menu_action: async (ctx) => {
            await ctx.ack();
            const selectMenuData = JSON.parse(ctx.payload.payload);
            await ctx.say(`Selected: ${selectMenuData.value}`, "ephemeral");
          },
          dynamic_select_menu_action: async (ctx) => {
            await ctx.ack();
            const selectMenuData = JSON.parse(ctx.payload.payload);
            await ctx.say(`Dynamic option selected ${selectMenuData.value} by user ${ctx.payload.userId}`, "ephemeral");
          },
        }
      },
      {
        sourceType: 'VIEW',
        handlers: {
          static_select_menu_input_action: async (ctx) => {
            await ctx.ack();
            console.log("Static select from input in modal triggered");
          },
          second_select_menu_modal: async (ctx) => {
            // no need to call ctx.ack when updating modal
            await updateModal(ctx);
          },
          info_btn_action: async (ctx) => {
            // no need to call ctx.ack when spawning new modal
            await openInfoModal(ctx);
          },
          input_text_1: async (ctx) => {
            await ctx.ack();
            console.log(`Input entered ${ctx.payload.payload}`);
          }
        },
      }]
  },
  viewAction: {
    onSubmit: {
      modal_callback_id_1: async (ctx) => {
        await ctx.ack();
        // block needs to be wrapped with block of type = "input" in order to be available in a view state
        // in our case only static_select_menu_input_action (that's inside input_static_1) is available
        console.log(`Modal submitted with state ${JSON.stringify(ctx.payload.view.state)}. Do whatever with it :)`);
      }
    },
    onClose: {
      modal_callback_id_1: async (ctx) => {
        await ctx.ack();
        console.log("Modal closed");
      }
    }
  },
  globalShortcuts: [
    {
      name: 'Open modal',
      description: 'Open interactive modal',
      handler: async (ctx) => openModalOnGlobalShortcut(ctx),
    }
  ],
  slashCommands: [
    {
      command: "/interactive-button-msg",
      handler:  async (ctx) => {
        await ctx.ack();
        await sendMessageWithButtons(ctx);
      }
    },
    {
      command: "/interactive-select-menu-msg",
      handler:  async (ctx) => {
        await ctx.ack();
        await sendMessageWithSelectMenu(ctx);
      }
    },
    {
      command: "/interactive-dynamic-menu-msg",
      handler:  async (ctx) => {
        await ctx.ack();
        await sendMessageWithDynamicSelectMenu(ctx);
      }
    },
    {
      command: "/interactive-attachment-msg",
      handler: async (ctx) => {
        await ctx.ack();
        await sendAttachmentMessage(ctx);
      }
    }
  ],
  events: [],
  eventsPath: "/hook",
  redirect: { enable: true, path: "/redirect", onSuccess: async (result, req, res) => {
      if (result.botToken && result.botId && result.userId && addonManifestPromise) {
        setTimeout(async () => {
          try {
            const addonManifest = await addonManifestPromise;
            const botClient = await addonManifest.getBotClient(result.workspaceId);
            // publish addon home view when user authorizes
            botClient?.v1.app.publishHomeView(result.userId, createBasicHomeView());
          } catch (err) {
            console.error(err);
          }
        }, 3000);
      }
    }},
  tokenStore: new JsonFileTokenStore("tokens.json"),
};

const addonManifestPromise = start(addon);