import {Poll, Voter} from "../domain/Poll";
import {ApiClient, V1} from "pumble-sdk";
import {repository} from "../persistence/PollRepository";
import {BlockInteractionContext, GlobalShortcutContext, ViewActionContext} from "pumble-sdk/lib/core/types/contexts";
import {PREDEFINED_ANSWERS_MODAL} from "../domain/PredefinedPollAnswer";
import {formatDate, value} from "./utils";
import {pumbleApiService} from "./PumbleApiService";
import {
    generateAnswers,
    generateEmptyOption, optionButtons,
    renderAddAnswerModal,
    renderModalPollOptions,
    renderModalPollSettings,
    renderPoll,
    renderResultsModal
} from "./PollRenderingService";
import {pollScheduledUpdateService} from "./PollScheduledUpdate";
import {voteSynchronizer} from "./VoteSynchronizer";
import SendMessagePayload = V1.SendMessagePayload;
import State = V1.State;
import BlockTextElement = V1.BlockTextElement;
import MainBlock = V1.MainBlock;
import { Logger } from "./Logger";

const logger = Logger.getInstance("pollService");

export async function sendUpdatedPoll(botClient: ApiClient, poll: Poll) {
    const clientToUse = poll.sentAsUser ? await pumbleApiService.getUserClient(poll.workspaceId, poll.userId) : botClient;
    return await clientToUse!.v1.messages.editMessage(poll.messageId!, poll.targetChannelId, await renderPoll(poll));
}

export async function sendNewPoll(botClient: ApiClient, poll: Poll) {
    const postingPermissions = await pumbleApiService.determinePostingPermissions(poll.workspaceId, poll.userId, poll.targetChannelId);

    let clientToUse: ApiClient | undefined;
    if (postingPermissions.canBotPost) {
        clientToUse = botClient;
    } else if (postingPermissions.canUserPost) {
        clientToUse = await pumbleApiService.getUserClient(poll.workspaceId, poll.userId);
    } else {
        await botClient.v1.messages.postEphemeral(poll.channelId, {
            text: "You have no posting permissions for that channel!",
            blocks: []
        }, poll.userId);
        return undefined;
    }

    poll.sentAsUser = !postingPermissions.canBotPost;
    await repository.setSendAsUser(poll.pollId!, poll.sentAsUser);
    const renderedPoll = await renderPoll(poll);
    return clientToUse!.v1.messages.postMessageToChannel(poll.targetChannelId, renderedPoll);
}

export async function handleVote(messageId: string, selectedVote: string, userId: string): Promise<SendMessagePayload> {
    return await voteSynchronizer.runExclusively(messageId, async (): Promise<any> => {
        let poll = await repository.getByMessageId(messageId);

        if (!poll || poll.closed || !poll.isPublished) {
            logger.info('Cannot vote on poll which is already closed or not published ', messageId);
            return;
        }

        let currentVoter: Voter | undefined = undefined;
        let isNewVoter = true;

        for (let voter of poll.voters) {
            if (voter.userId == userId) {
                currentVoter = voter;
                isNewVoter = false;
                break;
            }
        }

        if (!currentVoter) {
            currentVoter = {
                userId: userId,
                selections: []
            }
            poll.voters.push(currentVoter);
        }

        const selections = new Set<string>(currentVoter.selections);

        if (poll.isMultiVote) {
            selections.has(selectedVote) ? selections.delete(selectedVote) : selections.add(selectedVote);
        } else {
            if (selections.has(selectedVote)) {
                selections.clear();
            } else {
                selections.clear();
                selections.add(selectedVote);
            }
        }

        currentVoter.selections = Array.from(selections);

        if (isNewVoter) {
            await repository.addVoter(messageId, currentVoter);
        } else {
            await repository.updateVoterSelections(messageId, userId, Array.from(selections));
        }


        pollScheduledUpdateService.onVote(currentVoter, poll);
    });
}

