import { mongoConnector } from "./clients/MongoConnector"
import { ADDON_APP_KEY, ADDON_CLIENT_ID, ADDON_CLIENT_SECRET, ADDON_LISTENER_PORT, ADDON_SIGNING_SECRET, MONGO_AUTH_COLLECTION_NAME, MONGO_DB_NAME } from "./config/config"
import { subscribedFeedService } from "./service/SubscribedFeedService"
import { contentFormatService } from "./service/ContentFormatService"
import { generateInfoPage } from "./utils/InfoPage"
import { App, MongoDbTokenStore, V1 } from "pumble-sdk"
import { SlashCommandContext } from "pumble-sdk/lib/core/types/contexts"
import { homeViewService } from "./service/HomeViewService"
import { Logger } from "./utils/Logger"
import {authService} from "./service/AuthService";
    
export const credentialsStore = new MongoDbTokenStore(
        mongoConnector.client,
        MONGO_DB_NAME,
        MONGO_AUTH_COLLECTION_NAME
)

const logger = Logger.getInstance("addon.ts");

const commandHandlers: Record<
    string,
    (context: SlashCommandContext) => Promise<void>
> = {
    list: (context) => subscribedFeedService.list(context),
    list_all: async (context) => {
        let client = await context.getUserClient();
        if (!client) {
            return context.say("Something went wrong. Try again.");
        }
        const workspaceFeeds = await subscribedFeedService.listAll(context.payload.workspaceId, context.payload.userId, client, true);
        return context.say(contentFormatService.listWorkspaceFeedsMessage(workspaceFeeds));
    },
    subscribe: async (context) => {
        const feedLink = context.payload.text.split(' ').map((x) => x.trim()).at(1);
        let client = await context.getUserClient();
        if (!client) {
            return context.say("Something went wrong. Try again.");
        }
        const message = await subscribedFeedService.subscribeToFeed(
            context.payload.workspaceId, 
            context.payload.userId, 
            context.payload.channelId, 
            client,
            feedLink
        )

        return context.say(message, 'ephemeral');
    },
    remove: async (context) => {
        let client = await context.getUserClient();
        if (!client) {
            return context.say("Something went wrong. Try again.");
        }

        const message = await subscribedFeedService.remove(
            context.payload.workspaceId, 
            context.payload.userId, 
            context.payload.channelId, 
            context.payload.text.split(' ').map((x) => x.trim()).at(1),
            client
        );

        return context.say(message, 'ephemeral');
    },
    help: (context) =>  context.say(contentFormatService.helpMessage())
};

async function isAuthorized(evt: SlashCommandContext) {
    const client = await evt.getUserClient(evt.payload.userId);

    if (!client) {
        return false;
    }

    try {
        await client.v1.users.getProfile();
        return true;
    } catch (err) {
        return false;
    }
}

