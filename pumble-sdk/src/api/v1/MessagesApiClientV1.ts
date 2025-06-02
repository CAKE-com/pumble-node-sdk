import { BaseApiClient } from '../BaseApiClient';
import { V1 } from './types';
import { ChannelsApiClientV1 } from './ChannelsApiClientV1';
import { FilesApiClientV1 } from './FilesApiClientV1';
import { AxiosInstance } from 'axios';

export class MessagesApiClientV1 extends BaseApiClient {
    fileApiClientV1: FilesApiClientV1;
    public constructor(
        protected axiosInstance: AxiosInstance,
        protected fileuploadAxiosInstance: AxiosInstance,
        protected workspaceId: string,
        protected workspaceUserId: string
    ) {
        super(axiosInstance, workspaceId, workspaceUserId);
        this.fileApiClientV1 = new FilesApiClientV1(axiosInstance, fileuploadAxiosInstance, workspaceId, workspaceUserId);
    }  

    private urls = {
        fetchMessage: (channelId: string, messageId: string) => `/v1/channels/${channelId}/messages/${messageId}`,
        fetchMessages: (channelId: string) => `/v1/channels/${channelId}/messages`,
        postMessageToChannel: (channelId: string) => `/v1/channels/${channelId}/messages`,
        reply: (channelId: string, threadRootId: string) => `/v1/channels/${channelId}/messages/${threadRootId}`,
        postEphemeral: (channelId: string) => `/v1/channels/${channelId}/messages`,
        replyEphemeral: (channelId: string, threadRootId: string) =>
            `/v1/channels/${channelId}/messages/${threadRootId}`,
        editMessage: (channelId: string, messageId: string) => `/v1/channels/${channelId}/messages/${messageId}`,
        editEphemeralMessage: (channelId: string, messageId: string) => `/v1/channels/${channelId}/messages/${messageId}`,
        editAttachments: (channelId: string, messageId: string) => `/v1/channels/${channelId}/messages/${messageId}/attachments`,
        deleteMessage: (channelId: string, messageId: string) => `/v1/channels/${channelId}/messages/${messageId}`,
        deleteEphemeralMessage: (channelId: string, messageId: string) => `/v1/channels/${channelId}/messages/${messageId}/ephemeral`,
        fetchThreadReplies: (channelId: string, threadRootId: string) =>
            `/v1/channels/${channelId}/messages/${threadRootId}/replies`,
        searchMessages: () => '/v1/messages/search',
        addReaction: (messageId: string) => `/v1/messages/${messageId}/reactions`,
        removeReaction: (messageId: string) => `/v1/messages/${messageId}/reactions`,
        fetchScheduledMessage: (scheduledMessageId: string) => `/v1/messages/scheduled/${scheduledMessageId}`,
        fetchScheduledMessages: () => '/v1/messages/scheduled',
        createScheduledMessage: () => '/v1/messages/scheduled',
        editScheduledMessage: (scheduledMessageId: string) => `/v1/messages/scheduled/${scheduledMessageId}`,
        editScheduledMessageAttachments: (scheduledMessageId: string) => `/v1/messages/scheduled/${scheduledMessageId}/attachments`,
        deleteScheduledMessage: (scheduledMessageId: string) => `/v1/messages/scheduled/${scheduledMessageId}`,
    };

    public async fetchMessage(messageId: string, channelId: string): Promise<V1.Message> {
        const url = this.urls.fetchMessage(channelId, messageId);
        return await this.request({ method: 'get', url });
    }

    public async fetchMessages(
        channelId: string,
        cursor: string | null = null,
        count = 1,
        strategy : 'BEFORE' | 'AROUND' | 'AFTER' = 'BEFORE'
    ): Promise<{ messages: V1.Message[] }> {
        const url = this.urls.fetchMessages(channelId);
        return await this.request<{ messages: V1.Message[] }>({
            method: 'get',
            url,
            params: { limit: count, strategy: strategy, cursor },
        });
    }

    public async postMessageToChannel(channelId: string, payload: V1.SendMessagePayload): Promise<V1.Message> {
        const url = this.urls.postMessageToChannel(channelId);
        const messageContent = await this.processMessagePayload(payload);

        return await this.request<V1.Message>({ method: 'post', url, data: messageContent });
    }

    private async processMessagePayload(payload: V1.SendMessagePayload): Promise<V1.MessageRequest> {
        if (typeof payload === 'string') {
            return { text: payload };
        }

        if (!payload.files) {
            return {
                text: payload.text,
                blocks: payload.blocks,
                attachments: payload.attachments,
                files: []
            }
        }

        if (payload.files.length > 20) {
            throw new Error("Message can not have more than 20 files.")
        }

        const fileIds: String[] = [];
        await Promise.all(payload.files.map(async (file) => {
            const uploadedFile = await this.fileApiClientV1.uploadFile(file.input, file?.options);
            if (uploadedFile) {
                fileIds.push(uploadedFile?.id);
            }
        }));

        return {
            text: payload.text,
            blocks: payload.blocks,
            attachments: payload.attachments,
            files: fileIds
        }
    }

    public async reply(threadRootId: string, channelId: string, payload: V1.SendMessagePayload): Promise<V1.Message> {
        const url = this.urls.reply(channelId, threadRootId);
        const messageContent = await this.processMessagePayload(payload);
        
        return await this.request<V1.Message>({ method: 'post', url, data: messageContent });
    }

