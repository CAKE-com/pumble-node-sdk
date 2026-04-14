import {logger} from "../utils/Logger";
import {zendeskClient} from "../client/ZendeskClient";
import {ticketRepository} from "../mongo/TicketRepositoryMongo";
import {ObjectId} from "mongodb";
import { ChannelSubscription, CommentPayload, Ticket, TicketField, TicketPayload, ZendeskAuth } from '../types';
import {channelSubscriptionRepositoryMongo} from "../mongo/ChannelSubscriptionRepositoryMongo";
import { ApiClient, V1 } from 'pumble-sdk';
import {Mutex} from "async-mutex";
import {authService} from "./AuthService";
import {MessageFormatter} from "../utils/MessageFormatter";
import { homeViewService } from './HomeViewService';
import { timeDiffMs } from '../utils/utils';
import { authRepositoryMongo } from '../mongo/AuthRepositoryMongo';
import { OnMessageContext } from 'pumble-sdk/lib/core/types/contexts';

class TicketService {
    static messageMutex = new Mutex();
    static commentMutex = new Mutex();

    public async createZendeskTicket(auth: ZendeskAuth, subject: string, description?: string, assignee?: number, requester?: {
        name?: string,
        email: string
    }): Promise<TicketPayload | undefined> {
        const response = await zendeskClient.sendRequest(`https://${auth.subdomain}.zendesk.com/api/v2/tickets.json`, 'POST', {
            ticket: {
                subject: subject,
                description: description ?? subject,
                assignee_id: assignee,
                requester: requester
            }
        }, auth.accessToken);
        if (!response.ok) {
            const error = await response.json();
            logger.error("Error on creating ticket", error);
            return undefined;
        }

        const jsonResponse = await response.json();
        return jsonResponse.ticket;
    }

    public async getTicketFieldsListNested(auth: ZendeskAuth, query?: string): Promise<V1.OptionGroup[]> {
        const response = await zendeskClient.sendRequest(`https://${auth.subdomain}.zendesk.com/api/v2/ticket_fields`, 'GET', undefined, auth.accessToken);
        if (!response.ok) {
            const error = await response.json();
            logger.error("Error on fetching fields", error);
            return [];
        }

        let queryMain = query?.split(" ")[0].toLowerCase();
        let querySec = query?.split(" ")[1]?.toLowerCase();

        const jsonResponse = await response.json();
        let filtered = (jsonResponse.ticket_fields as TicketField[]).filter(f => f.active)
            .filter(f => ["tagger", "tickettype", "status", "priority"].includes(f.type));

        let filteredQuery = filtered.filter(f => !queryMain || f.title.toLowerCase().includes(queryMain.toLowerCase()));

        // if there are no results in fields names for query term then skip it and use this term for filtering field values
        if (filteredQuery.length > 0) {
            filtered = filteredQuery;
        } else {
            querySec = queryMain;
        }

        return filtered.map(f => {
                let options = [];
                if (f.custom_field_options || f.system_field_options) {
                    options = (f.custom_field_options || f.system_field_options).filter((cf: {
                        name: any;
                        value: any;
                    }) => !querySec || cf.name.toLowerCase().includes(querySec))
                        .map((cf: { name: any; value: any; }) => {
                            return {
                                text: { type: "plain_text", text: cf.name.slice(0, 75) },
                                value: `${f.title}[${f.id}]=${cf.value}`
                            };
                        });
                }
                return { label: { type: "plain_text", text: f.title }, options: options }
            }
        );
    }

