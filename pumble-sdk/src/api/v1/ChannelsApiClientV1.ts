import { BaseApiClient } from '../BaseApiClient';
import { V1 } from './types';

export class ChannelsApiClientV1 extends BaseApiClient {
    private urlsV1 = {
        getDirectChannel: () => `/api/v1/channels/direct`,
        createDirectChannel: () => `/api/v1/channels/direct`,
        getChannelDetails: (channelId: string) => `/api/v1/channels/${channelId}`,
        listChannels: () => `/api/v1/channels`,
        createChannel: () => `/api/v1/channels`,
        addUsersToChannel: (channelId: string) => `/api/v1/channels/${channelId}/users`,
        removeUserFromChannel: (channelId: string, userId: string) => `/api/v1/channels/${channelId}/users/${userId}`,
    };

    private urlsV0 = {
        getDirectChannel: () => `/workspaces/${this.workspaceId}/channels/direct`,
        createDirectChannel: () =>
            `/workspaces/${this.workspaceId}/workspaceUsers/${this.workspaceUserId}/channels/direct`,
        getChannelDetails: (channelId: string) => `/workspaces/${this.workspaceId}/channels/${channelId}`,
        listChannels: () => `/workspaces/${this.workspaceId}/workspaceUsers/${this.workspaceUserId}/channels`,
        createChannel: () => `/workspaces/${this.workspaceId}/channels`,
        addUsersToChannel: (channelId: string) => `/workspaces/${this.workspaceId}/channels/${channelId}/users`,
        removeUserFromChannel: (channelId: string, userId: string) =>
            `/workspaces/${this.workspaceId}/channels/${channelId}/users/${userId}`,
    };
    private urls = this.urlsV0;

    public async getDirectChannel(withUsers: string[]): Promise<V1.ChannelInfo> {
        const url = this.urls.getDirectChannel();
        return await this.request<V1.ChannelInfo>({
            method: 'get',
            url,
            params: {
                participantIds: Array.from(new Set([this.workspaceUserId, ...withUsers])).join(','),
            },
        });
    }

    public async createDirectChannel(request: V1.CreateDirectChannelRequest): Promise<V1.ChannelInfo> {
        const url = this.urls.createDirectChannel();
        return await this.request<V1.ChannelInfo>({
            method: 'post',
            url,
            data: request,
        });
    }

    public async getChannelDetails(channelId: string): Promise<V1.ChannelInfo> {
        const url = this.urls.getChannelDetails(channelId);
        return await this.request<V1.ChannelInfo>({
            method: 'get',
            url,
        });
    }

    public async listChannels(): Promise<Array<V1.ChannelInfo>> {
        const url = this.urls.listChannels();
        return await this.request<Array<V1.ChannelInfo>>({ url, method: 'get' });
    }

    public async createChannel(data: V1.CreateChannelRequestBody) {
        return this.request<V1.ChannelInfo>({
            url: this.urls.createChannel(),
            method: 'POST',
            data,
        });
    }

    public async addUsersToChannel(channelId: string, data: V1.AddUsersToChannelRequestBody) {
        return this.request<V1.UsersAddedToChannel>({
            url: this.urls.addUsersToChannel(channelId),
            method: 'POST',
            data,
        });
    }

    public async removeUserFromChannel(channelId: string, userId: string) {
        this.request({
            url: this.urls.removeUserFromChannel(channelId, userId),
            method: 'DELETE',
        });
    }
}
