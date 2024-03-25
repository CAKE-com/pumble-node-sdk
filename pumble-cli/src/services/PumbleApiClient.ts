import axios, { AxiosError, AxiosInstance } from 'axios';

type TokensResponse = { token: string; refreshToken: string };
type WorkspaceResponse = {
    workspace: { id: string; name: string };
    workspaceUser: { id: string };
    exchangeToken: string;
};
import { PUMBLE_ACCESS_TOKEN_KEY, cliEnvironment, PUMBLE_REFRESH_TOKEN_KEY } from './Environment';
import { cliLogin } from './Login';
import { AddonManifest } from '../types';
import { logger } from './Logger';

type LeadLoginResponse = {
    items: WorkspaceResponse[];
};

class PumbleApiClient {
    private client: AxiosInstance;

    public constructor() {
        this.client = axios.create({ baseURL: cliEnvironment.pumbleApiUrl });
        this.client.interceptors.response.use(undefined, async (error: AxiosError) => {
            if (error.response?.status === 401) {
                const refreshToken = cliEnvironment.refreshToken;
                const workspaceId = cliEnvironment.workspaceId;

                if (refreshToken && workspaceId) {
                    try {
                        const newAxios = axios.create({ baseURL: cliEnvironment.pumbleApiUrl });
                        const tokens = await this.refreshToken(refreshToken, workspaceId, newAxios);
                        await cliEnvironment.setGlobalEnvironment({
                            [PUMBLE_ACCESS_TOKEN_KEY]: tokens.token,
                            [PUMBLE_REFRESH_TOKEN_KEY]: tokens.refreshToken,
                        });
                        if (error.config && tokens) {
                            return await axios({
                                ...error.config,
                                headers: { ...error.config.headers, Authtoken: tokens.token },
                            });
                        }
                    } catch (err) {
                        await cliLogin.logout();
                        logger.error('Invalid login');
                        await cliLogin.login();
                    }
                }
            }
            throw error;
        });
    }

    public async lead(email: string): Promise<string> {
        const {
            data: { id: leadId },
        } = await this.client.post('/lead', { email });
        return leadId;
    }

    public async activateLead(email: string, code: string): Promise<void> {
        await this.client.post('/lead/activate', { email, code });
    }

    public async leadLogin(leadId: string): Promise<LeadLoginResponse> {
        const { data } = await this.client.post<LeadLoginResponse>('/lead/login', { leadId });
        return data;
    }

    public async createWorkspace(workspaceName: string, leadId: string): Promise<WorkspaceResponse> {
        const timeZoneId = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const payload = { workspaceName, timeZoneId, leadId };
        const { data } = await this.client.post<WorkspaceResponse>('/createWorkspace', payload);
        return data;
    }

    public async exchangeToken(workspaceId: string, exchangeToken: string): Promise<TokensResponse> {
        const { data } = await this.client.post<TokensResponse>(`/workspaces/${workspaceId}/exchange`, {
            exchangeToken,
        });
        return data;
    }

    public async getApp(appId: string): Promise<AddonManifest> {
        await this.checkLogin();
        const { data: pumbleApp } = await this.client.get<AddonManifest>(
            `/workspaces/${cliEnvironment.workspaceId}/workspaceUsers/${cliEnvironment.workspaceUserId}/apps/mine/${appId}`,
            { headers: { Authtoken: cliEnvironment.accessToken } }
        );
        return pumbleApp;
    }

    public async createApp(manifest: AddonManifest) {
        await this.checkLogin();
        const { data: pumbleApp } = await this.client.post<AddonManifest>(
            `/workspaces/${cliEnvironment?.workspaceId}/workspaceUsers/${cliEnvironment?.workspaceUserId}/apps`,
            manifest,
            { headers: { Authtoken: cliEnvironment.accessToken } }
        );
        return pumbleApp;
    }

    public async updateApp(appId: string, manifest: AddonManifest) {
        await this.checkLogin();
        const { data: pumbleApp } = await this.client.put(
            `/workspaces/${cliEnvironment.workspaceId}/workspaceUsers/${cliEnvironment.workspaceUserId}/apps/${appId}`,
            manifest,
            { headers: { Authtoken: cliEnvironment.accessToken } }
        );
        return pumbleApp;
    }