export async function createPollModalStep1(ctx: GlobalShortcutContext | ViewActionContext, channelId: string, initialState?: State) {
    const userClient = await ctx.getUserClient();
    const {state, blocks} = await renderModalPollSettings(userClient!, channelId, initialState);
    await ctx.spawnModalView({
        type: "MODAL", callbackId: "pollSettings",
        title: {type: "plain_text", text: "Poll settings"},
        submit: {type: "plain_text", text: "Next"},
        close: {type: "plain_text", text: "Close"},
        notifyOnClose: false,
        state: state,
        blocks: blocks,
    });
}

export async function createPollModalStep2(ctx: ViewActionContext) {
    const {state, blocks} = await renderModalPollOptions(ctx.payload.view.state);
    await ctx.spawnModalView({
        type: "MODAL", callbackId: "pollCreate",
        title: {type: "plain_text", text: "Create poll"},
        submit: {type: "plain_text", text: "Create"},
        close: {type: "plain_text", text: "Back"},
        notifyOnClose: true,
        state: state,
        blocks: blocks,
    });
}

export async function setOptionsForPollModalStep2(ctx: BlockInteractionContext<'VIEW'>) {
    const view = ctx.payload.view!;
    const selected = JSON.parse(ctx.payload.payload).value;
    let predefinedOption = PREDEFINED_ANSWERS_MODAL.find(pa => pa.id === selected) ?? undefined;
    const answers = generateAnswers(predefinedOption);
    const filteredBlocks = view.blocks.slice(0, 2);
    filteredBlocks.push(...answers);
    filteredBlocks.push(optionButtons(answers.length));

    let filteredState = view.state;
    for (const key in filteredState?.values) {
        if (key.startsWith("input_answer")) {
            delete filteredState?.values[key];
        }
    }

    await ctx.updateView({
        ...view,
        blocks: filteredBlocks,
        state: filteredState,
    });
}

export async function appendOptionForPollModalStep2(ctx: BlockInteractionContext<'VIEW'>) {
    const view = ctx.payload.view!;
    let filteredBlocks = view.blocks;
    const nextIndex = filteredBlocks.filter(b =>
        b.type === "input" && b.blockId.startsWith("input_answer")).length;
    filteredBlocks = filteredBlocks.slice(0, filteredBlocks.length - 1);
    filteredBlocks.push(generateEmptyOption(nextIndex));
    filteredBlocks.push(optionButtons(nextIndex + 1));

    await ctx.updateView({...view,
        blocks: filteredBlocks,
        state: filteredState(filteredBlocks, view.state)
    });
}

export async function removeOptionForPollModalStep2(ctx: BlockInteractionContext<'VIEW'>) {
    const view = ctx.payload.view!;
    let filteredBlocks = view.blocks;
    const lastIndex = filteredBlocks.filter(b =>
        b.type === "input" && b.blockId.startsWith("input_answer")).length - 1;
    filteredBlocks = filteredBlocks.slice(0, filteredBlocks.length - 2);
    filteredBlocks.push(optionButtons(lastIndex));

    await ctx.updateView({...view,
        blocks: filteredBlocks,
        state: filteredState(filteredBlocks, view.state)
    });
}

function filteredState(blocks: MainBlock[], state?: State) {
    if (!state) {
        return state;
    }
    let filteredState = state;
    const answersCount = blocks.filter(b => b.type === "input" && b.blockId.startsWith("input_answer")).length;
    for (const key in filteredState?.values) {
        if (key.startsWith("input_answer")) {
            const index = +key.split("_")[2];
            if(index >= answersCount) {
                delete filteredState?.values[key];
            }
        }
    }
    return filteredState;
}