    public async createTicketAndSendAMessage(ticket: TicketPayload, sub: ChannelSubscription, client: ApiClient) {
        const release = await TicketService.messageMutex.acquire();
        try {
            const existingTicket = await ticketRepository.getTicketByIdAndChannel(+ticket.id, sub.subdomain, sub.channelId);
            if (existingTicket || !TicketService.shouldProcessMessage(sub, ticket)) {
                return;
            }
            const auth = await authService.getAuthByWorkspaceAndZendeskUserId(sub.workspaceId.toHexString(), +ticket.submitter_id);
            const user = await client.v1.users.userInfo(auth?.workspaceUserId.toHexString() ?? client.workspaceUserId);
            let ticketDetails = await this.extractTicketDetails(sub.workspaceId.toHexString(),
                +ticket.group_id,
                +ticket.assignee_id,
                +ticket.requester_id, auth);
            const message = await client.v1.messages.postMessageToChannel(sub.channelId.toHexString(),
                MessageFormatter.buildTicketMessage(ticket.subject, ticket, user, ticketDetails?.subdomain, ticketDetails?.group, ticketDetails?.assignee, ticketDetails?.requester));

            if (message) {
                await ticketRepository.createTicket({
                    ticketId: +ticket.id,
                    workspaceId: sub.workspaceId,
                    channelId: sub.channelId,
                    subdomain: sub.subdomain,
                    workspaceUserId: new ObjectId(client.workspaceUserId),
                    messageId: new ObjectId(message.id),
                    comments: []
                });
            }
        } finally {
            release();
        }
    }

    public async findTicketAndUpdateMessage(eventType: string, ticket: TicketPayload, sub: ChannelSubscription, client: ApiClient) {
        const release = await TicketService.messageMutex.acquire();
        try {
            const existingTicket = await ticketRepository.getTicketByIdAndChannel(+ticket.id, sub.subdomain, sub.channelId);
            const shouldProcessTicket = TicketService.shouldProcessMessage(sub, ticket);
            if (!existingTicket || !existingTicket.messageId || !existingTicket.channelId || !shouldProcessTicket) {
                if (shouldProcessTicket) {
                    this.createTicketAndSendAMessage(ticket, sub, client);
                }
                return;
            }
            let auth = await authService.getAuthByWorkspaceAndZendeskUserId(sub.workspaceId.toHexString(), +ticket.submitter_id);
            let ticketDetails = await this.extractTicketDetails(sub.workspaceId.toHexString(),
                +ticket.group_id,
                +ticket.assignee_id,
                +ticket.requester_id, auth);
            const user = await client.v1.users.userInfo(auth?.workspaceUserId.toHexString() ?? client.workspaceUserId);
            await client.v1.messages.editMessage(existingTicket.messageId.toHexString(), existingTicket.channelId.toHexString(),
                MessageFormatter.buildTicketMessage(ticket.subject, ticket, user, ticketDetails?.subdomain, ticketDetails?.group, ticketDetails?.assignee, ticketDetails?.requester))

            if (timeDiffMs(ticket.updated_at, ticket.created_at) > 1000) {
                switch (eventType) {
                    case "status_changed": {
                        await client.v1.messages.reply(existingTicket.messageId.toHexString(), existingTicket.channelId.toHexString(), `Ticket status is set to \`${ticket.status}\``);
                        break;
                    }
                    case "priority_changed": {
                        await client.v1.messages.reply(existingTicket.messageId.toHexString(), existingTicket.channelId.toHexString(), `Ticket priority is set to \`${ticket.priority}\``);
                        break;
                    }
                    case "type_changed": {
                        await client.v1.messages.reply(existingTicket.messageId.toHexString(), existingTicket.channelId.toHexString(), `Ticket type is set to \`${ticket.type}\``);
                        break;
                    }
                    case "agent_assignment_changed": {
                        if (ticketDetails?.assignee) {
                            const assigneeUser = await authRepositoryMongo.getAuthByWorkspaceAndZendeskUserId(new ObjectId(sub.workspaceId), +ticket.assignee_id);
                            const assigneeText = assigneeUser ? `@${assigneeUser.workspaceUserId}` : `\`${ticketDetails?.assignee}\``;
                            await client.v1.messages.reply(existingTicket.messageId.toHexString(), existingTicket.channelId.toHexString(), `Assignee changed to ${assigneeText}`);
                        }
                        break;
                    }
                    case "requester_changed": {
                        if (ticketDetails?.requester) {
                            const requesterUser = await authRepositoryMongo.getAuthByWorkspaceAndZendeskUserId(new ObjectId(sub.workspaceId), +ticket.requester_id);
                            const requesterText = requesterUser ? `@${requesterUser.workspaceUserId}` : `\`${ticketDetails?.requester}\``;
                            await client.v1.messages.reply(existingTicket.messageId.toHexString(), existingTicket.channelId.toHexString(), `Requester changed to ${requesterText}`);
                        }
                        break;
                    }
                }
            }
        } finally {
            release();
        }
    }

