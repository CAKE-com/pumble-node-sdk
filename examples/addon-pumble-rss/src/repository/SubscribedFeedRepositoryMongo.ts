import { FindCursor, ObjectId } from "mongodb";
import { SubscribedFeed } from "../types";
import { BaseRepositoryMongo } from "./BaseRepositoryMongo";
import { BATCH_SIZE } from "../config/config";

class SubscribedFeedRepositoryMongo extends BaseRepositoryMongo<SubscribedFeed> {
    protected get collectionName(): string {
        return 'subscribed_feed';
    }

    public async create(workspaceId: string, workspaceUserId: string, channelId: string, link: string, title: string, lastFetchedAt: Date): Promise<ObjectId> {
        var result = await this.collection.insertOne({
            _id: new ObjectId(),
            code: Math.random().toString(36).slice(2).toUpperCase(),
            workspaceId: new ObjectId(workspaceId),
            workspaceUserId: new ObjectId(workspaceUserId),
            channelId: new ObjectId(channelId),
            link: link,
            title: title,
            lastFetchedAt: lastFetchedAt
        });

        return result.insertedId;
    }

    public async update(id: ObjectId, lastFetchedAt: Date) {
        await this.collection.updateOne({_id: id}, {$set: {lastFetchedAt: lastFetchedAt}});
    }

    public async remove(code: string, workspaceId: string, channelId: string) {
        await this.collection.deleteOne({
            code: code,
            workspaceId: new ObjectId(workspaceId),
            channelId: new ObjectId(channelId)
        });
    }

    public async list(workspaceId: string, channelId: string): Promise<Array<SubscribedFeed>> {
        return this.collection.find({
            workspaceId: new ObjectId(workspaceId),
            channelId: new ObjectId(channelId)
        }).toArray();
    }

    public async listWorkspaceFeeds(workspaceId: string): Promise<Array<SubscribedFeed>> {
        return this.collection.find({
            workspaceId: new ObjectId(workspaceId)
        }).toArray();
    }

    public async listAll(): Promise<FindCursor<SubscribedFeed>> {
        return this.collection.find().sort({workspaceId: 1}).batchSize(BATCH_SIZE);
    }

    public async find(code: string, workspaceId: string, channelId: string): Promise<SubscribedFeed | null> {
        return this.collection.findOne({
            code: code,
            workspaceId: new ObjectId(workspaceId),
            channelId: new ObjectId(channelId)
        });
    }

    public async findById(id: string): Promise<SubscribedFeed | null> {
        return this.collection.findOne({
            _id: new ObjectId(id)
        });
    }
}

export const subscribedFeedRepository = new SubscribedFeedRepositoryMongo();