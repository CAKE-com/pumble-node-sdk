import { ApiClient, OAuth2Client, V1 } from 'pumble-sdk';
import { SubscribedFeed } from '../types';
import { credentialsStore } from '../addon';
import { contentFormatService } from './ContentFormatService';
import { ADDON_APP_KEY, ADDON_CLIENT_ID, ADDON_CLIENT_SECRET } from '../config/config';
import { Logger } from '../utils/Logger';

class HomeViewService {
    private logger = Logger.getInstance(HomeViewService);

    public async publishHomeView(feedsWithChannelNames: Map<string, Array<SubscribedFeed>>, userId: any, client: ApiClient) {
        const payload: V1.PublishHomeViewRequest = {
            blocks: await contentFormatService.homeViewBlocks(feedsWithChannelNames)
        }

        try {
            await client.v1.app.publishHomeView(userId, payload)
        } catch (e) {
            this.logger.error(`Error publishing home view for ${userId} user on ${client.workspaceId} workspace.`, e)
        }
    }

    public async updateHomeView(workspaceId: any, userId: any, feedsWithChannelNames: Map<string, Array<SubscribedFeed>>) {
        const token = await credentialsStore.getUserToken(workspaceId, userId);

        if (token) {
            const auth = new OAuth2Client(
                ADDON_CLIENT_ID,
                ADDON_CLIENT_SECRET,
                ADDON_APP_KEY,
                token
            );
            const client = new ApiClient(auth, workspaceId, userId);

            try {
                await this.publishHomeView(feedsWithChannelNames, userId, client);
            } catch (e) {
                this.logger.error(`Error updating home view for ${userId} user on ${workspaceId} workspace.`, e)
            }
        
        }
    }
}

export const homeViewService = new HomeViewService();