    public async linkCommentAndSendAReply(comment: CommentPayload, ticketId: string, asBot: boolean, sub: ChannelSubscription, client: ApiClient) {
        const release = await TicketService.commentMutex.acquire();
        try {
            const ticket = await ticketRepository.getTicketByIdAndChannel(+ticketId, sub.subdomain, sub.channelId);
            if (!ticket || !ticket.messageId || !ticket.channelId || ticket.comments.some(c => c.commentId === +comment.id)) {
                return;
            }

            const message = await client.v1.messages.reply(ticket?.messageId?.toHexString(), ticket.channelId?.toHexString(),
                MessageFormatter.buildCommentMessage(comment, asBot)
            );
            if (message) {
                await ticketRepository.appendComment(ticket.ticketId, new ObjectId(message.channelId), sub.subdomain, {
                    commentId: +comment.id,
                    messageId: new ObjectId(message.id)
                });
            }
        } finally {
            release();
        }
    }

    public async subscribeChannelToTickets(subdomain: string, workspaceId: string, workspaceUserId: string, channel: V1.ChannelInfo, botClient?: ApiClient, filters?: string) {
        await channelSubscriptionRepositoryMongo.createSub(subdomain, new ObjectId(workspaceId), new ObjectId(channel.channel.id), filters);
        if (botClient) {
            await homeViewService.publishHomeViewForAffectedUsers(workspaceId, channel, botClient);
            await botClient?.v1.messages.postMessageToChannel(channel.channel.id, `The organization ${subdomain} has been successfully subscribed to this channel. Ticket events will now be delivered here.`);
        }
    }

    public async unsubscribeChannelFromTickets(subdomain: string, workspaceId: string, workspaceUserId: string, channel: V1.ChannelInfo, botClient?: ApiClient) {
        await channelSubscriptionRepositoryMongo.deleteSub(subdomain, new ObjectId(workspaceId), new ObjectId(channel.channel.id));
        if (botClient) {
            await homeViewService.publishHomeViewForAffectedUsers(workspaceId, channel, botClient);
            await botClient?.v1.messages.postMessageToChannel(channel.channel.id, `The organization ${subdomain} has been unsubscribed from this channel. Ticket events will no longer be sent to this channel.`);
        }
    }

    public async getSubbedChannelsWithNames(workspaceId: string, workspaceUserId: string, userClient?: ApiClient): Promise<{
        channelId: string,
        channelName?: string
    }[]> {
        const auth = await authRepositoryMongo.getAuth(new ObjectId(workspaceId), new ObjectId(workspaceUserId));
        if (!userClient || !auth) {
            return [];
        }
        const subs = await channelSubscriptionRepositoryMongo.getSubsBySubdomainAndWs(auth.subdomain, new ObjectId(workspaceId));
        const subsChannelIds = subs.map(s => s.channelId.toHexString());
        const channels = await userClient.v1.channels.listChannels(["PUBLIC", "PRIVATE"]);
        return channels.filter(channel => subsChannelIds.includes(channel.channel.id))
            .map(c => {
                return {
                    channelId: c.channel.id,
                    channelName: c.channel.name
                }
            });
    }

    public async removeSubscription(subscriptionId: string) {
        return await channelSubscriptionRepositoryMongo.deleteSubById(new ObjectId(subscriptionId));
    }

