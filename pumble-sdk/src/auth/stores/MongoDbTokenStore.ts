import { Collection, Db, MongoClient } from 'mongodb';
import { OAuth2AccessTokenResponse } from '../types';
import { CredentialsStore } from './CredentialsStore';

type TokenDocument = {
    userId: string;
    workspaceId: string;
    isBot: boolean;
    accessToken: string;
};

export class MongoDbTokenStore implements CredentialsStore {
    public constructor(
        protected client: MongoClient,
        protected database: string,
        protected collectionName: string
    ) {}

    public async initialize(): Promise<void> {}

    private get db(): Db {
        return this.client.db(this.database);
    }

    private get collection(): Collection<TokenDocument> {
        return this.db.collection(this.collectionName);
    }

    public async getBotToken(workspaceId: string): Promise<string | undefined> {
        const document = await this.collection.findOne({
            isBot: true,
            workspaceId,
        });
        if (document) {
            return document.accessToken;
        }
    }

    public async getBotUserId(
        workspaceId: string
    ): Promise<string | undefined> {
        const document = await this.collection.findOne({
            isBot: true,
            workspaceId,
        });
        if (document) {
            return document.userId;
        }
    }

    public async getUserToken(
        workspaceId: string,
        workspaceUserId: string
    ): Promise<string | undefined> {
        const document = await this.collection.findOne({
            workspaceId,
            userId: workspaceUserId,
        });
        if (document) {
            return document.accessToken;
        }
    }

    public async saveTokens(
        response: OAuth2AccessTokenResponse
    ): Promise<void> {
        if (response.botToken && response.botId) {
            await this.collection.updateOne(
                { isBot: true, workspaceId: response.workspaceId },
                {
                    $set: {
                        isBot: true,
                        workspaceId: response.workspaceId,
                        userId: response.botId,
                        accessToken: response.botToken,
                    },
                },
                { upsert: true }
            );
        }
        await this.collection.updateOne(
            { userId: response.userId, workspaceId: response.workspaceId },
            {
                $set: {
                    isBot: false,
                    workspaceId: response.workspaceId,
                    userId: response.userId,
                    accessToken: response.accessToken,
                },
            },
            { upsert: true }
        );
    }
}