export const addon: App = {
    globalShortcuts: [],
    messageShortcuts: [],
    slashCommands: [
      {
        command: "/feed",
        usageHint: "help [or subscribe, list, list_all, remove]",
        description: "Manage RSS subscriptions",
        handler: async (context) => {
            context.ack();

            const command = context.payload.text.split(' ').map((x) => x.trim()).at(0);
            const authorized = await isAuthorized(context);
        
            if (command && command in commandHandlers) {
                if (command !== "help") {
                    if (!authorized) {
                        await context.say("In order to use /feed please authorize the RSS feed app on the Configure Apps page. Click the 'Add Apps' button at the bottom of the left sidebar to open it.");
                        return;
                    }
                }
                await commandHandlers[command](context);
            } else {
                if (command?.match(/^(https?):\/\/[^\s$.?#].[^\s]*$/)) {
                    if (!authorized) {
                        await context.say("In order to use /feed please authorize the application in Workspace setting > Configure apps.");
                        return;
                    }
                    
                    let client = await context.getUserClient();
                    if (!client) {
                        return context.say("Something went wrong. Try again.");
                    }

                    const message = await subscribedFeedService.subscribeToFeed(
                        context.payload.workspaceId,
                        context.payload.userId,
                        context.payload.channelId,
                        client,
                        command
                    )
                    return context.say(message, 'ephemeral');
                }
        
                await context.say(contentFormatService.helpMessage());
            }
        },
      },
    ],
    blockInteraction: {
        interactions: [
            {
                sourceType: "VIEW",
                handlers: {
                    add_feed_btn_open_modal: async (ctx) => {
                        ctx.pushModalView(await contentFormatService.addFeedModal(ctx));
                    },
                    remove_feed_btn_open_modal: async (ctx) => {
                        ctx.pushModalView(await contentFormatService.removeFeedModal(ctx));
                    }
                }
            }
        ]
    },
    viewAction: {
        onSubmit: {
            modalAddFeedCallback: async (ctx) => {
                await ctx.ack();
                var channelId = value(ctx.payload.view.state?.values["choose_channel_dynamic_block"]["onChannelDynamicItemSelect"]);
                var feedUrl = value(ctx.payload.view.state?.values["add_feed_url_block"]["input_add_url_block"]);
                var client = await ctx.getUserClient();
                var botClient = await ctx.getBotClient();

                if (!client) {
                    console.log("Error - there is no bot client.");
                    return;
                }
                const message = await subscribedFeedService.subscribeToFeed(ctx.payload.workspaceId, ctx.payload.userId, channelId, client, feedUrl);

                if (channelId && botClient) {
                    botClient.v1.messages.postEphemeral(channelId, message, client.workspaceUserId);
                }
            },
            modalRemoveFeedCallback: async (ctx) => {
                await ctx.ack();
                const feedId = value(ctx.payload.view.state?.values["remove_feed_dynamic_block"]["onChannelFeedDynamicMenuItemGroupSelect"]);
                
                var client = await ctx.getUserClient();
                var botClient = await ctx.getBotClient();

                if (!client) {
                    console.log("Error - there is no bot client.");
                    return;
                }

                const result = await subscribedFeedService.removeById(ctx.payload.workspaceId, ctx.payload.userId, feedId, client);

                if (botClient && result && result.channelId && result.channelId.trim().length > 0) {
                    botClient.v1.messages.postEphemeral(result.channelId, result.message, client.workspaceUserId);
                }
            }
        },
        onClose: {
        }
    },
    dynamicMenus: [
        {
            onAction: "onChannelDynamicItemSelect",
            producer: async (ctx) => {
                const client = await ctx.getUserClient();
                const botClient = await ctx.getBotClient();
                if (!client || !botClient) {
                    return [{text: {type: "plain_text", "text": "Something went wrong. Try again."}, value: "1"}] as V1.Option[];
                }
                const userChannels = await subscribedFeedService.listEligibleChannels(
                    client.workspaceUserId,
                    botClient.workspaceUserId,
                    client
                );
                const options = await contentFormatService.mapChannelsToOptions(userChannels, ctx.payload.query);
                return options.slice(0, 60);
            }
        },
        {
            onAction: "onChannelFeedDynamicMenuItemGroupSelect",
            producer: async (ctx) => {
                const client = await ctx.getUserClient();
                if (!client) {
                    return [{text: {type: "plain_text", "text": "Sometnihg went wrong. Try again."}, value: "1"}] as V1.Option[];
                }

                const userFeeds = await subscribedFeedService.listAll(ctx.payload.workspaceId, ctx.payload.userId, client, false);

                const options = await contentFormatService.mapFeedsToOptionsGroups(userFeeds, ctx.payload.query);
                return options.slice(0, 60);
            }
        }
    ],
    redirect: {
        path: "/",
        enable: true,
        onSuccess: async (result, req, res) => {
            res.send(
                generateInfoPage(`RSS feed successfully connected.`)
            );
            const userClient = await authService.getClientFor(result.workspaceId, result.userId, result.accessToken);
            const workspaceFeeds = await subscribedFeedService.listAll(result.workspaceId, result.userId, userClient, false);
            await homeViewService.publishHomeView(workspaceFeeds, result.userId, userClient);
            if (result.botToken && result.botId) {
                const botClient = await authService.getClientFor(result.workspaceId, result.botId, result.botToken);
                setTimeout(
                    async () => await authService.sendWelcomeMessages(botClient, result.workspaceId, result.userId, botClient.workspaceUserId),
                    3000
                );
            }
        },
        onError: async (error, req, res) => {
            console.log(error)
            res.send();
        }
    },
    events: [
        {
            name: "APP_UNINSTALLED",
            handler: async (ctx) => {
                logger.info(`App is uninstalled on ${ctx.payload.workspaceId} workspace.`);
                await credentialsStore.deleteForWorkspace(ctx.payload.workspaceId);
            }
        },
        {
            name: "APP_UNAUTHORIZED",
            handler: async (ctx) => {
                logger.info(`Users ${ctx.payload.workspaceUserIds} unauthorized app on ${ctx.payload.workspaceId} workspace.`);
                ctx.payload.workspaceUserIds.forEach(async (user) => await credentialsStore.deleteForUser(user, ctx.payload.workspaceId));
            }
        }
    ],
    port: ADDON_LISTENER_PORT,
    tokenStore: credentialsStore,
    onServerConfiguring: async (express, addon1) => {
        express.get('/health', (req: any, res: any) => {
            res.send('Ok');
        });
    },
    clientSecret: ADDON_CLIENT_SECRET,
    appKey: ADDON_APP_KEY,
    signingSecret: ADDON_SIGNING_SECRET,
    id: ADDON_CLIENT_ID,
    helpUrl: "https://pumble.com/help/integrations/rss-integration/"
};

const value = (obj: any): string | undefined => {
    
    if (!!obj && 'value' in obj) {
        return obj.value;
    }
}