export async function createPollFromModal(ctx: ViewActionContext) {
    const stateValues = ctx.payload.view.state?.values;
    const allowMultipleVotes = value(stateValues?.input_setting_selector.setting_selector) === "voteType-multi";
    const isAnonymous = value(stateValues?.input_visibility_selector.visibility_selector) === "responseType-anonymous";
    const allowedNewAnswer = value(stateValues?.input_allowed_new_answer_selector.allowed_new_answer_selector) === "newAnswer-allow";
    const question = value(stateValues?.input_question_selector.question_selector);
    const duration = value(stateValues?.input_duration_selector.duration_selector) ?? "1h";
    const channelId = value(stateValues?.input_channel_selector.channel_selector);
    const defaultChannelId = value(stateValues?.input_default_channel_selector.default_channel_selector) ?? channelId ?? "";
    let answers: string[] = [];

    for (const key in stateValues) {
        if (key.startsWith('input_answer')) {
            const answer = value(stateValues[key][key])?.toString().trim();
            if (answer && answer.length > 0 && !answers.includes(answer)) {
                answers.push(answer);
            }
        }
    }
    answers = answers.slice(0, 10);
    answers = answers.map(a => a.slice(0, 75));

    if(!channelId) {
        return;
    }

    let botClient = await ctx.getBotClient();
    if (!question || answers.length < 2) {
        await botClient!.v1.messages.postEphemeral(channelId, {
            text: `A poll must contain a question and at least 2 answers.`,
            blocks: []
        }, ctx.payload.userId);
        return;
    }

    let endDate = new Date();
    if (duration == '0.5h') {
        endDate.setUTCMinutes(endDate.getUTCMinutes() + 30);
    } else if (['0.5h', '1h', '3h', '6h', '24h', '72h', '168h', '720h'].includes(duration)) {
        endDate.setUTCHours(endDate.getUTCHours() + Number.parseInt(duration.substring(0, duration.length - 1)));
    } else {
        endDate.setUTCHours(endDate.getUTCHours() + 1);
    }

    let userId = ctx.payload.userId;
    let userClient = await ctx.getUserClient(userId);
    let userInfo = undefined;
    try {
        userInfo = await userClient!.v1.users.userInfo(userId);
    } catch (e) {
        logger.error("Failed to fetch user's timezone", e);
    }

    let endDateString = formatDate(endDate, userInfo?.timeZoneId);

    let poll: Poll = {
        messageId: undefined,
        ephemeralMessageId: undefined,
        userId: userId,
        userTimezoneId: userInfo?.timeZoneId,
        channelId: defaultChannelId,
        workspaceId: ctx.payload.workspaceId,
        isAnonymous: isAnonymous,
        isMultiVote: allowMultipleVotes,
        answers: answers,
        question: question,
        createdAt: Date.now(),
        endsAt: endDate.getTime(),
        endsAtString: endDateString,
        closed: false,
        isPublished: false,
        targetChannelId: channelId,
        voters: [],
        newAnswerAllowed: allowedNewAnswer
    }
    poll.pollId = (await repository.create(poll)).toHexString();

    const message = await sendNewPoll(botClient!, poll);
    if (!message) {
        return;
    }

    if (poll.channelId !== poll.targetChannelId) {
        setTimeout(async () => {
            await botClient!.v1.messages.postEphemeral(poll.channelId, {
                text: `Your poll is successfully published on #${poll.targetChannelId}`,
                blocks: []
            }, userId);
        }, 1000);
    }

    poll.isPublished = true;
    poll.messageId = message.id;
    await repository.updateById(poll.pollId, poll);
    pollScheduledUpdateService.add(message.id);
    voteSynchronizer.onNewPoll(message.id);
}

export async function showResultsModal(ctx: BlockInteractionContext<"MESSAGE">) {
    const poll = await repository.getByMessageId(ctx.payload.sourceId);
    await ctx.spawnModalView({
        type: "MODAL",
        state: {
            values: {
                pollId: {
                    pollId: {
                        type: "plain_text_input",
                        value: poll.pollId!,
                    }
                }
            }
        },
        blocks: await renderResultsModal(ctx, poll),
        title: {type: "plain_text", text: "Poll results"},
        notifyOnClose: false,
        close: undefined as unknown as BlockTextElement,
        callbackId: "",
    });
}

