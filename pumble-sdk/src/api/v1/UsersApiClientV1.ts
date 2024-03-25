import { BaseApiClient } from '../BaseApiClient';
import { V1 } from './types';

export class UsersApiClientV1 extends BaseApiClient {
    private urlsV1 = {
        listWorkspaceUsers: () => `/api/v1/workspaceUsers`,
        getProfile: () => `/oauth/me`,
        userInfo: (userId: string) => `/api/v1/workspaceUsers/${userId}`,
        updateCustomStatus: () => `/api/v1/workspaceUsers/customStatus`,
    };
    private urlsV0 = {
        listWorkspaceUsers: () => `/workspaces/${this.workspaceId}/workspaceUsers`,
        getProfile: () => `/oauth/me`,
        userInfo: (userId: string) => `/workspaces/${this.workspaceId}/workspaceUsers/${userId}`,
        updateCustomStatus: () => `/workspaces/${this.workspaceId}/workspaceUsers/${this.workspaceUserId}/customStatus`,
    };
    private urls = this.urlsV0;

    public async listWorkspaceUsers(): Promise<Array<V1.WorkspaceUser>> {
        const url = this.urls.listWorkspaceUsers();
        return this.request({ method: 'get', url });
    }

    public async getProfile(): Promise<V1.OAuthUserProfile> {
        return this.request({ method: 'get', url: this.urls.getProfile() });
    }

    public async userInfo(userId: string): Promise<V1.WorkspaceUser> {
        return this.request({ method: 'get', url: this.urls.userInfo(userId) });
    }

    public async updateCustomStatus(data: V1.UpdateWorkspaceUserCustomStatusRequest) {
        return this.request<V1.WorkspaceUser>({
            url: this.urls.updateCustomStatus(),
            method: 'PUT',
            data: data,
        });
    }
}
