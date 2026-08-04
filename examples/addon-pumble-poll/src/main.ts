import {App, start} from "pumble-sdk";
import {ADDON_LISTENER_PORT} from "./config";
import {generateInfoPage} from "./service/InfoPage";
import setupEndpoints from "./http/HttpAdapter";
import {BlockInteractionContext} from "pumble-sdk/lib/core/types/contexts";

import {repository} from "./persistence/PollRepository";
import {pumbleCredentialsRepositoryMongo} from "./persistence/PumbleCredentialsRepositoryMongo";
import {
    addOtherAnswerFromModal,
    appendOptionForPollModalStep2, createPollFromModal,
    createPollModalStep1, createPollModalStep2,
    handleVote, removeOptionForPollModalStep2, setOptionsForPollModalStep2, showAddOtherAnswerModal, showResultsModal,
} from "./service/PollService";
import { createChannelOptions } from "./service/PollRenderingService";
import {pumbleApiService} from "./service/PumbleApiService";
import {getAuthorizationText, getHelpMessage, value} from "./service/utils";
import {pollScheduledUpdateService} from "./service/PollScheduledUpdate";
import {voteSynchronizer} from "./service/VoteSynchronizer";
import { Logger } from "./service/Logger";
const logger = Logger.getInstance("main");

const addon: App = {
        offlineMessage: "Poll addon is currently not reachable.",
        welcomeMessage: `Hi there 👋 \nPolls has been installed in your workspace. Use it to create questionnaires directly from Pumble. \n\nTo proceed please authorize the Polls app on the Configure Apps page. Click the \'Add Apps\' button at the bottom of the left sidebar to open it.`,
        port: ADDON_LISTENER_PORT,
        blockInteraction: {
            interactions: [
                {
                    sourceType: "MESSAGE",
                    handlers: {
                        poll_button: async (ctx: BlockInteractionContext<'MESSAGE'>) => {
                            await ctx.ack();
                            let payloadValue = JSON.parse(ctx.payload.payload).value;
                            await handleVote(ctx.payload.sourceId, payloadValue, ctx.payload.userId);
                        },
                        poll_results_btn: async (ctx: BlockInteractionContext<'MESSAGE'>) => {
                            await showResultsModal(ctx);
                        },
                        poll_add_answer_btn: async (ctx: BlockInteractionContext<'MESSAGE'>) => {
                            await showAddOtherAnswerModal(ctx);
                        },
                        dummy_action: async (ctx: BlockInteractionContext<'MESSAGE'>) => {
                            await ctx.ack();
                        }
                    }
                },
                {
                    sourceType: "VIEW",
                    handlers: {
                        options_selector: async (ctx: BlockInteractionContext<'VIEW'>) => {
                            await setOptionsForPollModalStep2(ctx);
                        },
                        addOption: async (ctx: BlockInteractionContext<'VIEW'>) => {
                            await appendOptionForPollModalStep2(ctx);
                        },
                        removeOption: async (ctx: BlockInteractionContext<'VIEW'>) => {
                            await removeOptionForPollModalStep2(ctx);
                        },
                    }
                },
            ]
        },
        slashCommands: [
            {
                command: "/polls",
                description: "Help",
                usageHint: "help",
                handler: async (ctx) => {
                    await ctx.ack();

                    const isAuthorized = await pumbleApiService.isAuthorized(ctx.payload.userId, ctx.payload.workspaceId);

                    if (!isAuthorized) {
                        await ctx.say(getAuthorizationText());
                        return;
                    }
                    await ctx.say(getHelpMessage());
                },
            }
        ],
        globalShortcuts: [
            {
                name: "Create poll",
                description: "Create your questionnaire",
                handler: async (ctx) => {
                    const isAuthorized = await pumbleApiService.isAuthorized(ctx.payload.userId, ctx.payload.workspaceId);

                    if (!isAuthorized) {
                        await ctx.ack();
                        await ctx.say(getAuthorizationText());
                        return;
                    }

                    await createPollModalStep1(ctx, ctx.payload.channelId);
                }
            }
        ],
        viewAction: {
            onSubmit: {
                pollSettings: async (ctx) => {
                    await createPollModalStep2(ctx);
                },
                pollCreate: async (ctx) => {
                    await ctx.ack();
                    await createPollFromModal(ctx);
                },
                pollAddAnswer: async (ctx) => {
                    await ctx.ack();
                    await addOtherAnswerFromModal(ctx);
                }
            },
            onClose: {
                pollCreate: async (ctx) => {
                    const channelId = value(ctx.payload.view?.state?.values.input_channel_selector.channel_selector);
                    if (channelId) {
                        await createPollModalStep1(ctx, channelId, ctx.payload.view.state);
                    } else {
                        await ctx.ack();
                    }
                }
            }
        },
        dynamicMenus: [
            {
                onAction: 'channel_selector',
                producer: async (ctx) => {
                    const client = await ctx.getUserClient();
                    if (!client) {
                        return [];
                    }
                    return await createChannelOptions(client, ctx.payload.query);
                }
            }
        ],
        events: [
            {
                name: 'APP_UNAUTHORIZED',
                handler: async (ctx) => {
                    logger.info(`Users ${ctx.payload.workspaceUserIds} unauthorized app on ${ctx.payload.workspaceId} workspace.`);
                    ctx.payload.workspaceUserIds.forEach(async (user) => await pumbleCredentialsRepositoryMongo.deleteForUser(user, ctx.payload.workspaceId));
                }
            },
            {
                name: 'APP_UNINSTALLED',
                handler: async (ctx) => {
                    logger.info(`App is uninstalled on ${ctx.payload.workspaceId} workspace.`);
                    await pumbleCredentialsRepositoryMongo.deleteForWorkspace(ctx.payload.workspaceId);
                }
            }
        ],
        redirect: {
            enable: true,
            onSuccess: async (result, req, res) => {
                res.send(generateInfoPage("Polls Addon successfully connected"))
            },
            onError: async (result, req, res) => {
                logger.error('authorization error : ', result);
            }
        },
        onServerConfiguring: async (express, addon1) => {
            setupEndpoints(express);
            const openPollMessageIds = await repository.getOpenPolls();
            logger.info('open polls : ', openPollMessageIds);
            for (let id of openPollMessageIds) {
                pollScheduledUpdateService.add(id);
                voteSynchronizer.onNewPoll(id);
            }
        },
        tokenStore: pumbleCredentialsRepositoryMongo,
    }
;

async function main() {
    start(addon);
}

main().catch(() => logger.error);