export async function showAddOtherAnswerModal(ctx: BlockInteractionContext<'MESSAGE'>) {
    const messageId: string = ctx.payload.sourceId;
    const poll = await repository.getByMessageId(messageId);

    if (!poll || poll.closed || !poll.isPublished) {
        logger.info('Cannot add new answer on poll which is already closed or not published ', messageId);
        return;
    }

    await ctx.spawnModalView({
        type: "MODAL",
        state: {
            values: {
                pollId: {
                    pollId: {
                        type: "plain_text_input",
                        value: poll.pollId!,
                    }
                }
            }
        },
        blocks: await renderAddAnswerModal(),
        title: {type: "plain_text", text: "Add option to poll"},
        submit: {type: "plain_text", text: "Add"},
        close: {type: "plain_text", text: "Close"},
        notifyOnClose: false,
        callbackId: "pollAddAnswer",
    });
}

export async function addOtherAnswerFromModal(ctx: ViewActionContext) {
    const pollId = value(ctx.payload.view.state?.values["pollId"]?.["pollId"]);
    if (!pollId) {
        logger.error(`Error while adding new answer for ${pollId}. Empty pollId.`);
        return;
    }

    const poll = await repository.getById(pollId);
    const messageId = poll.messageId;

    if (!messageId) {
        logger.error(`Error while adding new answer for ${pollId}. Empty messageId.`);
        return;
    }

    var newAnswer = value(ctx.payload.view.state?.values["modal_add_answer"]["input_add_answer_block"]);
    if (!newAnswer) {
        logger.error(`Error while adding new answer for ${pollId}. Empty new answer.`);
        return;
    }


    if (newAnswer.length > 75) {
        logger.error(`Error while adding new answer for ${pollId}. New answer too long.`);
        return;
    }

    if (!poll.newAnswerAllowed) {
        logger.error(`Error while adding new answer for ${pollId}. New answers are not allowed.`, pollId);
        return;
    }

    if (poll.answers.length >= 10) {
        logger.error(`Error while adding new answer for ${pollId}. There is 10 answers already.`);
        return;
    }

    var vote = value(ctx.payload.view.state?.values["modal_vote_for_new_answer"]["vote_selector"]) === 'voteForNewAnswer-vote';

    if (poll.answers.includes(newAnswer)) {
        logger.error(`Error while adding new answer for ${pollId}. Answer ${newAnswer} already exists.`);
        return;
    }

    const client = await ctx.getUserClient();
    if (!client) {
        await sendNotAllowedActionMessage(ctx, poll.channelId);
        return;
    }

    const channel = await client?.v1.channels.getChannelDetails(poll.channelId)
        .catch(async e => {
            logger.error(`Error while fetching ${poll.channelId} channel. ${e}`)
        });

    if (!channel || channel.channel.isArchived || !channel.users?.includes(ctx.payload.userId)) {
        logger.error(`Error while adding new answer for ${pollId}. The user ${ctx.payload.userId} is not member of channel ${poll.channelId}.`);
        await sendNotAllowedActionMessage(ctx, poll.channelId);
        return;
    }

    await repository.addAnswer(messageId, newAnswer);
    poll.answers.push(newAnswer);
    const botClient = await pumbleApiService.getBotClient(poll.workspaceId);

    if (!botClient) {
        logger.error(`Error while adding new option for ${pollId}. Bot client is undefined.`);
        return;
    }

    await sendUpdatedPoll(botClient, poll);
 
    if (vote) {
        await handleVote(messageId, newAnswer, ctx.payload.userId);
    }
}

async function sendNotAllowedActionMessage(ctx: ViewActionContext, channelId: string) {
    const botClient = await ctx.getBotClient();
    botClient?.v1.messages.postEphemeral(channelId, {text: 'You are not allowed to perform this action.'}, ctx.payload.userId);
}