import { BaseRepositoryMongo } from './BaseRepositoryMongo';
import { ObjectId } from 'mongodb';
import { ChannelSubscription, WelcomeMessage } from '../types';


class WelcomeMessageRepositoryMongo extends BaseRepositoryMongo<WelcomeMessage> {
    protected get collectionName(): string {
        return 'welcome_message';
    }

    public async usersReceivedWelcomeMessage(workspaceId: ObjectId): Promise<WelcomeMessage[]> {
        const result = this.collection.find(
            {
                workspaceId: workspaceId
            }
        );
        return await result.toArray();
    }

    public async create(workspaceId: ObjectId, workspaceUserId: ObjectId) {
        const wm: WelcomeMessage = {
            _id: new ObjectId(),
            workspaceId: workspaceId,
            workspaceUserId: workspaceUserId
        };
        const result = await this.collection.insertOne(wm);
        return result.acknowledged;
    }
}

export const welcomeMessageRepository = new WelcomeMessageRepositoryMongo();