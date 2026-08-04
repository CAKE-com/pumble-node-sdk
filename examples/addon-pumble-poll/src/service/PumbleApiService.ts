import {PUMBLE_APP_KEY, PUMBLE_APP_ID, PUMBLE_APP_CLIENT_SECRET} from "../config";
import {pumbleCredentialsRepositoryMongo} from "../persistence/PumbleCredentialsRepositoryMongo";
import {ApiClient, OAuth2Client, V1} from "pumble-sdk";
import ChannelInfo = V1.ChannelInfo;

class PumbleApiService {

    public async determinePostingPermissions(workspaceId : string, userId: string, channelId: string) {
        const userClient = await this.getUserClient(workspaceId, userId);
        const botUserId = await pumbleCredentialsRepositoryMongo.getBotUserId(workspaceId);

        let channelDetails: ChannelInfo;

        // If we cannot read channel details, we cannot post to that channel
        try {
            channelDetails = await userClient!.v1.channels.getChannelDetails(channelId);
        } catch (e) {
            return {canBotPost: false, canUserPost: false};

        }

        const userProfile = await userClient!.v1.users.userInfo(userId);

        let postingPermissions = channelDetails.channel.postingPermissions;
        let postingPermissionsGroup = postingPermissions.postingPermissionsGroup;
        if (postingPermissionsGroup === 'EVERYONE' || postingPermissionsGroup === 'EVERYONE_BUT_GUESTS') {
            return {canBotPost: true, canUserPost: true};
        } else {
            return {
                canBotPost: postingPermissions.workspaceUserIds!.includes(botUserId!),
                canUserPost: userProfile.role === 'ADMINISTRATOR' || userProfile.role === 'OWNER' || postingPermissions.workspaceUserIds!.includes(userId)
            };
        }
    }

    public async isAuthorized(userId: string, workspaceId: string): Promise<boolean> {
        const client = await this.getUserClient(workspaceId, userId);
        if (!client) return false;
        try {
            await client.v1.users.getProfile();
            return true;
        } catch (err) {
            return false;
        }
    }

    public async getBotClient(workspaceId: string) {
        const botToken = await pumbleCredentialsRepositoryMongo.getBotToken(workspaceId);
        const botUserId = await pumbleCredentialsRepositoryMongo.getBotUserId(workspaceId);
        if (botToken && botUserId) {
            const auth = new OAuth2Client(
                PUMBLE_APP_ID as string,
                PUMBLE_APP_CLIENT_SECRET as string,
                PUMBLE_APP_KEY as string,
                botToken
            );
            return new ApiClient(auth, workspaceId, botUserId);
        }
    }

    public async getUserClient(workspaceId: string, userId: string) {
        const botToken = await pumbleCredentialsRepositoryMongo.getUserToken(workspaceId, userId);
        if (botToken) {
            const auth = new OAuth2Client(
                PUMBLE_APP_ID as string,
                PUMBLE_APP_CLIENT_SECRET as string,
                PUMBLE_APP_KEY as string,
                botToken
            );
            return new ApiClient(auth, workspaceId, userId);
        }
    }
}

export const pumbleApiService = new PumbleApiService();
