import { ApiClient, V1 } from 'pumble-sdk';
import { authService } from './AuthService';
import { MessageFormatter } from '../utils/MessageFormatter';
import { channelSubscriptionRepositoryMongo } from '../mongo/ChannelSubscriptionRepositoryMongo';
import { ObjectId } from 'mongodb';


class HomeViewService {
    public async publishHomeViewForUser(workspaceId: string, workspaceUserId: string, botClient?: ApiClient, isPartOfBulkUpdate: boolean = false) {
        if (!botClient) {
            return;
        }
        const auth = await authService.getAuth(workspaceId, workspaceUserId);
        if (!auth && isPartOfBulkUpdate) {
            return;
        }
        const subs = auth ? await channelSubscriptionRepositoryMongo.getSubsBySubdomainAndWs(auth.subdomain, new ObjectId(workspaceId)) : [];
        await botClient?.v1.app.publishHomeView(workspaceUserId, { blocks: MessageFormatter.generateHomeView(subs, auth) });
    }

    public async publishHomeViewForAffectedUsers(workspaceId: string, channel: V1.ChannelInfo, botClient: ApiClient) {
        if (channel?.users) {
            for (const userId of channel.users) {
                this.publishHomeViewForUser(workspaceId, userId, botClient, true);
            }
        }
    }
}

export const homeViewService = new HomeViewService();