import { OAuth2AccessTokenResponse } from '../index';

export interface CredentialsStore {
    getBotToken(workspaceId: string): Promise<string | undefined>;

    getUserToken(
        workspaceId: string,
        workspaceUserId: string
    ): Promise<string | undefined>;

    getBotUserId(workspaceId: string): Promise<string | undefined>;

    saveTokens(accessTokenResponse: OAuth2AccessTokenResponse): Promise<void>;

    initialize(): Promise<void>;
}