    public async unsubscribeWorkspace(workspaceId: string) {
        return await channelSubscriptionRepositoryMongo.deleteSubs(new ObjectId(workspaceId));
    }

    public static shouldProcessMessage(sub: ChannelSubscription, ticket: TicketPayload): boolean {
        if (!sub.filters) {
            return true;
        }
        try {
            // return true only if ticket payload contains field from filters and value is equal (or tags contain filtered value)
            const fields = sub.filters.split(",");
            for (const field of fields) {
                const key = field.split("=")[0].trim().toLowerCase().split("[")[0];
                const value = field.split("=")[1].trim().toLowerCase();
                for (const ticketField in ticket) {
                    if (key === ticketField.toLowerCase()) {
                        if ((ticket as any)[ticketField].toLowerCase() === value) {
                            return true;
                        }
                    }
                }
                // tagger fields check
                if (ticket.tags?.includes(value)) {
                    return true;
                }
            }
        } catch (e) {
            // ignored
        }

        return false;
    }

    public async extractTicketDetails(workspaceId: string, groupId: number, assigneeId: number, requesterId: number, auth?: ZendeskAuth): Promise<{
        subdomain?: string,
        group?: string,
        assignee?: string,
        requester?: string,
    }> {
        let subdomain = auth?.subdomain;
        let group = undefined;
        let assignee = undefined;
        let requester = undefined;
        if (!auth) {
            auth = await authService.getAnyWsAuth(workspaceId);
        }
        if (!auth) {
            return {};
        }
        subdomain = auth?.subdomain;
        group = await this.getGroupName(+groupId, auth);
        assignee = (await authService.getZendeskUserDetails(auth.subdomain, auth.accessToken, assigneeId))?.user.name;
        if (!assignee) {
            assignee = groupId === assigneeId ? group : undefined;
        }
        requester = (await authService.getZendeskUserDetails(auth.subdomain, auth.accessToken, requesterId))?.user.name;

        return { subdomain, group, assignee, requester };
    }

    private async getGroupName(id: number, auth: ZendeskAuth): Promise<string | undefined> {
        try {
            const response = await zendeskClient.sendRequest(`https://${auth.subdomain}.zendesk.com/api/v2/groups/${id}.json`,
                'GET', undefined, auth.accessToken);
            const data = await response.json();
            if (response.ok) {
                return data.group.name;
            }
        } catch (err) {
            logger.error("Failed to fetch Zendesk group", err);
        }
        return undefined;
    }

    public async addComment(ctx: OnMessageContext, auth?: ZendeskAuth) {
        const release = await TicketService.commentMutex.acquire();
        try {
            const ticket = await ticketRepository.getTicketByMessageId(new ObjectId(ctx.payload.body.trId));
            if (!ticket || !ticket.channelId || !auth) {
                return;
            }
            const relatedTickets = await ticketRepository.getTicketsByTicketId(ticket.ticketId);
            if (relatedTickets.some(t => t.comments.some(c => c.messageId.toHexString() === ctx.payload.body.mId))) {
                return;
            }

            const response = await zendeskClient.sendRequest(`https://${auth.subdomain}.zendesk.com/api/v2/tickets/${ticket.ticketId}.json`, 'PUT',
                { ticket: { comment: { body: ctx.payload.body.tx } } }, auth.accessToken);
            if (!response.ok) {
                logger.error("Error on creating ticket", await response.json());
                return undefined;
            }
            const data = await response.json();
            const commentId = +data.audit.events.find((e: { type: string }) => e.type === "Comment").id;
            await ticketRepository.appendComment(ticket.ticketId, ticket.channelId, ticket.subdomain!, {
                commentId: commentId,
                messageId: new ObjectId(ctx.payload.body.mId)
            });
        } finally {
            release();
        }
        const client = await ctx.getBotClient();
        client?.v1.messages.replyEphemeral(ctx.payload.body.trId, ctx.payload.body.cId, "Your reply has been submitted to the Zendesk ticket", ctx.payload.body.aId);
    }
}

export const ticketService = new TicketService();