    public async postEphemeral(
        channelId: string,
        payload: V1.SendMessagePayload,
        targetUser: string,
        ...otherUsers: string[]
    ): Promise<V1.Message> {
        const url = this.urls.postEphemeral(channelId);
        const messageContent = typeof payload === 'string' ? { text: payload } : payload;
        const requestBody = {
            ephemeral: {
                sendToUsers: [targetUser, ...otherUsers],
            },
            ...messageContent,
        };
        return await this.request({ url, method: 'post', data: requestBody });
    }

    public async replyEphemeral(
        threadId: string,
        channelId: string,
        payload: V1.SendMessagePayload,
        ...toUsers: string[]
    ): Promise<V1.Message> {
        const url = this.urls.replyEphemeral(channelId, threadId);
        const messageContent = typeof payload === 'string' ? { text: payload } : payload;
        const requestBody = {
            ephemeral: {
                sendToUsers: toUsers,
            },
            ...messageContent,
        };
        return await this.request({ method: 'post', url, data: requestBody });
    }

    public async editMessage(
        messageId: string,
        channelId: string,
        payload: V1.SendMessagePayload
    ): Promise<V1.Message> {
        const url = this.urls.editMessage(channelId, messageId);
        return await this.request({
            method: 'PUT',
            url,
            data: typeof payload === 'string' ? { text: payload } : payload,
        });
    }

    public async editEphemeralMessage(
        messageId: string,
        channelId: string,
        payload: V1.EditEphemeralMessageRequestBody
    ): Promise<V1.Message> {
        const url = this.urls.editEphemeralMessage(channelId, messageId);
        return await this.request({
            method: 'PUT',
            url,
            data: payload
        })
    }

    public async editAttachments(
        messageId: string,
        channelId: string,
        attachments: V1.MessageAttachment[]
    ): Promise<V1.Message> {
        const url = this.urls.editAttachments(channelId, messageId);
        return await this.request({
            method: 'PUT',
            url,
            data: {attachments},
        });
    }

    public async deleteMessage(messageId: string, channelId: string): Promise<void> {
        const url = this.urls.deleteMessage(channelId, messageId);
        return await this.request({
            method: 'DELETE',
            url,
        });
    }

    public async deleteEphemeralMessage(messageId: string, channelId: string, payload: V1.DeleteEphemeralMessageRequestBody): Promise<void> {
        if (payload.deleteForUsers.length <= 0) {
            throw new Error("The list of users to whom the message should be deleted is empty.")
        }

        const url = this.urls.deleteEphemeralMessage(channelId, messageId);
        return await this.request({
            method: 'DELETE',
            url,
            data: payload
        })
    }

    public async fetchThreadReplies(
        threadRootId: string,
        channelId: string,
        cursor?: string,
        limit?: number,
        strategy?: 'BEFORE' | 'AFTER' | 'AROUND'
    ): Promise<V1.Message[]> {
        const url = this.urls.fetchThreadReplies(channelId, threadRootId);
        return this.request({
            method: 'get',
            url,
            params: {
                cursor,
                strategy,
                limit,
            },
        });
    }

    public async dmUser(userId: string, message: V1.SendMessagePayload) {
        const channelsApiClient = new ChannelsApiClientV1(this.axiosInstance, this.workspaceId, this.workspaceUserId);
        const directChannel = await channelsApiClient.getDirectChannel([userId]);
        if (directChannel) {
            await this.postMessageToChannel(directChannel.channel.id, message);
        }
    }

    public async searchMessages(request: V1.MessageSearchRequest) {
        return this.request<V1.PageMessageSearchResult>({
            method: 'post',
            data: request,
            url: this.urls.searchMessages(),
        });
    }
    public async addReaction(messageId: string, request: V1.ReactionRequest) {
        await this.request<void>({ method: 'post', url: this.urls.addReaction(messageId), data: request });
    }

    public async removeReaction(messageId: string, request: V1.ReactionRequest) {
        await this.request<void>({ method: 'delete', url: this.urls.removeReaction(messageId), data: request });
    }

    public async fetchScheduledMessage(scheduledMessageId: string) {
        return await this.request<V1.ScheduledMessage>({
            method: 'get',
            url: this.urls.fetchScheduledMessage(scheduledMessageId)
        });
    }

    public async fetchScheduledMessages() {
        return await this.request<{ scheduledMessages: V1.ScheduledMessage[] }>({
            method: 'get',
            url: this.urls.fetchScheduledMessages()
        });
    }

    public async createScheduledMessage(request: V1.ScheduleMessageRequest) {
        return await this.request<V1.ScheduledMessage>({
            method: 'post',
            url: this.urls.createScheduledMessage(),
            data: request
        });
    }

    public async editScheduledMessage(scheduledMessageId: string, request: V1.ScheduleMessageRequest) {
        return await this.request<V1.ScheduledMessage>({
            method: 'put',
            url: this.urls.editScheduledMessage(scheduledMessageId),
            data: request
        });
    }

    public async editScheduledMessageAttachments(scheduledMessageId: string, attachments: V1.MessageAttachment[]) {
        await this.request<V1.ScheduledMessage>({
            method: 'put',
            url: this.urls.editScheduledMessageAttachments(scheduledMessageId),
            data: { attachments }
        })
    }

    public async deleteScheduledMessage(scheduledMessageId: string) {
        await this.request<void>({ method: 'delete', url: this.urls.deleteScheduledMessage(scheduledMessageId) });
    }
}