    public async listApps(): Promise<any[]> {
        await this.checkLogin();
        const { data: apps } = await this.client.get(
            `/workspaces/${cliEnvironment.workspaceId}/workspaceUsers/${cliEnvironment.workspaceUserId}/apps/mine`,
            { headers: { Authtoken: cliEnvironment.accessToken } }
        );
        return apps;
    }

    public async getRedirectUrl(
        originalApp: AddonManifest,
        newManifest: AddonManifest,
        reinstall: boolean = false
    ): Promise<{ redirectUrl: string; code: string }> {
        await this.checkLogin();
        const newAppScopes: { botScopes: string[]; userScopes: string[] } = newManifest.scopes;
        const scopesStr = [...newAppScopes.userScopes, ...newAppScopes.botScopes.map((x) => `bot:${x}`)].join(',');
        const url = `/workspaces/${cliEnvironment.workspaceId}/workspaceUsers/${cliEnvironment.workspaceUserId}/oauth2/grant`;
        const {
            data: { code, redirectUrl },
        } = await this.client.get(url, {
            params: {
                clientId: originalApp.id,
                scopes: scopesStr,
                redirectUrl: newManifest.redirectUrls[0],
                isReinstall: reinstall ? 'true' : 'false',
            },
            headers: { Authtoken: cliEnvironment.accessToken },
        });
        return { code, redirectUrl };
    }

    public async getAuthorizedApps() {
        await this.checkLogin();
        const { data: result } = await this.client.get<{ app: { id: string } }[]>(
            `/workspaces/${cliEnvironment.workspaceId}/workspaceUsers/${cliEnvironment.workspaceUserId}/apps/authorizations`,
            {
                headers: { Authtoken: cliEnvironment.accessToken },
            }
        );
        return result;
    }

    public async getWorkspaceInfo() {
        const { data: result } = await this.client.get<{ id: string; name: string }>(
            `/workspaces/${cliEnvironment.workspaceId}/info`
        );
        return result;
    }

    public async userInfo() {
        const { data: result } = await this.client.get<{ id: string; name: string; email: string }>(
            `/workspaces/${cliEnvironment.workspaceId}/workspaceUsers/${cliEnvironment.workspaceUserId}`
        );
        return result;
    }

    private async checkLogin(): Promise<void> {
        if (!cliLogin.isLoggedIn()) {
            await cliLogin.login();
        } else {
            if (this.isTokenExpired(cliEnvironment.accessToken!)) {
                if (!this.isTokenExpired(cliEnvironment.refreshToken!)) {
                    try {
                        const tokens = await this.refreshToken(
                            cliEnvironment.refreshToken!,
                            cliEnvironment.workspaceId!
                        );
                        await cliEnvironment.setGlobalEnvironment({
                            [PUMBLE_ACCESS_TOKEN_KEY]: tokens.token,
                            [PUMBLE_REFRESH_TOKEN_KEY]: tokens.refreshToken,
                        });
                    } catch (err) {
                        await cliLogin.logout();
                        await cliLogin.login();
                    }
                } else {
                    await cliLogin.logout();
                    await cliLogin.login();
                }
            }
        }
    }

    private async refreshToken(
        refreshToken: string,
        workspaceId: string,
        client: AxiosInstance = this.client
    ): Promise<TokensResponse> {
        const { data: tokens } = await client.post<TokensResponse>(`/workspaces/${workspaceId}/refresh`, {
            refreshToken,
        });
        return tokens;
    }

    private isTokenExpired(accessToken: string): boolean {
        try {
            const decoded = Buffer.from(accessToken.split('.')[1], 'base64');
            const payload = JSON.parse(decoded.toString());
            const exp = payload.exp * 1000;
            return new Date().getTime() > exp;
        } catch (err) {
            return true;
        }
    }
}

export const cliPumbleApiClient = new PumbleApiClient();
