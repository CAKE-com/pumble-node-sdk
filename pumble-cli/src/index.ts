import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { cliEnvironment } from './services/Environment';
import os from 'os';
import path from 'path';
import { commandsService } from './services/CommandsService';

function getDefaultConfigFilePath() {
    return path.join(os.homedir(), '.pumblerc');
}

async function main() {
    await cliEnvironment.loadEnvironment();
    const defaultConfigFilePath = getDefaultConfigFilePath();
    yargs(hideBin(process.argv))
        .strict()
        .usage('$0 script [args]')
        .option('global-config-file', {
            alias: 'cfg',
            type: 'string',
            default: `${defaultConfigFilePath}`,
            description: 'Filename to store your login info',
        })
        .scriptName('pumble-cli')
        .command(
            'logout',
            'Logout from your current session',
            (y) => y,
            async (args) => {
                await commandsService.logout(args.globalConfigFile);
            }
        )
        .command(
            'create',
            'Create a new app',
            (y) => y,
            async (args) => {
                await commandsService.createApp(args.globalConfigFile);
            }
        )
        .command(
            'login',
            'Login',
            (y) => {
                return y
                    .option('open', { alias: 'o', type: 'boolean' })
                    .option('force', { alias: 'f', type: 'boolean' })
                    .usage('$0 <cmd>');
            },
            async (args) => {
                await commandsService.login(args.globalConfigFile, args.force);
            }
        )

        .command(
            'info',
            'Get login info',
            (y) => y,
            async (args) => {
                await commandsService.info(args.globalConfigFile);
            }
        )
        .command(
            'connect',
            'Setup local environment based on an existing app',
            (y) => y,
            async (args) => {
                await commandsService.connect(args.globalConfigFile);
            }
        )
        .command(
            'scaffold',
            'Generate the template for an existing app',
            (y) => y,
            async (args) => {
                await commandsService.scaffold(args.globalConfigFile);
            }
        )
        .command(
            'list',
            'List my apps',
            (y) => y,
            async (args) => {
                await commandsService.listApps(args.globalConfigFile);
            }
        )
        .command(
            'pre-publish',
            'Prepare your app for publishing',
            (y) => {
                return y
                    .option('program', {
                        type: 'string',
                        description: 'Program name',
                        default: './dist/main.js',
                    })
                    .option('host', {
                        alias: 'h',
                        type: 'string',
                        description: 'Public hostname of your app',
                    })
                    .option('tsconfig', {
                        type: 'string',
                        description: 'tsconfig.json file path',
                        default: 'tsconfig.json',
                    })
                    .option('manifest', {
                        alias: 'm',
                        type: 'string',
                        description: 'App manifest file path',
                        default: 'manifest.json',
                    })
                    .option('emit-manifest-path', {
                        type: 'string',
                        description: 'Path to write updated manifest',
                        default: '.pumble-app-manifest.json',
                    });
            },
            async (y) => {
                await commandsService.prePublish(y);
            }
        )
        .command(
            '$0',
            'Start your app',
            (yargs) => {
                return yargs
                    .option('program', {
                        type: 'string',
                        description: 'Program name',
                        default: './dist/main.js',
                    })
                    .option('watch', {
                        alias: 'w',
                        type: 'boolean',
                        default: true,
                        description: 'Watch code changes and manifest.json',
                    })
                    .option('install', { alias: 'i', type: 'boolean', default: true })
                    .option('host', {
                        alias: 'h',
                        type: 'string',
                        description: 'Public hostname of your app',
                    })
                    .option('tsconfig', {
                        type: 'string',
                        description: 'tsconfig.json file path',
                        default: 'tsconfig.json',
                    })
                    .option('auto-update', {
                        alias: 'u',
                        type: 'boolean',
                        default: true,
                        description: 'Auto update your app configuration',
                    })
                    .option('port', {
                        alias: 'p',
                        type: 'number',
                        description: 'App http port',
                    })
                    .option('manifest', {
                        alias: 'm',
                        type: 'string',
                        description: 'App manifest file path',
                        default: 'manifest.json',
                    })
                    .option('emit-manifest-path', {
                        type: 'string',
                        description: 'Path to write updated manifest',
                        default: '.pumble-app-manifest.json',
                    })
                    .option('inspect', {
                        type: 'string',
                        description: 'NodeJS --inspect',
                    });
            },
            async (args) => {
                await commandsService.start(args);
            }
        )
        .parse();
}
main();
