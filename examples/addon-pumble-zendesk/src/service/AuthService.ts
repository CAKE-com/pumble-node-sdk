import {CLIENT_ID, CLIENT_SECRET, REDIRECT_URI} from "../config/config";
import { IntegrationError, ZendeskAuth, ZendeskUserData, ZendeskUsersData } from '../types';
import {authRepositoryMongo} from "../mongo/AuthRepositoryMongo";
import {ObjectId} from "mongodb";
import {logger} from "../utils/Logger";
import { ApiClient, V1 } from 'pumble-sdk';
import SendMessagePayload = V1.SendMessagePayload;
import {zendeskClient} from "../client/ZendeskClient";
import { homeViewService } from './HomeViewService';
import { MessageFormatter } from '../utils/MessageFormatter';
import { generateRedirectUrl } from '../utils/utils';
import { welcomeMessageRepository } from '../mongo/WelcomeMessageRepositoryMongo';
import { welcomeMessageInstaller, welcomeMessageUser } from '../utils/constants';
import { Mutex } from 'async-mutex';

class AuthService {

    static welcomeMessageMutex = new Mutex();

    public async completeSetup(code: string, subdomain: string, workspaceId: string, workspaceUserId: string): Promise<ZendeskAuth | undefined> {
        try {
            const response = await zendeskClient.sendRequest(`https://${subdomain}.zendesk.com/oauth/tokens`, 'POST', {
                grant_type: "authorization_code",
                code: code,
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                redirect_uri: REDIRECT_URI,
                scope: "read write",
                expires_in: 86400
            });
            if (!response.ok) {
                logger.error(`Error on completing setup with status and reason ${response.status} ${await response.text()}`);
                return undefined;
            }

            const tokens = await response.json();
            const auth = {
                workspaceId: new ObjectId(workspaceId),
                workspaceUserId: new ObjectId(workspaceUserId),
                subdomain: subdomain,
                accessToken: tokens.access_token,
                refreshToken: tokens.refresh_token,
                tokenType: tokens.token_type,
                scope: tokens.scope,
                expiresAt: new Date().getTime() + tokens.expires_in * 1000,
                refreshTokenExpiresAt: new Date().getTime() + tokens.refresh_token_expires_in * 1000,
            };

            const userData = await this.getZendeskUserDetails(auth.subdomain, auth.accessToken);

            if (!userData) {
                logger.error("Error on completing setup, failed to fetch user from Zendesk");
                return undefined;
            }

            await this.addAuth({
                ...auth,
                userId: +userData.user.id,
                email: userData.user.email
            });
            return this.getAuth(auth.workspaceId.toHexString(), auth.workspaceUserId.toHexString());
        } catch (error) {
            logger.error(`Error on completing setup ${error}`, error);
            return undefined;
        }
    }

    public async getAuth(workspaceId: string, workspaceUserId: string): Promise<ZendeskAuth | undefined> {
        const auth = await authRepositoryMongo.getAuth(new ObjectId(workspaceId), new ObjectId(workspaceUserId));
        if (auth) {
            return await this.refreshTokenIfExpired(auth);
        }
        return auth;
    }

    public async getAnyWsAuth(workspaceId: string): Promise<ZendeskAuth | undefined> {
        let auth = await authRepositoryMongo.getAnyWsAuth(new ObjectId(workspaceId));
        if (auth) {
            return await this.refreshTokenIfExpired(auth);
        }
        return auth;
    }

    public async getAuthByWorkspaceAndZendeskUserId(workspaceId: string, userId: number): Promise<ZendeskAuth | undefined> {
        const auth = await authRepositoryMongo.getAuthByWorkspaceAndZendeskUserId(new ObjectId(workspaceId), userId);
        if (auth) {
            return await this.refreshTokenIfExpired(auth);
        }
        return auth;
    }

