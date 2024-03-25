import type { OAuth2AccessTokenResponse } from './types';
import axios from 'axios';
import { PUMBLE_API_URL } from '../constants';
import FormData from 'form-data';

export class OAuth2Client {
    public constructor(
        private clientId: string,
        private clientSecret: string,
        public readonly appKey: string,
        public readonly accessToken?: string
    ) {}
    public async generateAccessToken(
        code: string
    ): Promise<OAuth2AccessTokenResponse> {
        const data = new FormData();
        data.append('client-id', this.clientId);
        data.append('client-secret', this.clientSecret);
        data.append('code', code);
        const result = await axios.post<OAuth2AccessTokenResponse>(
            `${PUMBLE_API_URL}/oauth2/access`,
            data,
            {
                headers: { ...data.getHeaders() },
            }
        );
        return result.data;
    }
}
