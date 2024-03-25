import localtunnel from 'localtunnel';
import { cliEnvironment } from './Environment';
import findFreePorts from 'find-free-ports';
import childProcess from 'child_process';
import { cliLogin } from './Login';
import chokidar from 'chokidar';
import { promises as fs } from 'fs';
import { cliAppSync } from './AppSync';
import { jsonc } from 'jsonc';
import _ from 'lodash';

export type WatcherArgs = {
    globalConfigFile: string;
    program: string;
    inspect?: string;
    install: boolean;
    host?: string;
    tsconfig: string;
    port?: number;
    autoUpdate: boolean;
    manifest: string;
    watch: boolean;
    emitManifestPath: string;
};

/**
 * If SDK Runs with PUMBLE_ADDON_EMIT_MANIFEST_PATH set to some path -> Saves the generated manifest json to that path
 * If the environment variable is not set nothing will be saved
 *
 * Watcher watches the changes in the set PUMBLE_ADDON_EMIT_MANIFEST_PATH
 * If the file has changed it normalizes the payload (fixes events to a simple array of strings and changes urls from `/pathname` to `https://<tunnelHost>/pathname`) and updates the api
 * If we don't have an `id` in .pumbleapprc or the `id` does not exist in the user apps, an app is created and the main command from sdk is restarted (since in a creation id and secrets are created)
 * Every time an app is created/updated we check if the user has authorized the app, if not we generate a redirect url with grant code and trigger it (triggering the auth flow in the sdk)
 *
 */
class Watcher {
    private child: childProcess.ChildProcess | undefined = undefined;
    public async startWatcher(args: WatcherArgs) {
        await cliEnvironment.loadEnvironment();

        const port = await this.getPort(args);
        const tunnelUrl = args.host ? args.host : await this.startTunnel(port);
        if (!cliLogin.isLoggedIn()) {
            await cliLogin.login();
        }
        console.log(`Using host: ${tunnelUrl}`);
        console.log(`Using port: ${port}`);
        const tsConfigFile = jsonc.parse((await fs.readFile(args.tsconfig)).toString());
        const outDir = tsConfigFile.compilerOptions.outDir;
        if (args.watch) {
            childProcess.spawn('tsc', args.tsconfig ? ['--watch', '-p', args.tsconfig] : ['--watch'], {
                stdio: 'inherit',
                detached: false,
            });
            const compiledFileWatcher = chokidar.watch([outDir, args.manifest], { ignoreInitial: true });
            compiledFileWatcher.on(
                'all',
                _.debounce(async () => {
                    if (this.child) {
                        this.child.once('exit', async () => {
                            console.log('Restarting addon!');
                            await this.startChild(args, port, tunnelUrl);
                        });
                        this.child.kill(9);
                    } else {
                        await this.startChild(args, port, tunnelUrl);
                    }
                }, 1000)
            );
        }
        await this.startChild(args, port, tunnelUrl);
        const emittedManifestWatcher = chokidar.watch(args.emitManifestPath, {
            ignoreInitial: false,
        });
        emittedManifestWatcher.on('all', async () => {
            const manifest = JSON.parse((await fs.readFile(args.emitManifestPath)).toString());
            if (args.autoUpdate) {
                const { created } = await cliAppSync.syncApp(manifest, tunnelUrl, args.install);
                if (this.child && created) {
                    this.child.once('exit', async () => {
                        await this.startChild(args, port, tunnelUrl);
                    });
                    this.child.kill(9);
                }
            }
        });
    }

    private async getPort(args: WatcherArgs): Promise<number> {
        let portStr = args.port || process.env.PUMBLE_APP_PORT;
        if (!portStr) {
            portStr = (await findFreePorts(1, { endPort: 9999, startPort: 5000 }))[0].toString();
        }
        return +portStr;
    }

    private async startChild(args: WatcherArgs, port: number, host: string): Promise<void> {
        try {
            await fs.stat(args.program);
            this.child = childProcess.spawn(
                'node',
                args.inspect ? [`--inspect=${args.inspect}`, args.program] : [args.program],
                {
                    stdio: 'inherit',
                    detached: false,
                    env: {
                        ...process.env,
                        PUMBLE_ADDON_HOST: host,
                        PUMBLE_ADDON_PORT: port.toString(),
                        PUMBLE_ADDON_MANIFEST_PATH: args.manifest,
                        PUMBLE_ADDON_EMIT_MANIFEST_PATH: args.emitManifestPath,
                    },
                }
            );
            this.child.on('exit', () => {
                this.child = undefined;
            });
        } catch (err) {}
    }

    private async startTunnel(port: number): Promise<string> {
        const response = await localtunnel(port);
        return response.url;
    }
}

const watcher = new Watcher();

export const startWatcher = (args: WatcherArgs) => watcher.startWatcher(args);
