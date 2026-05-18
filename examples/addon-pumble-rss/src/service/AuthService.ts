import {ApiClient, OAuth2Client} from "pumble-sdk";
import {welcomeMessageRepository} from "../repository/WelcomeMessageRepositoryMongo";
import {ObjectId} from "mongodb";
import {Logger} from "../utils/Logger";
import {Mutex} from "async-mutex";
import {
    ADDON_APP_KEY,
    ADDON_CLIENT_ID,
    ADDON_CLIENT_SECRET,
    APP_BASE_URL,
    PUMBLE_APP_URL
} from "../config/config";
import {contentFormatService} from "./ContentFormatService";
import {promises as fs} from "fs";

class AuthService {
    private logger = Logger.getInstance(AuthService);

    static welcomeMessageMutex = new Mutex();

    public async getClientFor(workspaceId: string, userId: string, token: string): Promise<ApiClient> {
        const auth = new OAuth2Client(
            ADDON_CLIENT_ID,
            ADDON_CLIENT_SECRET,
            ADDON_APP_KEY,
            token
        );

        return new ApiClient(auth, workspaceId, userId);
    }

    public async sendWelcomeMessages(client: ApiClient, workspaceId: string, workspaceUserId: string, botUserId: string) {
        const release = await AuthService.welcomeMessageMutex.acquire();
        try {
            const receivedWelcomeMessages = await welcomeMessageRepository.usersReceivedWelcomeMessage(new ObjectId(workspaceId));
            let workspaceUsers = await client.v1.users.listWorkspaceUsers();
            workspaceUsers = workspaceUsers.filter(u => u.status === "ACTIVATED" && !u.isPumbleBot && !u.isAddonBot && !u.role.includes("GUEST"));
            const channels = (await client.v1.channels.listChannels(['DIRECT'])).filter(ch => ch.users?.includes(botUserId));
            const listingUrl = await this.getListingUrl(workspaceId);

            for (const workspaceUser of workspaceUsers) {
                if (!receivedWelcomeMessages.some(rwm => rwm.workspaceUserId.toHexString() === workspaceUser.id)) {
                    const botDm = channels.find(ch => ch.users?.includes(workspaceUser.id) && ch.users?.includes(botUserId));
                    const messageBlocks = (!receivedWelcomeMessages || receivedWelcomeMessages.length == 0) && workspaceUserId === workspaceUser.id ?
                        contentFormatService.welcomeMessageInstallerBlocks(workspaceId, botDm?.channel.id) :
                        contentFormatService.welcomeMessageUsersBlocks(listingUrl);
                    try {
                        await client.v1.messages.dmUser(workspaceUser.id, { blocks: messageBlocks, text: '' });
                        await welcomeMessageRepository.create(new ObjectId(workspaceUser.workspaceId), new ObjectId(workspaceUser.id));
                    } catch (e) {
                        // ignored
                        this.logger.error(`Failed to send welcome message to ${workspaceUser.workspaceId} ${workspaceUser.id}`);
                    }
                }
            }
        } finally {
            release();
        }
    }

    public async getListingUrl(workspaceId: string) {
        const {
            scopes: { botScopes, userScopes },
        } = JSON.parse((await fs.readFile('manifest.json')).toString());
        const redirectUrl = new URL(APP_BASE_URL);
        const scopes = [...userScopes, ...botScopes.map((scope: string) => `bot:${scope}`)].join(',');
        const url = new URL(PUMBLE_APP_URL);
        url.pathname = 'access-request';
        url.searchParams.set('redirectUrl', redirectUrl.toString());
        url.searchParams.set('scopes', scopes);
        url.searchParams.set('clientId', ADDON_CLIENT_ID);
        url.searchParams.set('defaultWorkspaceId', workspaceId);
        return url.toString();
    }
}

export const authService = new AuthService();