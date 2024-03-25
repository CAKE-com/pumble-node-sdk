import prompts from 'prompts';
import { cliPumbleApiClient } from './PumbleApiClient';
import { cliEnvironment } from './Environment';
import { promises as fs } from 'fs';
import { ReplacementsDict, createAddon } from './Create';
import path from 'path';

class AppDirectory {
    public async getMyApps() {
        const apps = await cliPumbleApiClient.listApps();
        console.table(
            apps.map((app) => {
                const { id, name, displayName } = app;
                return { id, name, displayName };
            })
        );
    }

    public async scaffold() {
        const selected = await this.selectAnApp();
        const appInfo = await cliPumbleApiClient.getApp(selected);
        const environment = {
            PUMBLE_APP_ID: appInfo.id,
            PUMBLE_APP_KEY: appInfo.appKey,
            PUMBLE_APP_CLIENT_SECRET: appInfo.clientSecret,
            PUMBLE_APP_SIGNING_SECRET: appInfo.signingSecret,
        };
        const slashCommandsArray = appInfo.slashCommands
            .map((sl) => {
                return {
                    path: new URL(sl.url).pathname,
                    command: sl.command,
                    usageHint: sl.usageHint,
                    description: sl.description,
                };
            })
            .map((result) => {
                const values = Object.entries(result)
                    .map(([key, value]) => {
                        return `${key}: ${JSON.stringify(value)}`;
                    })
                    .join(',\n');
                const finalCode = `{\n${values},\nhandler: async (ctx)=>{ console.log("Received slash command", ctx); }\n}`;
                return finalCode;
            });
        const slashCommands = `[${slashCommandsArray.join(',\n')}]`;
        const globalShortcutsArray = appInfo.shortcuts
            .filter((x) => x.shortcutType === 'GLOBAL')
            .map((sh) => {
                return { path: new URL(sh.url).pathname, name: sh.name, description: sh.description };
            })
            .map((result) => {
                const values = Object.entries(result)
                    .map(([key, value]) => {
                        return `${key}: ${JSON.stringify(value)}`;
                    })
                    .join(',\n');
                const finalCode = `{\n${values},\nhandler: async (ctx)=>{ console.log("Received global shortcut", ctx); }\n}`;
                return finalCode;
            });
        const globalShortcuts = `[${globalShortcutsArray.join(',\n')}]`;
        const messageShortcutsArray = appInfo.shortcuts
            .filter((x) => x.shortcutType === 'ON_MESSAGE')
            .map((sh) => {
                return { path: new URL(sh.url).pathname, name: sh.name, description: sh.description };
            })
            .map((result) => {
                const values = Object.entries(result)
                    .map(([key, value]) => {
                        return `${key}: ${JSON.stringify(value)}`;
                    })
                    .join(',\n');
                const finalCode = `{\n${values},\nhandler: async (ctx)=>{ console.log("Received message shortcut", ctx); }\n}`;
                return finalCode;
            });
        const messageShortcuts = `[${messageShortcutsArray.join(',\n')}]`;
        const eventsArray = (appInfo.eventSubscriptions.events || [])
            .map((evt) => ({ name: evt }))
            .map((result) => {
                const values = Object.entries(result)
                    .map(([key, value]) => {
                        return `${key}: ${JSON.stringify(value)}`;
                    })
                    .join(',\n');
                const finalCode = `{\n${values},\nhandler: async (ctx)=>{ console.log("Received event", ctx); }\n}`;
                return finalCode;
            });
        const events = `[${eventsArray.join(',\n')}]`;
        const eventsPath = new URL(appInfo.eventSubscriptions.url).pathname;
        const redirect = JSON.stringify({ enable: true, path: new URL(appInfo.redirectUrls[0]).pathname });
        const replacements: ReplacementsDict = {
            name: appInfo.name as string,
            displayName: appInfo.displayName as string,
            botTitle: appInfo.botTitle as string,
            bot: (!!appInfo.bot).toString(),
            botScopes: JSON.stringify((appInfo.scopes as any).botScopes),
            userScopes: JSON.stringify((appInfo.scopes as any).userScopes),
            globalShortcuts,
            messageShortcuts,
            slashCommands,
            events,
            eventsPath,
            redirect,
        };
        await createAddon(replacements);
        await fs.writeFile(path.join(replacements.name, '.pumbleapprc'), JSON.stringify(environment));
    }

    public async connect() {
        try {
            fs.stat('manifest.json');
        } catch (err) {
            throw new Error('You can use pumble-cli connect only inside a project directory');
        }
        const selected = await this.selectAnApp();
        const appInfo = await cliPumbleApiClient.getApp(selected);
        const environment = {
            PUMBLE_APP_ID: appInfo.id,
            PUMBLE_APP_KEY: appInfo.appKey,
            PUMBLE_APP_CLIENT_SECRET: appInfo.clientSecret,
            PUMBLE_APP_SIGNING_SECRET: appInfo.signingSecret,
        };
        await cliEnvironment.setLocalEnvironment(environment);
        console.log('App is connected!');
    }

    private async selectAnApp() {
        const apps = await cliPumbleApiClient.listApps();
        if (apps.length === 0) {
            throw new Error("You don't have any existing app in this workspace!");
        }
        const { selected } = await prompts([
            {
                name: 'selected',
                type: 'select',
                message: 'Select an app',
                choices: apps.map((x) => {
                    return { title: `${x.id} - ${x.displayName}`, value: x.id };
                }),
            },
        ]);
        return selected;
    }
}

export const cliAppDirectory = new AppDirectory();
