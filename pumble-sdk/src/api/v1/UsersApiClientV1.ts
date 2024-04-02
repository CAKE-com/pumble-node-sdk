import { BaseApiClient } from '../BaseApiClient';
import { V1 } from './types';

export class UsersApiClientV1 extends BaseApiClient {
    private urls = {
        listWorkspaceUsers: () => `/v1/workspaceUsers`,
        getProfile: () => `/oauth2/me`,
        userInfo: (userId: string) => `/v1/workspaceUsers/${userId}`,
        updateCustomStatus: () => `/v1/workspaceUsers/customStatus`,
    };

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
