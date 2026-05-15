import {repository} from "../persistence/PollRepository";
import {Poll, Voter} from "../domain/Poll";
import {pumbleApiService} from "./PumbleApiService";
import {renderPoll} from "./PollRenderingService";
import {getPollClosedMessage} from "./utils";
import {asyncScheduler, Subject, Subscription, throttleTime} from "rxjs";
import {sendUpdatedPoll} from "./PollService";
import {voteSynchronizer} from "./VoteSynchronizer";
import { Logger } from "./Logger";

const cron = require('node-cron');
const VOTE_FEEDBACK_DURATION = 30 * 1000;

/**
 * This is used to streamline the process of updating the Poll message on the Pumble side, and also for the feedback
 * messages that are sent whenever a user votes.
 *
 * By throttling updates to the Poll messages we can avoid overlapping the changes at a given time, and also rate limiting
 * the amount of requests we do on a given interval
 *
 */
class PollScheduledUpdate {
    private logger;
    private pollUpdateSubjects;
    private pollUpdateSubscriptions;
    private voteFeedbackSubjects;
    private voteFeedbackSubscriptions;

    constructor() {
        this.logger = Logger.getInstance(PollScheduledUpdate);
        this.pollUpdateSubjects = new Map<string, Subject<Poll>>();
        this.pollUpdateSubscriptions = new Map<string, Subscription>();
        this.voteFeedbackSubjects = new Map<string, Subject<Voter>>();
        this.voteFeedbackSubscriptions = new Map<string, Subscription>();
    }

    public onVote(voter: Voter, poll: Poll) {
        const messageId = poll.messageId!;
        const pollVoterIdentifier = `${messageId}-${voter.userId};`

        // Trigger an event for updating the poll after votes have been changed
        this.pollUpdateSubjects.get(messageId)?.next(poll);

        // If a subject already exists, just push the event and the subscription will be fired up
        if (this.voteFeedbackSubjects.has(pollVoterIdentifier)) {
            this.voteFeedbackSubjects.get(pollVoterIdentifier)!.next(voter);
            return;
        }

        // Create a new subject
        const subject = new Subject<Voter>();
        this.voteFeedbackSubjects.set(pollVoterIdentifier, subject);

        // Create a subscription for this new subject
        const voterSubscription = subject.asObservable()
            .pipe(throttleTime(1000, asyncScheduler, {leading: false, trailing: true}))
            .subscribe(async currentVoter => await pollScheduledUpdateService.handleVote(currentVoter, poll, messageId))
        ;


        this.voteFeedbackSubscriptions.set(pollVoterIdentifier, voterSubscription);

        // Trigger an event for creating/updating feedback messages
        subject.next(voter);
    }

    public add(messageId: string) {
        // Create subjects & subscriptions for handing poll updates
        const subject = new Subject<Poll>();
        this.pollUpdateSubjects.set(messageId, subject);

        const subscription = subject.asObservable()
            .pipe(throttleTime(250, asyncScheduler, {leading: false, trailing: true}))
            .subscribe(async poll => await sendUpdatedPoll((await pumbleApiService.getBotClient(poll.workspaceId))!, poll))
        ;

        this.pollUpdateSubscriptions.set(messageId, subscription);
    }

    public async closePolls() {
        if (!this.logger) {
            this.logger = Logger.getInstance(PollScheduledUpdate);
        }
        const polls = await repository.getFinishedPolls();

        this.logger.info(`Found ${polls.length} finished polls which are not closed. Closing...`);

        for (let poll of polls) {
            poll.closed = true;
            try {
                const userClient = await pumbleApiService.getUserClient(poll.workspaceId, poll.userId);
                const botClient = await pumbleApiService.getBotClient(poll.workspaceId);

                if (poll.sentAsUser) {
                    await userClient!.v1.messages.editMessage(poll.messageId!, poll.targetChannelId, await renderPoll(poll));
                } else {
                    await botClient!.v1.messages.editMessage(poll.messageId!, poll.targetChannelId, await renderPoll(poll));
                }
                await pollScheduledUpdateService.closePoll(poll);
            } catch (e: any) {
                // if api returns 4xx error close the poll
                if (e && e.response && e.response.status && e.response.status.toString().startsWith("4")) {
                    this.logger.info(`API returned ${e.response.status} error, closing poll ${poll.pollId}`)
                    await pollScheduledUpdateService.closePoll(poll);
                    continue;
                }
                this.logger.error(`Error closing poll with  pollId : ${poll.messageId}`, e);
                continue;
            }

            try {
                const botClient = await pumbleApiService.getBotClient(poll.workspaceId);
                const userClient = await pumbleApiService.getUserClient(poll.workspaceId, poll.userId);


                let botDm = await botClient!.v1.channels.getDirectChannel([poll.userId]);
                const channelDetails = await userClient!.v1.channels.getChannelDetails(poll.targetChannelId);

                await botClient!.v1.messages.postMessageToChannel(botDm.channel.id, getPollClosedMessage(poll, channelDetails.channel.channelType));
            } catch (e) {
                this.logger.error(`Error sending poll closed notification message for pollId :  ${poll.messageId}`, e);
            }
        }
    }

    clearSubscriptions(messageId: string) {
        this.pollUpdateSubscriptions.get(messageId)?.unsubscribe();
        this.pollUpdateSubscriptions.delete(messageId);
        this.pollUpdateSubjects.delete(messageId);

        for (let key of this.voteFeedbackSubscriptions.keys()) {
            if (key.startsWith(messageId)) {
                this.voteFeedbackSubscriptions.get(key)?.unsubscribe();
                this.voteFeedbackSubscriptions.delete(key);
                this.voteFeedbackSubjects.delete(key);
            }
        }
    }

    private async handleVote(voter: Voter, poll: Poll, messageId: string) {
        const feedbackMessage = voter.selections.length == 0 ? 'Your votes have been removed' : `You voted for [ ${Array.from(voter.selections).join(', ')} ]`;
        const botClient = await pumbleApiService.getBotClient(poll.workspaceId);

        if (voter.ephemeralMessageId && (Date.now() - voter.lastVoteTime! < VOTE_FEEDBACK_DURATION)) {
            await botClient!.v1.messages.editEphemeralMessage(voter.ephemeralMessageId!, poll.targetChannelId, {
                text: feedbackMessage,
                blocks: [],
                ephemeral: {
                    sendToUsers: [voter.userId]
                }
            });
            await repository.updateVoterLastVoteTime(messageId, voter.userId);
        } else {
            const ephemeralMessage = await botClient!.v1.messages.postEphemeral(poll.targetChannelId, {
                text: feedbackMessage,
                blocks: []
            }, voter.userId);
            await repository.updateVoterEphemeralMessage(messageId, voter.userId, ephemeralMessage.id);
        }
    }

    private async closePoll(poll: Poll) {
        try {
            this.logger.info(`Closing poll ${poll.pollId}.`)
            await repository.updateByMessageId(poll.messageId!, poll);
            voteSynchronizer.onClosedPoll(poll.messageId!);
            pollScheduledUpdateService.clearSubscriptions(poll.messageId!);
            this.logger.info(`Closed ${poll?.pollId} poll.`);
        } catch (e) {
            this.logger.error(`Error while closing ${poll.pollId} poll.`, e);
        }
    }
}

export const pollScheduledUpdateService = new PollScheduledUpdate();
cron.schedule('* * * * *', pollScheduledUpdateService.closePolls);
