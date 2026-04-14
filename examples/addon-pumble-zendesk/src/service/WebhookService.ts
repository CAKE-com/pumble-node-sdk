import {logger} from "../utils/Logger";
import {zendeskClient} from "../client/ZendeskClient";
import {ObjectId} from "mongodb";
import {ChannelSubscription, CommentPayload, TicketPayload, WebhookSubscription, ZendeskAuth} from "../types";
import {webhookRepositoryMongo} from "../mongo/WebhookRepositoryMongo";
import {WEBHOOK_BASE_URL} from "../config/config";
import {CryptoUtils} from "../utils/CryptoUtils";
import {authService} from "./AuthService";
import {ticketService} from "./TicketService";
import {Addon, ApiClient} from "pumble-sdk";
import {channelSubscriptionRepositoryMongo} from "../mongo/ChannelSubscriptionRepositoryMongo";

class WebhookService {

    public async createIfNotExists(auth: ZendeskAuth): Promise<WebhookSubscription | undefined> {
        try {
            const webhook = await webhookRepositoryMongo.getWebhookBySubdomainAndWs(auth.subdomain, auth.workspaceId);
            if (webhook) {
                return;
            }

            const webhookCode = CryptoUtils.generateRandomAlphanumeric(12);

            const response = await zendeskClient.sendRequest(`https://${auth.subdomain}.zendesk.com/api/v2/webhooks`, 'POST', {
                webhook: {
                    name: `${auth.subdomain}_webhook`,
                    status: "active",
                    endpoint: WEBHOOK_BASE_URL + webhookCode,
                    http_method: "POST",
                    request_format: "json",
                    subscriptions: [
                        "zen:event-type:ticket.agent_assignment_changed",
                        "zen:event-type:ticket.comment_added",
                        "zen:event-type:ticket.custom_field_changed",
                        "zen:event-type:ticket.custom_status_changed",
                        "zen:event-type:ticket.description_changed",
                        "zen:event-type:ticket.group_assignment_changed",
                        "zen:event-type:ticket.organization_changed",
                        "zen:event-type:ticket.priority_changed",
                        "zen:event-type:ticket.requester_changed",
                        "zen:event-type:ticket.status_changed",
                        "zen:event-type:ticket.subject_changed",
                        "zen:event-type:ticket.submitter_changed",
                        "zen:event-type:ticket.tags_changed",
                        "zen:event-type:ticket.type_changed",
                        "zen:event-type:ticket.created",
                        "zen:event-type:user.role_changed"
                    ]
                }
            }, auth.accessToken);
            if (!response.ok) {
                logger.error(`Error on creating webhook ${await response.text()}`);
                return undefined;
            }
            const data = await response.json();
            return await webhookRepositoryMongo.addWebhook({
                _id: new ObjectId(),
                externalId: data.webhook.id,
                subdomain: auth.subdomain,
                code: webhookCode,
                workspaceId: auth.workspaceId
            });
        } catch (error) {
            logger.error("Error on creating ticket", error);
            return undefined;
        }
    }

    public async unsubscribeAll(workspaceId: string) {
        const webhooks = await webhookRepositoryMongo.getAllForWorkspace(new ObjectId(workspaceId));
        for (const webhook of webhooks) {
            try {
                const auth = await authService.getLatestAuthForWs(workspaceId, webhook.subdomain);
                if (!auth) {
                    logger.error("Error on webhook unsubscription, no auth to use for unsubscription");
                    continue;
                }
                const response = await zendeskClient.sendRequest(`https://${webhook.subdomain}.zendesk.com/api/v2/webhooks/${webhook.externalId}`, 'DELETE', undefined, auth.accessToken);
                if (!response.ok) {
                    logger.error(`Error on webhook unsubscription with status ${response.status} `, await response.text());
                } else {
                    await webhookRepositoryMongo.deleteOne(webhook.code, webhook.workspaceId);
                }
            } catch (e) {
                logger.error("Error on webhook unsubscription", e);
            }
        }
    }


