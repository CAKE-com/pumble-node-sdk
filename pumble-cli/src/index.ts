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
            (y) => {
                return y.usage('$0 <cmd>');
            },
            async (args) => {
                commandsService.logout(args.globalConfigFile);
            }
        )
        .command(
            'create',
            'Create a new addon',
            (y) => y,
            (args) => {
                commandsService.createAddon(args.globalConfigFile);
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
                commandsService.login(args.globalConfigFile, args.force);
            }
        )
        .command(
            'connect',
            'Setup local environment based on an existing addon',
            (y) => y,
            async (args) => {
                commandsService.connect(args.globalConfigFile);
            }
        )
        .command(
            'scaffold',
            'Generate the template for an existing addon',
            (y) => {},
            async (args) => {
                await commandsService.connect(args.globalConfigFile);
            }
        )
        .command(
            'list',
            'List my apps',
            (y) => {},
            async (args) => {
                await commandsService.listApps(args.globalConfigFile);
            }
        )
        .command(
            '$0',
            'Start your addon',
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
                        description: 'Public hostname of your addon',
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
                        description: 'Auto update your addon configuration',
                    })
                    .option('port', {
                        alias: 'p',
                        type: 'number',
                        description: 'Addon http port',
                    })
                    .option('manifest', {
                        alias: 'm',
                        type: 'string',
                        description: 'Addon manifest file path',
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
                commandsService.start(args);
            }
        )
        .parse();
}
main();
