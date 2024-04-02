import { BaseApiClient } from '../BaseApiClient';
import { V1 } from './types';

export class CallsApiClientV1 extends BaseApiClient {
    private urls = {
        createPermanentCall: () => `/v1/calls/permanent`,
    };

    public async createPermanentCall() {
        return await this.request<V1.PermanentCall>({ url: this.urls.createPermanentCall(), method: 'POST' });
    }
}
