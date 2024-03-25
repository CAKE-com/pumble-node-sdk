import { BaseApiClient } from '../BaseApiClient';
import { V1 } from './types';

export class CallsApiClientV1 extends BaseApiClient {
    private urlsV1 = {
        createPermanentCall: () => `/api/v1/calls/permanent`,
    };
    private urlsV0 = {
        createPermanentCall: () => `/workspaces/${this.workspaceId}/permanentCalls`,
    };
    private urls = this.urlsV0;

    public async createPermanentCall() {
        return await this.request<V1.PermanentCall>({ url: this.urls.createPermanentCall(), method: 'POST' });
    }
}
