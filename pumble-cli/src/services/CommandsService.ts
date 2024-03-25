import { cyan, green } from 'ansis';
import { cliAppDirectory } from './AppDirectory';
import { createAddon } from './Create';
import { cliEnvironment } from './Environment';
import { cliGlobals } from './Globals';
import { logger } from './Logger';
import { cliLogin } from './Login';
import { cliPumbleApiClient } from './PumbleApiClient';
import { startUpdater, startWatcher } from './Watcher';
import { table } from 'table';
import { AxiosError } from 'axios';
import prompts from 'prompts';

class CommandsService {
    public async createApp(globalConfigFile: string) {
        await this.loadEnvironment(globalConfigFile);
        createAddon();
    }

    public async login(globalConfigFile: string, force?: boolean) {
        try {
            await this.loadEnvironment(globalConfigFile);
            const isAlreadyLoggedIn = await cliLogin.login();
            if (isAlreadyLoggedIn) {
                if (force) {
                    await cliLogin.logout();
                    await cliLogin.login();
                } else {
                    logger.warning(
                        `Already logged in. Use ` +
                            cyan`'--force'` +
                            ` to ignore the existing login or logout with ` +
                            cyan`'pumble-cli logout'`
                    );
                }
            }
        } catch (err) {
            this.handleCommandError(err);
        }
    }

    public async info(globalConfigFile: string) {
        try {
            await this.loadEnvironment(globalConfigFile);
            if (cliLogin.isLoggedIn()) {
                const { id: workspaceId, name: workspaceName } = await cliPumbleApiClient.getWorkspaceInfo();
                const { id: userId, name: userName, email: userEmail } = await cliPumbleApiClient.userInfo();
                console.log(
                    table([
                        ['Workspace Id', workspaceId],
                        ['Workspace Name', workspaceName],
                        ['User Id', userId],
                        ['User Name', userName],
                        ['User Email', userEmail],
                    ])
                );
            } else {
                throw new Error('You are not logged in');
            }
        } catch (err) {
            this.handleCommandError(err);
        }
    }

    public async listApps(globalConfigFile: string) {
        try {
            await this.loadEnvironment(globalConfigFile);
            const apps = await cliPumbleApiClient.listApps();
            const currentApp = process.env.PUMBLE_APP_ID;
            console.log(
                table([
                    ['ID', 'Name'],
                    ...apps.map((app) => {
                        const isCurrent = currentApp === app.id;
                        return [
                            isCurrent ? green(app.id) : app.id,
                            isCurrent ? green(app.displayName) : app.displayName,
                        ];
                    }),
                ])
            );
        } catch (err) {
            this.handleCommandError(err);
        }
    }

    public async logout(globalConfigFile: string) {
        await this.loadEnvironment(globalConfigFile);
        if (cliLogin.isLoggedIn()) {
            await cliLogin.logout();
            logger.success('Logged out');
        } else {
            logger.warning('You are already logged out');
        }
    }

    public async connect(globalConfigFile: string) {
        try {
            await this.loadEnvironment(globalConfigFile);
            await cliAppDirectory.connect();
        } catch (err) {
            this.handleCommandError(err);
        }
    }

    public async scaffold(globalConfigFile: string) {
        try {
            await this.loadEnvironment(globalConfigFile);
            await cliAppDirectory.scaffold();
        } catch (err) {
            this.handleCommandError(err);
        }
    }

    public async start(args: {
        globalConfigFile: string;
        program: string;
        watch: boolean;
        install: boolean;
        tsconfig: string;
        autoUpdate: boolean;
        manifest: string;
        emitManifestPath: string;
        host?: string;
        port?: number;
        inspect?: string;
    }) {
        try {
            await this.loadEnvironment(args.globalConfigFile);
            await startWatcher(args);
        } catch (err) {
            this.handleCommandError(err);
            process.exit(1);
        }
    }

    public async prePublish(args: {
        globalConfigFile: string;
        program: string;
        host?: string;
        tsconfig: string;
        manifest: string;
        emitManifestPath: string;
    }) {
        try {
            await this.loadEnvironment(args.globalConfigFile);
            let host: string;
            if (!args.host) {
                const { host: hostInput } = await prompts([
                    {
                        type: 'text',
                        name: 'host',
                        message: 'Please enter the public hostname where your App will be served',
                    },
                ]);
                host = hostInput;
            } else {
                host = args.host;
            }
            const hostUrl = new URL(host);
            startUpdater({ ...args, host: hostUrl.toString() });
        } catch (err) {
            this.handleCommandError(err);
        }
    }

    private async loadEnvironment(globalConfigFile: string) {
        cliGlobals.globalConfigFile = globalConfigFile;
        await cliEnvironment.loadEnvironment();
    }

    private handleCommandError(error: unknown) {
        const message =
            error instanceof AxiosError
                ? error.response?.data.message || JSON.stringify(error.response?.data)
                : error instanceof Error
                  ? error.message
                  : 'Error handling command';
        logger.error(message || 'Error handling command');
    }
}

export const commandsService = new CommandsService();