    public async handleWebhookPayload(eventType: string, body: any, webhook: WebhookSubscription, addon: Addon) {
        eventType = eventType.replace("zen:event-type:ticket.", "");
        switch (eventType) {
            case "created": {
                const ticketPayload = body.detail as TicketPayload;
                return await this.executeOrganizationEventForEachSub(webhook.subdomain, webhook.workspaceId, addon,
                    async (client, sub) => await ticketService.createTicketAndSendAMessage(ticketPayload, sub, client));
            }
            case "priority_changed":
            case "agent_assignment_changed":
            case "requester_changed":
            case "custom_field_changed":
            case "status_changed":
            case "subject_changed":
            case "tags_changed":
            case "type_changed":
            case "description_changed": {
                const ticketPayload = body.detail as TicketPayload;
                return await this.executeOrganizationEventForEachSub(webhook.subdomain, webhook.workspaceId, addon,
                    async (client, sub) => await ticketService.findTicketAndUpdateMessage(eventType, ticketPayload, sub, client));
            }
            case "comment_added": {
                const ticketPayload = body.detail as TicketPayload;
                const commentPayload = body.event.comment as CommentPayload;

                return await this.executeOrganizationEventForEachSubAsUser(webhook.subdomain, webhook.workspaceId, +commentPayload.author.id, addon,
                    async (botClient, userClient, sub) => {
                        // use bot if user is not in a channel
                        if (userClient) {
                            try {
                                const channel = await userClient?.v1.channels.getChannelDetails(sub.channelId.toHexString());
                                if (!channel) {
                                    return;
                                }
                                if (!channel.users?.includes(userClient.workspaceUserId)) {
                                    userClient = undefined;
                                }
                            } catch (e: any) {
                                userClient = undefined;
                                logger.error(`Failed to fetch channel: ${e?.message}`);
                            }
                        }
                        let sendAsBot = !userClient;
                        await ticketService.linkCommentAndSendAReply(commentPayload, ticketPayload.id, sendAsBot, sub, userClient ?? botClient);
                    });
            }
        }
        if (eventType === "zen:event-type:user.role_changed") {
            const client = await addon.getBotClient(webhook.workspaceId.toHexString());
            if (!client) {
                logger.error(`Bot client doesn't exist for workspaceId ${webhook.workspaceId.toHexString()}`);
                return;
            }
            await authService.notifyUserRoleUpdated(webhook.workspaceId.toHexString(), body.detail.email, webhook.subdomain, client);
        }
    }

    private async executeOrganizationEventForEachSub(subdomain: string, workspaceId: ObjectId, addon: Addon, callback: (client: ApiClient, sub: ChannelSubscription) => Promise<void>) {
        const subs = await channelSubscriptionRepositoryMongo.getSubsBySubdomainAndWs(subdomain, workspaceId);
        for (const sub of subs) {
            try {
                const client = sub ? await addon.getBotClient(sub.workspaceId.toHexString()) : undefined;
                if (client) {
                    await callback(client, sub);
                }
            } catch (error: any) {
                if (error.response.data.code === 404100
                    || error.response.data.code === 403000 || error.response.data.code === 403200) {
                    await channelSubscriptionRepositoryMongo.deleteSubById(sub._id);
                    logger.info(`Removed sub ${sub._id.toHexString()} for ${sub.channelId.toHexString()} channel from ${sub.workspaceId.toHexString()} workspace.  Reason: deleted channel or lack of permissions.`)
                } else {
                    logger.error(`Failed to send notification for sub - subdomain ${sub.subdomain}, ws ${sub.workspaceId}`, error);
                }
            }
        }
    }

    private async executeOrganizationEventForEachSubAsUser(subdomain: string, workspaceId: ObjectId, zendeskUserId: number, addon: Addon, callback: (botClient: ApiClient, userClient: ApiClient | undefined, sub: ChannelSubscription) => Promise<void>) {
        const subs = await channelSubscriptionRepositoryMongo.getSubsBySubdomainAndWs(subdomain, workspaceId);
        for (const sub of subs) {
            try {
                const botClient = await addon.getBotClient(sub.workspaceId.toHexString());
                let auth = await authService.getAuthByWorkspaceAndZendeskUserId(sub.workspaceId.toHexString(), zendeskUserId);
                let userClient = auth ? await addon.getUserClient(auth.workspaceId.toHexString(), auth.workspaceUserId.toHexString()) : undefined;
                if (botClient) {
                    await callback(botClient, userClient, sub);
                }
            } catch (e) {
                logger.error(`Failed to send user notification for sub - subdomain ${sub.subdomain}, ws ${sub.workspaceId}`, e);
            }
        }
    }
}

export const webhookService = new WebhookService();