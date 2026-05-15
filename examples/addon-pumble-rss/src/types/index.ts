import { ObjectId } from "mongodb";

export type SubscribedFeed = {
    _id: ObjectId;
    code: string;
    workspaceId: ObjectId;
    workspaceUserId: ObjectId;
    channelId: ObjectId;
    link: string;
    title: string;
    lastFetchedAt: Date;
};

export type RemoveFeedResult = {
    message: string;
    channelId: string
}

export type WelcomeMessage = {
    _id: ObjectId;
    workspaceId: ObjectId;
    workspaceUserId: ObjectId;
}