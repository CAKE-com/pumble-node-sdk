import { ApiClient } from '../../api';
import { CredentialsStore, OAuth2Client } from '../../auth';
import { PUMBLE_CONSENT_SCREEN_URL } from '../../constants';
import { AddonManifest } from '../types/types';

export class ClientUtils {
    private get clientId(): string {
        return this.manifest.id;
    }
    private get clientSecret(): string {
        return this.manifest.clientSecret;
    }
    private get appKey(): string {
        return this.manifest.appKey;
    }

    public constructor(
        private manifest: AddonManifest,
        private tokenStore?: CredentialsStore
    ) {}

    public async getUserClient(workspaceId: string, workspaceUserId: string): Promise<ApiClient | undefined> {
        const token = await this.tokenStore?.getUserToken(workspaceId, workspaceUserId);
        if (token) {
            return this.getClient(workspaceId, workspaceUserId, token);
        }
    }

    public async getBotClient(workspaceId: string): Promise<ApiClient | undefined> {
        const token = await this.tokenStore?.getBotToken(workspaceId);
        if (token) {
            const botId = await this.tokenStore?.getBotUserId(workspaceId);
            if (botId) {
                return this.getClient(workspaceId, botId, token);
            }
        }
    }

    private getClient(workspaceId: string, workspaceUserId: string, token: string): ApiClient | undefined {
        if (this.clientId && this.appKey && this.clientSecret) {
            const client = new ApiClient(
                new OAuth2Client(this.clientId, this.clientSecret, this.appKey, token),
                workspaceId,
                workspaceUserId
            );
            return client;
        }
    }

    public async generateAccessToken(code: string, save: boolean = true) {
        if (this.clientId && this.clientSecret && this.appKey) {
            const oauth = new OAuth2Client(this.clientId, this.clientSecret, this.appKey);
            const response = await oauth.generateAccessToken(code);
            if (save) {
                await this.tokenStore?.saveTokens(response);
            }
            return response;
        }
        throw new Error('Missing client credentials!');
    }

    public generateAuthUrl({
        defaultWorkspaceId,
        redirectUrl,
        state,
        isReinstall,
    }: {
        defaultWorkspaceId?: string;
        state?: string;
        redirectUrl?: string;
        isReinstall?: boolean;
    } = {}): string {
        const url = new URL(PUMBLE_CONSENT_SCREEN_URL);
        url.searchParams.set('redirectUrl', redirectUrl || this.manifest.redirectUrls[0]);
        url.searchParams.set('clientId', this.manifest.id);
        if (state) {
            url.searchParams.set('state', state);
        }
        if (defaultWorkspaceId) {
            url.searchParams.set('defaultWorkspaceId', defaultWorkspaceId);
        }
        if (isReinstall) {
            url.searchParams.set('isReinstall', 'true');
        }
        const scopes = [
            ...(this.manifest.scopes?.userScopes || []),
            ...(this.manifest.scopes?.botScopes || []).map((scope) => `bot:${scope}`),
        ].join(',');
        url.searchParams.set('scopes', scopes);
        return url.toString();
    }
}
