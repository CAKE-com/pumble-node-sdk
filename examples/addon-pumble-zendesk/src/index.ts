import { Addon, AddonManifest, App, MongoDbTokenStore, start, V1 } from 'pumble-sdk';
import bodyParser from 'body-parser';
import { initMongoConnector, mongoConnector } from './mongo/MongoConnector';
import {logger} from "./utils/Logger";
import {CryptoUtils} from "./utils/CryptoUtils";
import {authService} from "./service/AuthService";
import {ticketService} from "./service/TicketService";
import {webhookService} from "./service/WebhookService";
import {webhookRepositoryMongo} from "./mongo/WebhookRepositoryMongo";
import {commandsAdapter} from "./adapter/CommandsAdapter";
import {IntegrationError} from "./types";
import cron from 'node-cron';
import {MessageFormatter} from "./utils/MessageFormatter";
import Option = V1.Option;
import {migrationsService} from "./migrations/MigrationsService";
import { MONGO_DB_NAME } from './config/config';
import { generateInfoPage } from './utils/InfoPage';
import {generateRedirectUrl, isAlphanumeric, validateSubdomain, value} from './utils/utils';
import { homeViewService } from './service/HomeViewService';
import { FILTER_FIELD_NAME } from './utils/constants';

const addon: App = {
  viewAction: {
    onSubmit: {
      createTicket: async (ctx) => {
        await ctx.ack();
        const subject = ctx.payload.view.state?.values["subject"]?.["subject"];
        const description = ctx.payload.view.state?.values["description"]?.["description"];
        const assignee = ctx.payload.view.state?.values["assignee"]?.["assignee"];
        const requester = ctx.payload.view.state?.values["requester"]?.["requester"];
        const auth = await authService.getAuth(ctx.payload.workspaceId, ctx.payload.userId);
        if (auth) {
          const client = await ctx.getBotClient();
          const assigneeVal = value(assignee);
          const requesterVal = value(requester);
          let requesterUser = requesterVal ? await client?.v1.users.userInfo(requesterVal) : undefined;
          const ticket = await ticketService.createZendeskTicket(auth,
              value(subject) ?? "",
              value(description) ?? "",
              assigneeVal ? +assigneeVal : undefined,
              requesterUser ? { name: requesterUser.name, email: requesterUser.email } : undefined);

          if (ctx.payload.channelId) {
            if (ticket) {
              const user = await client?.v1.users.userInfo(ctx.payload.userId);
              const subbedChannels = await ticketService.getSubbedChannelsWithNames(ctx.payload.workspaceId, ctx.payload.userId, await ctx.getUserClient());
              if (!subbedChannels || subbedChannels.length === 0) {
                let ticketDetails = await ticketService.extractTicketDetails(ctx.payload.workspaceId,
                    +ticket.group_id,
                    +ticket.assignee_id,
                    +ticket.requester_id, auth);
                client?.v1.messages.dmUser(ctx.payload.userId, MessageFormatter.buildTicketMessage("A ticket has been created :tada:", ticket, user!, auth.subdomain, ticketDetails?.group, ticketDetails?.assignee, ticketDetails?.requester));
              }
            } else {
              client?.v1.messages.postEphemeral(ctx.payload.channelId, "Ticket was not created due to an error", ctx.payload.userId);
            }
          }
        }
      },
      connectOrg: async (ctx) => {
        let subdomain = value(ctx.payload.view.state?.values["subdomain"]?.["subdomain"]);
        if (subdomain) {
          subdomain = subdomain.split(".zendesk.com")[0].replace("https://", "").replace("http://", "");
          validateSubdomain(subdomain);
          await ctx.spawnModalView({
            type: "MODAL",
            parentViewId: ctx.payload.view?.id,
            callbackId: "dummy",
            title: { type: "plain_text", text: "Connect account" },
            notifyOnClose: false,
            blocks: MessageFormatter.generateConnectOrgLinkModalMessage("Confirm the connection to your Zendesk account by clicking Connect.",
                generateRedirectUrl(subdomain, ctx.payload.workspaceId, ctx.payload.userId))
          });
        }
      },
      subscribeChannel: async (ctx) => {
        await ctx.ack();
        const auth = await authService.getAuth(ctx.payload.workspaceId, ctx.payload.userId);
        if (!auth || !auth.subdomain) {
          logger.error(`No auth found on sub channel action! ${ctx.payload.userId}`);
          return;
        }

        const channelId = value(ctx.payload.view.state?.values["channelId"]?.["dynamic_select_channel"]);
        if (!channelId) {
          return;
        }
        const userClient = await ctx.getUserClient();
        if (!userClient) {
          logger.error("No user client found on subscribe channel action!");
          return;
        }
        const channel = await userClient.v1.channels.getChannelDetails(channelId);

        let filters = [];
        for (let i = 1; i < 4; i++) {
          const filterField = value(ctx.payload.view.state?.values[`${FILTER_FIELD_NAME}${i}`]?.[FILTER_FIELD_NAME]);
          if (filterField) {
            filters.push(filterField);
          }
        }
        await ticketService.subscribeChannelToTickets(auth.subdomain, ctx.payload.workspaceId, ctx.payload.userId, channel, await ctx.getBotClient(), filters.length > 0 ? filters.join(", ") : undefined);
      },
      removeSubscription: async (ctx) => {
        await ctx.ack();
        const auth = await authService.getAuth(ctx.payload.workspaceId, ctx.payload.userId);
        if (!auth) {
          logger.error(`No auth or organizationId found on remove channel sub action! ${ctx.payload.userId}`);
          return;
        }
        const channelId = value(ctx.payload.view.state?.values["channelId"]?.["select_channel_unsubscribe"]);
        const userClient = await ctx.getUserClient();
        if (!userClient || !channelId) {
          logger.error(`No user client or channelId found on remove channel sub action! ${channelId}`);
          return;
        }
        const channel = await userClient.v1.channels.getChannelDetails(channelId);
        await ticketService.unsubscribeChannelFromTickets(auth.subdomain, ctx.payload.workspaceId, ctx.payload.userId, channel, await ctx.getBotClient());
      },
    },
    onClose: {}
  },
  dynamicMenus: [{
    onAction: "assignee",
    producer: async (ctx) => {
      const auth = await authService.getAuth(ctx.payload.workspaceId, ctx.payload.userId);
      if (!auth) {
        return [];
      }
      const users = await authService.getZendeskUsersDetails(auth);
      return users.users
          .filter(u => !ctx.payload.query || u.name.toLowerCase().includes(ctx.payload.query))
          .map(u => {
            return { text: { type: "plain_text", text: u.name }, value: u.id } as Option
          });
    }
  }, {
    onAction: "requester",
    producer: async (ctx) => {
      const client = await ctx.getUserClient(ctx.payload.userId);
      if (!client) {
        return [];
      }
      const users = await client.v1.users.listWorkspaceUsers();
      return users
          .filter(u => u.status === "ACTIVATED" && !u.isPumbleBot && !u.isAddonBot && (!ctx.payload.query || u.name.toLowerCase().includes(ctx.payload.query.toLowerCase())))
          .map(u => {
            return { text: { type: "plain_text", text: u.name }, value: u.id } as Option
          }).slice(0, 100);
    }
  },
    {
      onAction: "dynamic_select_channel",
      producer: async (ctx) => {
        const client = await ctx.getUserClient();
        if (!client) {
          return [{
            text: { type: "plain_text", "text": "Something went wrong. Try again." },
            value: "1"
          }] as V1.Option[];
        }

        const channels = await client.v1.channels.listChannels(["PUBLIC", "PRIVATE"]);
        const userChannels = channels.filter(channel => channel.users?.includes(ctx.payload.userId) && !channel.channel.isArchived);
        return userChannels.map(channel => {
          return {
            text: { type: "plain_text", text: `${channel.channel.name?.slice(0, 75)}` },
            value: channel.channel.id.toString()
          }
        }).filter(op => !ctx.payload.query ||
            op.text.text.toLowerCase().includes(ctx.payload.query.toLowerCase()) ||
            op.value.toLowerCase().includes(ctx.payload.query.toLowerCase())).slice(0, 100) as V1.Option[];
      }
    },
    {
      onAction: FILTER_FIELD_NAME,
      producer: async (ctx) => {
        const auth = await authService.getAuth(ctx.payload.workspaceId, ctx.payload.userId);
        if (!auth) {
          return [];
        }
        return await ticketService.getTicketFieldsListNested(auth, ctx.payload.query);
      }
    }
  ],
  globalShortcuts: [
    {
      name: "Create Zendesk ticket",
      handler: async (ctx) => {
        const success = await commandsAdapter.handleAuthorizationAndErrors(async (context, auth) => {
          await ctx.spawnModalView({
            type: "MODAL",
            blocks: MessageFormatter.createTicketModalContent(auth),
            title: { type: "plain_text", text: "Create Zendesk ticket" },
            submit: { type: "plain_text", text: "Create" },
            close: { type: "plain_text", text: "Close" },
            notifyOnClose: false,
            callbackId: "createTicket"
          });
        }, ctx);
        if (!success) {
          await ctx.ack();
        }
      },
    },
  ],
  slashCommands: [
    {
      command: "/zendesk",
      description: "/zendesk [connect/disconnect {subdomain}] [subscribe/unsubscribe]",
      handler: async (ctx) => {
        await ctx.ack();
        try {
          await commandsAdapter.handle(ctx);
        } catch (e) {
          if (e instanceof IntegrationError) {
            await ctx.say(e.errorMessage, "ephemeral");
          } else {
            logger.error("Command failed due to error", e);
            await ctx.say("Command failed due to unknown error", "ephemeral");
          }
        }
      }
    },
  ],
  blockInteraction: {
    interactions:
        [{
          sourceType: "VIEW",
          handlers: {
            add_org_btn_open_modal: async (ctx) => {
              await ctx.pushModalView({
                type: "MODAL",
                parentViewId: ctx.payload.view?.id,
                callbackId: "connectOrg",
                title: { type: "plain_text", text: "Connect account" },
                notifyOnClose: false,
                close: { type: "plain_text", text: "Cancel" },
                submit: { type: "plain_text", text: "Connect" },
                blocks: MessageFormatter.generateConnectOrgView()
              });
            },
            remove_org_btn_open_modal: async (ctx) => {
              await ctx.ack();
              await authService.deleteAuth(ctx.payload.workspaceId, ctx.payload.userId, await ctx.getBotClient());
            },
            create_ticket_bttn: async (ctx) => {
              const auth = await authService.getAuth(ctx.payload.workspaceId, ctx.payload.userId);
              if (!auth) {
                return;
              }
              await ctx.pushModalView({
                parentViewId: ctx.payload.view?.id,
                type: "MODAL",
                blocks: MessageFormatter.createTicketModalContent(auth),
                title: { type: "plain_text", text: "Create Zendesk ticket" },
                submit: { type: "plain_text", text: "Create" },
                close: { type: "plain_text", text: "Close" },
                notifyOnClose: false,
                callbackId: "createTicket"
              });
            },
            add_sub_btn_open_modal: async (ctx) => {
              await ctx.pushModalView({
                type: "MODAL",
                parentViewId: ctx.payload.view?.id,
                callbackId: "subscribeChannel",
                title: { type: "plain_text", text: "Subscribe channel to ticket events" },
                notifyOnClose: false,
                close: { type: "plain_text", text: "Cancel" },
                submit: { type: "plain_text", text: "Subscribe" },
                blocks: MessageFormatter.generateAddChannelSubModal(true)
              })
            },
            remove_sub_btn_open_modal: async (ctx) => {
              const subbedChannelsWithNames = await ticketService.getSubbedChannelsWithNames(ctx.payload.workspaceId, ctx.payload.userId, await ctx.getUserClient(ctx.payload.userId));
              await ctx.pushModalView({
                type: "MODAL",
                parentViewId: ctx.payload.view?.id,
                callbackId: "removeSubscription",
                title: { type: "plain_text", text: "Unsubscribe channel from ticket events" },
                notifyOnClose: false,
                close: { type: "plain_text", text: "Cancel" },
                submit: { type: "plain_text", text: "Unsubscribe" },
                blocks: MessageFormatter.generateRemoveChannelSubModal(subbedChannelsWithNames)
              })
            },
            connect_org_link_bttn: async (ctx) => {
              await ctx.updateView({
                id: ctx.payload.view?.id,
                type: "MODAL",
                callbackId: "connectOrg",
                title: { type: "plain_text", text: "Connect account" },
                notifyOnClose: false,
                close: { type: "plain_text", text: "Close" },
                blocks: MessageFormatter.generateConnectOrgCloseWindowMessage()
              })
            },
            add_filter_bttn: async (ctx) => {
              const builder = ctx.viewBuilder(ctx.payload.view!);
              const auth = await authService.getAuth(ctx.payload.workspaceId, ctx.payload.userId);
              if (!builder || !ctx.viewBlocks || !auth) {
                logger.error("Cannot add filter, something is missing ", builder, ctx.viewBlocks, auth);
                await ctx.ack();
                return;
              }
              await MessageFormatter.replaceDynamicMenusWithInitialData(ctx, builder, auth);
              const existingFiltersCount = ctx.viewBlocks?.filter(b => b.type === "input" && b.blockId.startsWith(FILTER_FIELD_NAME)).length;
              // replace add/remove filter buttons
              builder.removeBlockAt(ctx.viewBlocks.length - 1);
              builder.appendBlocks([MessageFormatter.generateAddRemoveFilterButtons(existingFiltersCount < 2, true)]);
              // add filter
              builder.insertBlocksAt(ctx.viewBlocks.length - 1,
                  MessageFormatter.filtersToAddChannelSubModal(existingFiltersCount + 1)
              );
              await ctx.updateView(builder.build());
            },
            remove_filter_bttn: async (ctx) => {
              const builder = ctx.viewBuilder(ctx.payload.view!);
              const auth = await authService.getAuth(ctx.payload.workspaceId, ctx.payload.userId);
              if (!builder || !ctx.viewBlocks || !auth) {
                logger.error("Cannot remove filter, something is missing ", builder, ctx.viewBlocks, auth);
                await ctx.ack();
                return;
              }
              await MessageFormatter.replaceDynamicMenusWithInitialData(ctx, builder, auth);
              const existingFiltersCount = ctx.viewBlocks?.filter(b => b.type === "input" && b.blockId.startsWith(FILTER_FIELD_NAME)).length;
              // replace add/remove filter buttons
              builder.removeBlockAt(ctx.viewBlocks.length - 1);
              builder.appendBlocks([MessageFormatter.generateAddRemoveFilterButtons(true, existingFiltersCount > 1)]);
              // remove filter
              builder.removeBlocksAt(ctx.viewBlocks.length - 2, 1);
              delete ctx.viewState?.values[`${FILTER_FIELD_NAME}${existingFiltersCount}`];
              if (ctx.viewState) {
                builder.updateState(ctx.viewState);
              }
              await ctx.updateView(builder.build());
            }
          }
        },]
  },
  events: [
    {
      name: "APP_UNINSTALLED", handler: async ctx => {
        await webhookService.unsubscribeAll(ctx.payload.workspaceId);
        await authService.deleteAuths(ctx.payload.workspaceId);
        await ticketService.unsubscribeWorkspace(ctx.payload.workspaceId);
      }
    },
    {
      name: "APP_UNAUTHORIZED", handler: async ctx => {
        setTimeout(() => {
          for (const userId of ctx.payload.workspaceUserIds) {
            authService.deleteAuth(ctx.payload.workspaceId, userId);
          }
        }, 10_000);
      }
    },
    {
      name: "NEW_MESSAGE",
      handler: async ctx => {
        if (ctx.payload.body.trId) {
          ticketService.addComment(ctx, await authService.getAuth(ctx.payload.workspaceId, ctx.payload.body.aId))
        }
      }
    }
  ],
  eventsPath: "/hook",
  redirect: {
    enable: true, path: "/redirect",
    onSuccess: async (result, req, res) => {
      res.send(generateInfoPage('Zendesk successfully connected!'));
      if (result.botToken && result.botId && addonManifest) {
        setTimeout(async () => {
          try {
            const botClient = await addonManifest!.getBotClient(result.workspaceId);
            await homeViewService.publishHomeViewForUser(result.workspaceId, result.userId, botClient);
            if (botClient) {
              setTimeout(async () => await authService.sendWelcomeMessages(botClient, result.workspaceId, result.userId, botClient.workspaceUserId), 3000);
            }
          } catch (err) {
            logger.error(err);
          }
        }, 3000);
      }
    }
  },
  tokenStore: new MongoDbTokenStore(mongoConnector.client, MONGO_DB_NAME, "pumble_credentials"),
  onServerConfiguring: (express, addon) => {
    express.use(bodyParser.json());

    express.get('/health', (req, res) => {
      res.send('Ok');
    });

    express.post('/webhook/:code', async (req, res) => {
      const type = req.body.type as string;
      if (!isAlphanumeric(req.params.code)) {
        return res.status(401).send('Unauthorized');
      }
      const webhook = await webhookRepositoryMongo.getWebhook(req.params.code);
      if (!webhook) {
        return res.status(401).send('Unauthorized');
      }
      webhookService.handleWebhookPayload(type, req.body, webhook, addon);
      res.sendStatus(200);
    });

    express.get('/setup', async (req, res) => {
      if (!req.query.code || !req.query.state) {
        return res.sendStatus(400);
      }
      const stateDecoded = CryptoUtils.getDecodedPayload(req.query.state as string);
      const auth = await authService.completeSetup(req.query.code as string, stateDecoded.subdomain, stateDecoded.workspaceId, stateDecoded.workspaceUserId);
      if (auth) {
        await webhookService.createIfNotExists(auth);
      }
      if (!auth) {
        return res.status(401).send('Unauthorized');
      }
      res.send(generateInfoPage(`Successfully connected to Zendesk subdomain ${auth.subdomain}`));
      await homeViewService.publishHomeViewForUser(stateDecoded.workspaceId, stateDecoded.workspaceUserId, await addonManifest?.getBotClient(stateDecoded.workspaceId));
    });
  },
};

var addonManifest: Addon<AddonManifest> | undefined = undefined;

async function main() {
  await initMongoConnector();
  await migrationsService.runMigrations();
  addonManifest = await start(addon);
  cron.schedule('0 1 * * *', async () => {
    logger.info('Refreshing tokens');
    await authService.refreshTokens();
  });
}

main().catch(logger.error);