    public async getLatestAuthForWs(workspaceId: string, subdomain: string): Promise<ZendeskAuth | undefined> {
        const auths = (await authRepositoryMongo.getAuths(new ObjectId(workspaceId), subdomain)).sort((a, b) => b.expiresAt - a.expiresAt);
        if (auths && auths.length > 0) {
            logger.info(`Refreshing expired token for ${auths[0].userId}...`);
            return await this.refreshTokenIfExpired(auths[0]);
        }
        return undefined;
    }

    public async addAuth(auth: Omit<ZendeskAuth, "_id">): Promise<boolean> {
        return await authRepositoryMongo.addAuth(auth);
    }

    public async updateAuth(auth: ZendeskAuth): Promise<boolean> {
        return await authRepositoryMongo.updateAuth(auth);
    }

    public async deleteAuth(workspaceId: string, workspaceUserId: string, botClient?: ApiClient): Promise<boolean> {
        const deleted = await authRepositoryMongo.deleteAuth(new ObjectId(workspaceId), new ObjectId(workspaceUserId));
        if (botClient) {
            await homeViewService.publishHomeViewForUser(workspaceId, workspaceUserId, botClient);
            const userDm = await botClient.v1.channels.getDirectChannel([workspaceUserId]);
            await botClient?.v1.messages.postEphemeral(userDm.channel.id, deleted ? "Successfully disconnected" : "No connected Zendesk accounts to disconnect", workspaceUserId);
        }
        return deleted;
    }

    public async deleteAuths(workspaceId: string): Promise<boolean> {
        return await authRepositoryMongo.deleteAuths(new ObjectId(workspaceId));
    }

    public async getZendeskUserDetails(subdomain: string, token: string, userId?: number): Promise<ZendeskUserData | undefined> {
        try {
            const userResponse = await zendeskClient.sendRequest(`https://${subdomain}.zendesk.com/api/v2/users/${userId ?? "me"}.json`, 'GET', undefined, token);
            if (!userResponse.ok) {
                if (userResponse.status !== 404) {
                    logger.error(`Failed to fetch Zendesk user ${userResponse.status} ${await userResponse.text()}`);
                }
                return undefined;
            }
            return await userResponse.json();
        } catch (err) {
            logger.error(`Failed to fetch Zendesk user ${err}`, err);
        }
        return undefined;
    }

    public async getZendeskUsersDetails(auth: ZendeskAuth): Promise<ZendeskUsersData> {
        try {
            const userResponse = await zendeskClient.sendRequest(`https://${auth.subdomain}.zendesk.com/api/v2/users.json?role[]=admin&role[]=agent`, 'GET', undefined, auth.accessToken);
            if (!userResponse.ok) {
                logger.error(`Error on fetching users details ${await userResponse.text()}`);
                return { users: [] };
            }
            return await userResponse.json();
        } catch (err) {
            logger.error("Failed to fetch multiple Zendesk users", err);
        }
        return { users: [] };
    }

