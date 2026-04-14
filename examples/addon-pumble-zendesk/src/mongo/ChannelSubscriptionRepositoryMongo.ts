import {ObjectId} from "mongodb";
import {BaseRepositoryMongo} from "./BaseRepositoryMongo";
import {ChannelSubscription} from "../types";

class ChannelSubscriptionRepositoryMongo extends BaseRepositoryMongo<ChannelSubscription> {
    protected get collectionName(): string {
        return 'channel_subscription';
    }

    public async getSubsBySubdomain(
        subdomain: string
    ): Promise<ChannelSubscription[]> {
        const docs = await this.collection.find({
            subdomain: subdomain
        });
        return docs.toArray();
    }

    public async getSubsBySubdomainAndWs(
        subdomain: string,
        workspaceId: ObjectId
    ): Promise<ChannelSubscription[]> {
        const docs = await this.collection.find({
            subdomain: subdomain,
            workspaceId: workspaceId
        });
        return docs.toArray();
    }

    public async createSub(
        subdomain: string,
        workspaceId: ObjectId,
        channelId: ObjectId,
        filters?: string,
    ): Promise<boolean> {
        const sub: Omit<ChannelSubscription, "_id"> = {
            workspaceId: workspaceId,
            channelId: channelId,
            subdomain: subdomain,
            filters: filters
        };
        const result = await this.collection.updateOne(
            {
                workspaceId: workspaceId,
                channelId: channelId,
                subdomain: subdomain
            },
            {
                $set: sub,
            },
            { upsert: true }
        );
        return result.acknowledged;
    }

    public async deleteSub(
        subdomain: string,
        workspaceId: ObjectId,
        channelId: ObjectId
    ): Promise<boolean> {
        const result = await this.collection.deleteOne(
            {
                workspaceId: workspaceId,
                channelId: channelId,
                subdomain: subdomain
            }
        );
        return result.acknowledged;
    }

    public async deleteSubById(
        subscriptionId: ObjectId,
    ): Promise<boolean> {
        const result = await this.collection.deleteOne(
            {
                _id: subscriptionId,
            }
        );
        return result.acknowledged;
    }

    public async deleteSubs(
        workspaceId: ObjectId
    ): Promise<boolean> {
        const result = await this.collection.deleteMany(
            {
                workspaceId: workspaceId
            }
        );
        return result.acknowledged;
    }
}

export const channelSubscriptionRepositoryMongo = new ChannelSubscriptionRepositoryMongo();
