import { ZENDESK_APP_ID, ZENDESK_APP_NAME, ZENDESK_DEVELOPER_ORG_ID } from '../config/config';

class ZendeskClient {
    public async sendRequest(
        url: string,
        method: string,
        body: any,
        accessToken?: string,
    ): Promise<Response> {
        return await fetch(url, {
            method: method,
            body: !['GET', 'DELETE'].includes(method) ? JSON.stringify(body) : undefined,
            headers: {
                'Authorization': accessToken ? `Bearer ${accessToken}` : '',
                'Content-Type': 'application/json',
                'X-Zendesk-Marketplace-Name': ZENDESK_APP_NAME,
                'X-Zendesk-Marketplace-Organization-Id': ZENDESK_DEVELOPER_ORG_ID,
                'X-Zendesk-Marketplace-App-Id': ZENDESK_APP_ID
            }
        });
    }
}

export const zendeskClient = new ZendeskClient();