    /*public async getZendeskUsersDetailsForCurrentOrg(auth: ZendeskAuth): Promise<ZendeskUsersData> {
        try {
            const userResponse = await zendeskClient.sendRequest(`https://${auth.subdomain}.zendesk.com/api/v2/organizations/${auth.organizationId}/users.json?role[]=admin&role[]=agent`, 'GET', undefined, auth.accessToken);
            if (!userResponse.ok) {
                logger.error(`Error on fetching users details ${await userResponse.text()}`);
                return { users: [] };
            }
            return await userResponse.json();
        } catch (err) {
            logger.error("Failed to fetch multiple Zendesk users", err);
        }
        return { users: [] };
    }

    public async getZendeskOrgName(subdomain: string, organizationId: number, token: string): Promise<string | undefined> {
        try {
            const userResponse = await zendeskClient.sendRequest(`https://${subdomain}.zendesk.com/api/v2/organizations/${organizationId}`, 'GET', undefined, token);
            if (!userResponse.ok) {
                logger.error(`Error on fetching users details ${await userResponse.text()}`);
                return undefined;
            }
            return (await userResponse.json()).organization.name;
        } catch (err) {
            logger.error("Failed to fetch multiple Zendesk users", err);
        }
        return undefined;
    }

    public async getZendeskGroupsDetails(auth: ZendeskAuth): Promise<ZendeskGroupsData> {
        try {
            const groupsResponse = await zendeskClient.sendRequest(`https://${auth.subdomain}.zendesk.com/api/v2/groups`, 'GET', undefined, auth.accessToken);
            if (!groupsResponse.ok) {
                logger.error(`Error on fetching user groups ${await groupsResponse.text()}`);
                return { groups: [] };
            }
            return await groupsResponse.json();
        } catch (err) {
            logger.error("Failed to fetch multiple Zendesk groups", err);
        }
        return { groups: [] };
    }

    static organizationSyncMutex = new Mutex();

    public async updateOrganization(zendeskUserId: number, organizationId: number, addonUtils: { getBotClient: (workspace: string) => Promise<ApiClient | undefined>}) {
        const release = await AuthService.organizationSyncMutex.acquire();
        try {
            const auths = await authRepositoryMongo.getAuthsByZendeskUserId(zendeskUserId);
            for (const auth of auths) {
                const orgName = await this.getZendeskOrgName(auth.subdomain, organizationId, auth.accessToken);
                await authRepositoryMongo.updateAuth({ ...auth, organizationId: organizationId, organizationName: orgName });
                const botClient = await addonUtils.getBotClient(auth.workspaceId.toHexString());
                botClient?.v1.messages.dmUser(auth.workspaceUserId.toHexString(), `Your account is transferred to \`${orgName}\` organization`);
                homeViewService.publishHomeViewForUser(auth.workspaceId.toHexString(), auth.workspaceUserId.toHexString(), botClient, false);
            }
        } finally {
            release();
        }
    }

    public async removeOrganization(zendeskUserId: number, organizationId: number | undefined, addonUtils: { getBotClient: (workspace: string) => Promise<ApiClient | undefined>}) {
        const release = await AuthService.organizationSyncMutex.acquire();
        try {
            const auths = await authRepositoryMongo.getAuthsByZendeskUserId(zendeskUserId);
            for (const auth of auths) {
                if (auth.organizationId === organizationId) {
                    await authRepositoryMongo.updateAuth({ ...auth, organizationId: undefined, organizationName: undefined });
                    await homeViewService.publishHomeViewForUser(auth.workspaceId.toHexString(), auth.workspaceUserId.toHexString(), await addonUtils.getBotClient(auth.workspaceId.toHexString()), false);
                }
            }
        } finally {
            release();
        }
    }*/

    public async refreshTokens() {
        const checkTokensBefore = new Date().getTime() + (3 * 24 * 60 * 60 * 1000);
        const auths = await authRepositoryMongo.getAuthsThatExpireSoon(checkTokensBefore);
        for (const auth of auths) {
            try {
                await this.refreshAccessToken(auth);
            } catch (err) {
                logger.error("Error on refresh token", err);
            }
        }
    }

    public async refreshTokenIfExpired(auth: ZendeskAuth): Promise<ZendeskAuth> {
        if (auth.expiresAt <= new Date().getTime() + 1000) {
            return await this.refreshAccessToken(auth);
        }

        return auth;
    }

