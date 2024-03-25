import { green } from 'ansis';
import { cliAppDirectory } from './AppDirectory';
import { createAddon } from './Create';
import { cliEnvironment } from './Environment';
import { cliGlobals } from './Globals';
import { logger } from './Logger';
import { cliLogin } from './Login';
import { cliPumbleApiClient } from './PumbleApiClient';
import { startWatcher } from './Watcher';
import { table } from 'table';

class CommandsService {
    public async createAddon(globalConfigFile: string) {
        await this.loadEnvironment(globalConfigFile);
        createAddon();
    }

    public async login(globalConfigFile: string, force?: boolean) {
        await this.loadEnvironment(globalConfigFile);
        const isAlreadyLoggedIn = await cliLogin.login();
        if (isAlreadyLoggedIn) {
            if (force) {
                await cliLogin.logout();
                await cliLogin.login();
            } else {
                logger.warning(
                    'Already logged in. Use "--force" to ignore the existing login or logout with "pumble-cli logout"'
                );
            }
        }
    }

    public async listApps(globalConfigFile: string) {
        await this.loadEnvironment(globalConfigFile);
        const apps = await cliPumbleApiClient.listApps();
        const currentApp = process.env.PUMBLE_APP_ID;
        console.log(
            table([
                ['ID', 'Name'],
                ...apps.map((app) => {
                    const isCurrent = currentApp === app.id;
                    return [isCurrent ? green(app.id) : app.id, isCurrent ? green(app.displayName) : app.displayName];
                }),
            ])
        );
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
        await this.loadEnvironment(globalConfigFile);
        await cliAppDirectory.connect();
    }

    public async scaffold(globalConfigFile: string) {
        await this.loadEnvironment(globalConfigFile);
        await cliAppDirectory.scaffold();
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
        await this.loadEnvironment(args.globalConfigFile);
        startWatcher(args);
    }

    private async loadEnvironment(globalConfigFile: string) {
        cliGlobals.globalConfigFile = globalConfigFile;
        await cliEnvironment.loadEnvironment();
    }
}

export const commandsService = new CommandsService();
