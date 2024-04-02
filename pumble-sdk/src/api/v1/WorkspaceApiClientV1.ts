import { BaseApiClient } from '../BaseApiClient';
import { V1 } from './types';

export class WorkspaceApiClientV1 extends BaseApiClient {
    private urls = {
        getWorkspaceInfo: () => `/v1/workspace`,
    };

    public async getWorkspaceInfo() {
        return this.request<V1.Workspace, any>({
            url: this.urls.getWorkspaceInfo(),
            method: 'GET',
        });
    }
}