    public async refreshAccessToken(userAuth: ZendeskAuth): Promise<ZendeskAuth> {
        const response = await zendeskClient.sendRequest(`https://${userAuth.subdomain}.zendesk.com/oauth/tokens`, 'POST', {
                grant_type: "refresh_token", refresh_token: userAuth.refreshToken,
                client_id: CLIENT_ID, client_secret: CLIENT_SECRET,
                redirect_uri: REDIRECT_URI, scope: "read write",
                expires_in: 86400, refresh_token_expires_in: 2592000
            }
        );
        if (!response.ok) {
            let data = {error_description: "Error occurred"};
            try {
                data = await response.json();
            } catch (err) {
                logger.error("Failed to parse response ", await response.text());
            }
            throw new IntegrationError(
                this.createAuthorizationUrlMessage(
                    'Something went wrong, please reauthorize yourself.',
                    "Reauthorize",
                    userAuth.workspaceId.toHexString(),
                    userAuth.workspaceUserId.toHexString(),
                    userAuth.subdomain
                ),
                `${data.error_description}`
            );
        }
        const tokens = await response.json();
        const expiresAt = new Date().getTime() + (tokens?.expires_in ?? 86400) * 1000;
        const refreshTokenExpiresAt = new Date().getTime() + (tokens?.refresh_token_expires_in ?? 2592000) * 1000;
        await authRepositoryMongo.updateTokens(
            userAuth,
            tokens.access_token,
            tokens.refresh_token,
            expiresAt,
            refreshTokenExpiresAt
        );
        return {
            ...userAuth,
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
            expiresAt,
            refreshTokenExpiresAt
        };
    }

    public async notifyUserRoleUpdated(workspaceId: string, email: string, subdomain: string, botClient: ApiClient) {
        const user = (await botClient.v1.users.listWorkspaceUsers()).find(u => u.email === email);
        if (!user) {
            return;
        }
        const msg = this.createAuthorizationUrlMessage(
            'Your role has been updated, please reauthorize yourself in order to be able to use new permissions.',
            "Reauthorize",
            workspaceId,
            user.id,
            subdomain
        );
        await botClient.v1.messages.dmUser(user.id, msg);
    }

    public createAuthorizationUrlMessage(
        preText: string,
        actionName: string,
        workspaceId: string,
        workspaceUserId: string,
        subdomain: string,
    ): SendMessagePayload {
        return {
            text: `${preText}`,
            blocks: MessageFormatter.generateConnectOrgLinkMessage(preText, actionName, generateRedirectUrl(subdomain, workspaceId, workspaceUserId)),
        };
    }

    public async sendWelcomeMessages(client: ApiClient, workspaceId: string, workspaceUserId: string, botUserId: string) {
        const release = await AuthService.welcomeMessageMutex.acquire();
        try {
            const receivedWelcomeMessages = await welcomeMessageRepository.usersReceivedWelcomeMessage(new ObjectId(workspaceId));
            let workspaceUsers = await client.v1.users.listWorkspaceUsers();
            workspaceUsers = workspaceUsers.filter(u => u.status === "ACTIVATED" && !u.isPumbleBot && !u.isAddonBot && !u.role.includes("GUEST"));
            const channels = (await client.v1.channels.listChannels(['DIRECT'])).filter(ch => ch.users?.includes(botUserId));

            for (const workspaceUser of workspaceUsers) {
                if (!receivedWelcomeMessages.some(rwm => rwm.workspaceUserId.toHexString() === workspaceUser.id)) {
                    const botDm = channels.find(ch => ch.users?.includes(workspaceUser.id) && ch.users?.includes(botUserId));
                    const message = (!receivedWelcomeMessages || receivedWelcomeMessages.length == 0) && workspaceUserId === workspaceUser.id ?
                        welcomeMessageInstaller(workspaceId, botDm?.channel?.id) : welcomeMessageUser(workspaceId, botDm?.channel?.id);
                    try {
                        await client.v1.messages.dmUser(workspaceUser.id, message);
                        await welcomeMessageRepository.create(new ObjectId(workspaceUser.workspaceId), new ObjectId(workspaceUser.id));
                    } catch (e) {
                        // ignored
                        logger.error(`Failed to send welcome message to ${workspaceUser.workspaceId} ${workspaceUser.id}`);
                    }
                }
            }
        } finally {
            release();
        }
    }
}

export const authService = new AuthService();