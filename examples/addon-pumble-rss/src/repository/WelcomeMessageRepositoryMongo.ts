import {BaseRepositoryMongo} from "./BaseRepositoryMongo";
import {WelcomeMessage} from "../types";
import {ObjectId} from "mongodb";

class WelcomeMessageRepositoryMongo extends BaseRepositoryMongo<WelcomeMessage> {
    protected get collectionName(): string {
        return "welcome_message";
    }

    public async usersReceivedWelcomeMessage(workspaceId: ObjectId): Promise<WelcomeMessage[]> {
        const result = this.collection.find({ workspaceId: workspaceId });
        return await result.toArray();
    }

    public async create(workspaceId: ObjectId, workspaceUserId: ObjectId) {
        const result = await this.collection.insertOne({
            _id: new ObjectId(),
            workspaceId: workspaceId,
            workspaceUserId: workspaceUserId
        });
        return result.acknowledged;
    }
}

export const welcomeMessageRepository = new WelcomeMessageRepositoryMongo();