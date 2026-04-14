import {BaseRepositoryMongo} from "./BaseRepositoryMongo";
import {WebhookSubscription} from "../types";
import {ObjectId} from "mongodb";

class WebhookRepositoryMongo extends BaseRepositoryMongo<WebhookSubscription> {
    protected get collectionName(): string {
        return 'webhook';
    }

    public async getWebhook(
        code: string,
    ): Promise<WebhookSubscription | undefined> {
        const doc = await this.collection.findOne({
            code: code,
        });
        if (doc) {
            return doc;
        }
        return undefined;
    }

    public async getWebhookBySubdomainAndWs(
        subdomain: string,
        workspaceId: ObjectId
    ): Promise<WebhookSubscription | undefined> {
        const doc = await this.collection.findOne({
            subdomain: subdomain,
            workspaceId: workspaceId
        });
        if (doc) {
            return doc;
        }
        return undefined;
    }

    public async addWebhook(
        webhook: WebhookSubscription,
    ): Promise<WebhookSubscription> {
        const result = await this.collection.insertOne(webhook);
        return { ...webhook, _id: result.insertedId };
    }

    public async getAllForWorkspace(workspaceId: ObjectId): Promise<WebhookSubscription[]> {
        return await this.collection.find({
            workspaceId: workspaceId
        }).toArray();
    }

    public async deleteOne(code: string, workspaceId: ObjectId) {
        const result = await this.collection.deleteOne({
            code: code,
            workspaceId: workspaceId
        });
        return result.acknowledged;
    }
}

export const webhookRepositoryMongo = new WebhookRepositoryMongo();
