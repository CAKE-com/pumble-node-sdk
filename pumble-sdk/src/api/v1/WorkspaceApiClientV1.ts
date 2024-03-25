import { BaseApiClient } from '../BaseApiClient';
import { V1 } from './types';

export class WorkspaceApiClientV1 extends BaseApiClient {
    private urlsV0 = {
        getWorkspaceInfo: () => `/api/v1/workspace`,
    };
    private urlsV1 = {
        getWorkspaceInfo: () => `/workspaces/${this.workspaceId}/info`,
    };
    private urls = this.urlsV0;

    public async getWorkspaceInfo() {
        return this.request<V1.Workspace, any>({
            url: this.urls.getWorkspaceInfo(),
            method: 'GET',
        });
    }
}
