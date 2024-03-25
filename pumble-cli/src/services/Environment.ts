import { promises as fs } from 'fs';
import { cliGlobals } from './Globals';
const LOCAL_FILENAME = '.pumbleapprc';

export const PUMBLE_ACCESS_TOKEN_KEY = 'PUMBLE_ACCESS_TOKEN';
export const PUMBLE_REFRESH_TOKEN_KEY = 'PUMBLE_REFRESH_TOKEN';
export const PUMBLE_WORKSPACE_ID_KEY = 'PUMBLE_WORKSPACE_ID';
export const PUMBLE_WORKSPACE_USER_ID_KEY = 'PUMBLE_WORKSPACE_USER_ID';

class Environment {
    get workspaceId() {
        return process.env[PUMBLE_WORKSPACE_ID_KEY];
    }

    get workspaceUserId() {
        return process.env[PUMBLE_WORKSPACE_USER_ID_KEY];
    }

    get accessToken() {
        return process.env[PUMBLE_ACCESS_TOKEN_KEY];
    }

    get refreshToken() {
        return process.env[PUMBLE_REFRESH_TOKEN_KEY];
    }

    get pumbleApiUrl() {
        return process.env.PUMBLE_API_URL || 'https://api-ga.pumble.com';
    }

    get allowSyncingPublishedApps() {
        return process.env.ALLOW_SYNCING_PUBLISHED_APPS === 'true';
    }

    public async setGlobalEnvironment(payload: Record<string, string>) {
        await this.setEnvironment(cliGlobals.globalConfigFile, payload);
    }

    public async deleteGlobalEnvironment(...keys: string[]) {
        await this.deleteEnvironment(cliGlobals.globalConfigFile, ...keys);
    }

    public async setLocalEnvironment(payload: Record<string, string>) {
        await this.setEnvironment(LOCAL_FILENAME, payload);
    }

    public async deleteLocalEnvironment(...keys: string[]) {
        await this.deleteEnvironment(LOCAL_FILENAME, ...keys);
    }

    public async loadEnvironment() {
        await this.loadFileEnvironment(LOCAL_FILENAME);
        await this.loadFileEnvironment(cliGlobals.globalConfigFile);
    }

    private async setEnvironment(filename: string, payload: Record<string, string>): Promise<void> {
        try {
            const file = JSON.parse((await fs.readFile(filename)).toString());
            const newJson = { ...file, ...payload };
            await fs.writeFile(filename, JSON.stringify(newJson, null, 4));
        } catch (err) {
            await fs.writeFile(filename, JSON.stringify(payload, null, 4));
        }
        await this.loadFileEnvironment(filename);
    }

    private async deleteEnvironment(filename: string, ...keys: string[]) {
        try {
            const file = JSON.parse((await fs.readFile(filename)).toString());
            for (const key of keys) {
                delete file[key];
                delete process.env[key];
            }
            await fs.writeFile(filename, JSON.stringify(file, null, 4));
        } catch (err) {}
        await this.loadFileEnvironment(filename);
    }

    private async loadFileEnvironment(filename: string) {
        try {
            const file = JSON.parse((await fs.readFile(filename)).toString());
            Object.entries(file).forEach((entry) => {
                if (entry[1] && typeof entry[1] === 'string') {
                    process.env[entry[0]] = entry[1];
                }
            });
        } catch (err) {}
    }
}

export const cliEnvironment = new Environment();
