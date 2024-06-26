import { BaseApiClient } from '../BaseApiClient';
import { V1 } from './types';
import { ChannelsApiClientV1 } from './ChannelsApiClientV1';

export class MessagesApiClientV1 extends BaseApiClient {
    private urls = {
        fetchMessage: (channelId: string, messageId: string) => `/v1/channels/${channelId}/messages/${messageId}`,
        fetchMessages: (channelId: string) => `/v1/channels/${channelId}/messages`,
        postMessageToChannel: (channelId: string) => `/v1/channels/${channelId}/messages`,
        reply: (channelId: string, threadRootId: string) => `/v1/channels/${channelId}/messages/${threadRootId}`,
        postEphemeral: (channelId: string) => `/v1/channels/${channelId}/messages`,
        replyEphemeral: (channelId: string, threadRootId: string) =>
            `/v1/channels/${channelId}/messages/${threadRootId}`,
        editMessage: (channelId: string, messageId: string) => `/v1/channels/${channelId}/messages/${messageId}`,
        editAttachments: (channelId: string, messageId: string) => `/v1/channels/${channelId}/messages/${messageId}/attachments`,
        deleteMessage: (channelId: string, messageId: string) => `/v1/channels/${channelId}/messages/${messageId}`,
        fetchThreadReplies: (channelId: string, threadRootId: string) =>
            `/v1/channels/${channelId}/messages/${threadRootId}/replies`,
        searchMessages: () => '/v1/messages/search',
        addReaction: (messageId: string) => `/v1/messages/${messageId}/reactions`,
        removeReaction: (messageId: string) => `/v1/messages/${messageId}/reactions`,
    };

    public async fetchMessage(messageId: string, channelId: string): Promise<V1.Message> {
        const url = this.urls.fetchMessage(channelId, messageId);
        return await this.request({ method: 'get', url });
    }

    public async fetchMessages(
        channelId: string,
        cursor: string | null = null,
        count = 1
    ): Promise<{ messages: V1.Message[] }> {
        const url = this.urls.fetchMessages(channelId);
        return await this.request<{ messages: V1.Message[] }>({
            method: 'get',
            url,
            params: { limit: count, strategy: 'BEFORE', cursor },
        });
    }

    public async postMessageToChannel(channelId: string, payload: V1.SendMessagePayload): Promise<V1.Message> {
        const url = this.urls.postMessageToChannel(channelId);
        const messageContent = typeof payload === 'string' ? { text: payload } : payload;
        return await this.request<V1.Message>({ method: 'post', url, data: messageContent });
    }

    public async reply(threadRootId: string, channelId: string, payload: V1.SendMessagePayload): Promise<V1.Message> {
        const url = this.urls.reply(channelId, threadRootId);
        const messageContent = typeof payload === 'string' ? { text: payload } : payload;
        return await this.request<V1.Message>({ method: 'post', url, data: messageContent });
    }

    public async postEphemeral(
        channelId: string,
        payload: V1.SendMessagePayload,
        ...toUsers: string[]
    ): Promise<V1.Message> {
        const url = this.urls.postEphemeral(channelId);
        const messageContent = typeof payload === 'string' ? { text: payload } : payload;
        const requestBody = {
            ephemeral: {
                sendToUsers: toUsers,
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
}
