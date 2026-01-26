import localtunnel from 'localtunnel';
import {ADDON_HOST_KEY, cliEnvironment} from './Environment';
import findFreePorts from 'find-free-ports';
import childProcess from 'child_process';
import { cliLogin } from './Login';
import chokidar from 'chokidar';
import { promises as fs } from 'fs';
import { cliAppSync } from './AppSync';
import { jsonc } from 'jsonc';
import _ from 'lodash';
import { logger } from './Logger';
import { cyan, yellow } from 'ansis';
import os from "os";
import { validateManifest } from './ManifestValidator';

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
    debug?: boolean;
};

export type UpdaterArgs = {
    globalConfigFile: string;
    program: string;
    host: string;
    tsconfig: string;
    manifest: string;
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
    private tsc?: childProcess.ChildProcess;
    private child: childProcess.ChildProcess | undefined = undefined;

    /**
     * Validates the source manifest.json file before processing (throws on error)
     */
    private async validateSourceManifest(manifestPath: string): Promise<void> {
        logger.info('Validating manifest.json...');
        try {
            const content = await fs.readFile(manifestPath, 'utf-8');
            const sourceManifest = JSON.parse(content);
            
            const validation = validateManifest(sourceManifest);
            
            for (const warning of validation.warnings) {
                logger.warning(warning);
            }
            
            if (!validation.valid) {
                logger.error('Manifest validation failed:');
                for (const error of validation.errors) {
                    logger.error(`  ${error}`);
                }
                throw new Error('Fix manifest.json errors before continuing.');
            }
            logger.success('Manifest is valid');
        } catch (err) {
            if (err instanceof SyntaxError) {
                logger.error(`Invalid JSON in ${manifestPath}: ${err.message}`);
                throw new Error('Fix manifest.json syntax errors.');
            }
            throw err;
        }
    }

    /**
     * Validates manifest and returns boolean (doesn't throw, for runtime changes)
     */
    private async validateSourceManifestSilent(manifestPath: string): Promise<boolean> {
        logger.info('Validating manifest.json...');
        try {
            const content = await fs.readFile(manifestPath, 'utf-8');
            const sourceManifest = JSON.parse(content);
            
            const validation = validateManifest(sourceManifest);
            
            for (const warning of validation.warnings) {
                logger.warning(warning);
            }
            
            if (!validation.valid) {
                logger.error('Manifest validation failed:');
                for (const error of validation.errors) {
                    logger.error(`  ${error}`);
                }
                return false;
            }
            logger.success('Manifest is valid');
            return true;
        } catch (err) {
            if (err instanceof SyntaxError) {
                logger.error(`Invalid JSON in ${manifestPath}: ${err.message}`);
            } else {
                logger.error(`Error reading manifest: ${err}`);
            }
            return false;
        }
    }

    /**
     * Used by pumble-cli update
     * This method will compile the App code, wait for it to finish then it will run the App only once until it emits a manifest in `.pumble-app-manifest.json`
     * After the manifest is synced it will kill the App and exit
     */
    public async startUpdater(args: UpdaterArgs) {
        await cliEnvironment.loadEnvironment();
        if (!cliLogin.isLoggedIn()) {
            await cliLogin.login();
        }
        
        // Validate source manifest.json before compiling
        await this.validateSourceManifest(args.manifest);
        
        const compileResult = childProcess.spawnSync('tsc', args.tsconfig ? ['-p', args.tsconfig] : [], {
            stdio: 'inherit',
            killSignal: 'SIGKILL',
            shell: os.platform() === 'win32'
        });
        if (compileResult.error) {
            throw compileResult.error;
        }
        const emittedManifestWatcher = chokidar.watch(args.emitManifestPath, {
            ignoreInitial: true,
        });
        const port = await this.getPort();
        emittedManifestWatcher.on('all', async () => {
            const manifest = JSON.parse((await fs.readFile(args.emitManifestPath)).toString());
            await cliAppSync.syncApp(manifest, args.host as string, false, false);
            if (this.child) {
                this.child.kill('SIGKILL');
            }
            emittedManifestWatcher.close();
        });
        await this.startChild(args, port);
    }

    /**
     * Used by pumble-cli
     * 1. Read or create a port and host (if not hostname is provided it will tunnel out the port via a generated hostname)
     * 2. Sync app initially (create it or update it and setup the app secrets in `.pumbleapprc`)
     * 3. Start tsc --watch and watch for changes in the `outDir` of tsconfig and `manifest.json`
     *    On changes restart the App
     * 4. Watch for changes in the emitted manifest by the Sdk (.pumble-app-manifest.json)
     *    On changes resync the App in Pumble
     */
    public async startWatcher(args: WatcherArgs) {
        process.on('exit', () => {
            this.tsc?.kill('SIGKILL');
            this.child?.kill('SIGKILL');
        });
        await cliEnvironment.loadEnvironment();
        
        // Validate source manifest.json before starting
        await this.validateSourceManifest(args.manifest);
        
        const port = await this.getPort(args.port);
        const tunnelUrl = args.host ? args.host : await this.startTunnel(port);
        if (!cliLogin.isLoggedIn()) {
            await cliLogin.login();
        }
        await cliEnvironment.setGlobalEnvironment({[ADDON_HOST_KEY]: tunnelUrl});
        console.log(`Using host: ${tunnelUrl}`);
        console.log(`Using port: ${port}`);
        const tsConfigFile = jsonc.parse((await fs.readFile(args.tsconfig)).toString());
        const outDir = tsConfigFile.compilerOptions.outDir;

        if (args.autoUpdate) {
            await this.initialSync(args, tunnelUrl);
        }
        if (args.watch) {
            /**
             * Start typescript compiler in watch mode
             */
            logger.info(`Starting ` + cyan`tsc --watch`);
            this.tsc = childProcess.spawn('tsc', args.tsconfig ? ['--watch', '-p', args.tsconfig] : ['--watch'], {
                stdio: 'inherit',
                detached: false,
                killSignal: 'SIGKILL',
                shell: os.platform() === 'win32'
            });
            /**
             * On compiled dir change or `manifest.json` change, kill the running App, and start it again
             */
            const compiledFileWatcher = chokidar.watch([outDir, args.manifest], { ignoreInitial: true });
            compiledFileWatcher.on(
                'all',
                _.debounce(async (event, changedPath) => {
                    if (changedPath && changedPath.endsWith('manifest.json')) {
                        const isValid = await this.validateSourceManifestSilent(args.manifest);
                        if (!isValid) {
                            logger.warning('Manifest changes ignored due to validation errors. Fix them and save again.');
                            return;
                        }
                    }
                    
                    if (this.child) {
                        this.child.once('close', async () => {
                            console.log('Restarting app!');
                            await this.startChild(args, port);
                        });
                        this.child.kill('SIGKILL');
                    } else {
                        await this.startChild(args, port);
                    }
                }, 2000)
            );
        }

        /**
         * On emitted manifest change `.pumble-app-manifest.json` (that is emitted by the App), sync the app
         */
        if (args.autoUpdate) {
            const emittedManifestWatcher = chokidar.watch(args.emitManifestPath, {
                ignoreInitial: true,
            });
            emittedManifestWatcher.on('all', async () => {
                const manifest = JSON.parse((await fs.readFile(args.emitManifestPath)).toString());
                const { created } = await cliAppSync.syncApp(manifest, tunnelUrl, args.install);
                if (this.child && created) {
                    this.child.once('close', () => {
                        console.log(
                            yellow(`App is just created in Pumble. Restarting app server to sync the new environment`)
                        );
                        this.startChild(args, port);
                    });
                    this.child.kill('SIGKILL');
                }
            });
        }
    }

    /**
     * This will try to create or update an addon if an emitted manifest file is found `.pumble-app-manifest.json` (default)
     * This can be executed without needing a running App server (so it cannot and will not auto-install/auto-authorize the app)
     * cliAppSync.syncApp will check if there is an app in the logged in workspace that matches the ID of the current app.
     * If there is not ID (in .pumbleapprc) it will proceed to create an app
     * If there is an ID but does not match any of the apps created by the same Pumble user , it will ask for a confirmation to create a new app
     * If there is an ID and the App exists in Pumble user's Apps it will update the app with the current state of the manifest in `.pumble-app-manifest.json`
     */
    private async initialSync(args: WatcherArgs, tunnelUrl: string) {
        let manifest;
        try {
            manifest = JSON.parse((await fs.readFile(args.emitManifestPath)).toString());
        } catch (ignore) {}
        if (manifest) {
            await cliAppSync.syncApp(manifest, tunnelUrl, false);
        }
    }

    private async getPort(port?: number): Promise<number> {
        let portStr = port || process.env.PUMBLE_APP_PORT;
        if (!portStr) {
            portStr = (await findFreePorts(1, { endPort: 9999, startPort: 5000 }))[0].toString();
        }
        return +portStr;
    }

    private async startChild(
        args: { program: string; inspect?: string; manifest: string; emitManifestPath: string; debug?: boolean },
        port: number
    ): Promise<void> {
        await fs.stat(args.program);
        
        if (args.debug) {
            logger.info('Debug mode enabled - verbose logging active');
        }
        
        this.child = childProcess.spawn(
            'node',
            args.inspect ? [`--inspect=${args.inspect}`, args.program] : [args.program],
            {
                stdio: 'inherit',
                detached: false,
                env: {
                    ...process.env,
                    PUMBLE_ADDON_PORT: port.toString(),
                    PUMBLE_ADDON_MANIFEST_PATH: args.manifest,
                    PUMBLE_ADDON_EMIT_MANIFEST_PATH: args.emitManifestPath,
                    PUMBLE_DEBUG: args.debug ? 'true' : '',
                },
                killSignal: 'SIGKILL',
                shell: os.platform() === 'win32'
            }
        );
        this.child.on('close', () => {
            this.child = undefined;
        });
    }

    private async startTunnel(port: number): Promise<string> {
        const response = await localtunnel(port);
        return response.url;
    }
}

const watcher = new Watcher();

export const startWatcher = (args: WatcherArgs) => watcher.startWatcher(args);
export const startUpdater = (args: UpdaterArgs) => watcher.startUpdater(args);
