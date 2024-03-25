import fs from 'fs';
import { OAuth2AccessTokenResponse } from '../types';
import { CredentialsStore } from '..';

export class JsonFileTokenStore implements CredentialsStore {
    public constructor(private path: string) {}

    private credentials: Record<
        string,
        {
            botId?: string;
            botToken?: string;
            userTokens: Record<string, string>;
        }
    > = {};

    public async getBotToken(workspaceId: string): Promise<string | undefined> {
        return this.credentials[workspaceId]?.botToken;
    }

    public async getBotUserId(workspaceId: string): Promise<string | undefined> {
        return this.credentials[workspaceId]?.botId;
    }

    public async getUserToken(workspaceId: string, workspaceUserId: string): Promise<string | undefined> {
        return this.credentials[workspaceId]?.userTokens[workspaceUserId];
    }

    public async initialize() {
        try {
            this.credentials = JSON.parse((await fs.promises.readFile(this.path)).toString());
        } catch (err) {
            this.credentials = {};
        }
    }

    public async saveTokens(response: OAuth2AccessTokenResponse): Promise<void> {
        const workspaceCredentials = this.credentials[response.workspaceId] || {
            userTokens: {},
        };
        if (response.botId && response.botToken) {
            workspaceCredentials.botId = response.botId;
            workspaceCredentials.botToken = response.botToken;
        }
        workspaceCredentials.userTokens[response.userId] = response.accessToken;
        this.credentials[response.workspaceId] = workspaceCredentials;
        await this.save();
    }

    private async save() {
        await fs.promises.writeFile(this.path, JSON.stringify(this.credentials));
    }
}
