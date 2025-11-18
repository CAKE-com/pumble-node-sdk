import { OAuth2AccessTokenResponse } from '../index';

export interface CredentialsStore {
    getBotToken(workspaceId: string): Promise<string | undefined>;

    getUserToken(
        workspaceId: string,
        workspaceUserId: string
    ): Promise<string | undefined>;

    getBotUserId(workspaceId: string): Promise<string | undefined>;

    saveTokens(accessTokenResponse: OAuth2AccessTokenResponse): Promise<void>;

    deleteForWorkspace(workspaceId: string): Promise<void>;

    deleteForUser(workspaceUserId: string, workspaceId: string): Promise<void>;

    initialize(): Promise<void>;
}
