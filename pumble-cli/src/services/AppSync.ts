import { cliPumbleApiClient } from './PumbleApiClient';
import { cliEnvironment } from './Environment';
import { AddonManifest } from '../types';
import axios, { AxiosError } from 'axios';
import path from 'path';
import prompts from 'prompts';
import { logger } from './Logger';
import { cyan, green, red, yellow } from 'ansis';

type ManifestChange = {
    key: string;
    action: 'change' | 'add' | 'remove';
    oldValue?: string | string[];
    newValue?: string | string[];
};

class AppSync {
    public async syncApp(
        manifest: AddonManifest,
        host: string,
        install: boolean,
        confirmed: boolean = true
    ): Promise<{ created: boolean }> {
        if (manifest.eventSubscriptions && manifest.eventSubscriptions.events) {
            manifest = {
                ...manifest,
                redirectUrls: manifest.redirectUrls.map((url) => {
                    return new URL(path.join(host, url)).toString();
                }),
                blockInteraction: manifest.blockInteraction
                    ? {
                          url: new URL(path.join(host, manifest.blockInteraction.url)).toString(),
                      }
                    : undefined,
                slashCommands: manifest.slashCommands.map((cmd) => {
                    return { ...cmd, url: new URL(path.join(host, cmd.url)).toString() };
                }),
                shortcuts: manifest.shortcuts.map((sh) => {
                    return { ...sh, url: new URL(path.join(host, sh.url)).toString() };
                }),
                eventSubscriptions: {
                    ...manifest.eventSubscriptions,
                    url: new URL(path.join(host, manifest.eventSubscriptions.url)).toString(),
                    events: manifest.eventSubscriptions.events.map((event) => {
                        if (typeof event === 'string') {
                            return event;
                        }
                        return event.name;
                    }),
                },
            };
        }
        const { created, app } = await this.getOrCreateApp(manifest);
        await cliEnvironment.setLocalEnvironment({
            PUMBLE_APP_ID: app.id,
            PUMBLE_APP_KEY: app.appKey,
            PUMBLE_APP_CLIENT_SECRET: app.clientSecret,
            PUMBLE_APP_SIGNING_SECRET: app.signingSecret,
        });
        const manifestChanges = this.manifestChanged(app, manifest);
        if (manifestChanges.length > 0) {
            logger.warning('Manifest has changed');
            this.logManifestChanges(manifestChanges);
            if (app.published) {
                if (cliEnvironment.allowSyncingPublishedApps) {
                    const { confirmation } = await prompts([
                        {
                            name: 'confirmation',
                            type: 'confirm',
                            message: 'WARNING. App is already published. Are you sure you want to update it?',
                        },
                    ]);
                    if (confirmation) {
                        await this.updateApp(app, manifest);
                    }
                } else {
                    logger.warning('App is published and it cannot not be updated!');
                }
            } else {
                let confirmation: boolean;
                if (!confirmed) {
                    const { response } = await prompts([
                        {
                            name: 'response',
                            type: 'confirm',
                            message: 'Do you want to apply these updates updates?',
                        },
                    ]);
                    confirmation = response;
                } else {
                    confirmation = true;
                }
                if (confirmation) {
                    await this.updateApp(app, manifest);
                } else {
                    logger.error('Update cancelled');
                }
            }
        }
        /**
         * If app is just created we need to restart the App server, so it will get the new environment variables
         * We can not yet authorize
         */
        if (!created) {
            if (!(await this.isAuthorized(app.id)) && install) {
                await this.authorizeApp(app, manifest);
                logger.success('Authorized ' + cyan`${app.name as string}`);
            } else {
                if (this.botScopesChanged(app, manifest) && install) {
                    await this.reinstallApp(app, manifest);
                    logger.success('Bot scopes have changed. App is reinstalled.');
                } else if (this.userScopesChanged(app, manifest) && install) {
                    await this.authorizeApp(app, manifest);
                    logger.success('User scopes have changed. App is reauthorized.');
                }
            }
        }
        return { created };
    }

    private async authorizeApp(app: AddonManifest, newApp: AddonManifest): Promise<void> {
        const { redirectUrl } = await cliPumbleApiClient.getRedirectUrl(app, newApp, false);
        await axios.get(redirectUrl);
    }

    private async isAuthorized(id: string): Promise<boolean> {
        const authorizedApps = await cliPumbleApiClient.getAuthorizedApps();
        return !!authorizedApps.find((x) => x.app.id === id);
    }

    private async getOrCreateApp(manifest: AddonManifest): Promise<{ app: AddonManifest; created: boolean }> {
        const appId = process.env.PUMBLE_APP_ID;
        let appFound = false;
        if (appId) {
            try {
                const pumbleApp = await cliPumbleApiClient.getApp(appId);
                return { app: pumbleApp, created: false };
            } catch (ignore) {}
        }

        if (!appFound) {
            let confirmation = false;
            if (appId) {
                const { response } = await prompts({
                    name: 'response',
                    type: 'confirm',
                    message: `The app id ${appId} is not found in this workspace. Do you want to create a new App in this workspace?`,
                });
                confirmation = !!response;
            } else {
                confirmation = true;
                logger.info('Creating app for the first time');
            }
            if (confirmation) {
                const app = await cliPumbleApiClient.createApp(manifest);
                logger.info(`Your app is created. AppID: ` + cyan`${app.id}`);
                return { app, created: true };
            }
        }
        throw new Error('App is not created!');
    }

    private manifestChanged(oldApp: AddonManifest, newApp: AddonManifest): ManifestChange[] {
        const changes: ManifestChange[] = [];
        if (oldApp.name !== newApp.name) {
            changes.push({
                key: 'Name',
                action: 'change',
                oldValue: oldApp.name as string,
                newValue: newApp.name as string,
            });
        }
        if (oldApp.displayName !== newApp.displayName) {
            changes.push({
                key: 'Display Name',
                action: 'change',
                oldValue: oldApp.displayName as string,
                newValue: newApp.displayName as string,
            });
        }
        if (oldApp.botTitle !== newApp.botTitle) {
            changes.push({
                key: 'Bot Title',
                action: 'change',
                oldValue: oldApp.botTitle as string,
                newValue: newApp.botTitle as string,
            });
        }
        if (
            !oldApp.redirectUrls.every((x) => newApp.redirectUrls.includes(x)) ||
            !newApp.redirectUrls.every((x) => oldApp.redirectUrls.includes(x))
        ) {
            changes.push({
                key: 'Redirect URLs',
                action: 'change',
                oldValue: oldApp.redirectUrls as string[],
                newValue: newApp.redirectUrls as string[],
            });
        }

        if (oldApp.blockInteraction?.url !== newApp.blockInteraction?.url) {
            changes.push({
                key: 'Block Interactions URL',
                action: 'change',
                oldValue: oldApp.blockInteraction?.url,
                newValue: newApp.blockInteraction?.url,
            });
        }

        for (const slash of oldApp.slashCommands) {
            const newAppSlashCommand = newApp.slashCommands.find((x) => x.command === slash.command);
            if (!newAppSlashCommand) {
                changes.push({
                    key: `Removed: ${slash.command}`,
                    action: 'remove',
                    oldValue: slash.command,
                });
            } else {
                if (newAppSlashCommand.url !== slash.url) {
                    changes.push({
                        key: `Slash Command: ${slash.command} URL`,
                        action: 'change',
                        oldValue: slash.url,
                        newValue: newAppSlashCommand.url,
                    });
                }
                if (newAppSlashCommand.description !== slash.description) {
                    changes.push({
                        key: `Slash Command: ${slash.command} Description`,
                        action: 'change',
                        oldValue: slash.description as string | undefined,
                        newValue: newAppSlashCommand.description as string | undefined,
                    });
                }
                if (newAppSlashCommand.usageHint !== slash.usageHint) {
                    changes.push({
                        key: `Slash Command: ${slash.command} Usage hint`,
                        action: 'change',
                        oldValue: slash.usageHint as string | undefined,
                        newValue: newAppSlashCommand.usageHint as string | undefined,
                    });
                }
            }
        }
        for (const slash of newApp.slashCommands) {
            if (!oldApp.slashCommands.find((x) => x.command === slash.command)) {
                changes.push({
                    key: `Added Slash Command: ${slash.command}`,
                    action: 'add',
                    newValue: slash.command,
                });
            }
        }
        for (const short of oldApp.shortcuts) {
            const newAppShortcut = newApp.shortcuts.find(
                (x) => x.name === short.name && x.shortcutType === short.shortcutType
            );
            if (!newAppShortcut) {
                changes.push({
                    key: `Removed ${short.shortcutType} shortcut ${short.displayName}`,
                    action: 'remove',
                    oldValue: short.displayName as string,
                });
            } else {
                if (newAppShortcut.url !== short.url) {
                    changes.push({
                        key: `${short.shortcutType} shortcut: ${short.displayName} URL`,
                        action: 'change',
                        oldValue: short.url,
                        newValue: newAppShortcut.url,
                    });
                }
                if (newAppShortcut.description !== short.description) {
                    changes.push({
                        key: `${short.shortcutType} shortcut: ${short.displayName} Description`,
                        action: 'change',
                        oldValue: short.description as string | undefined,
                        newValue: newAppShortcut.description as string | undefined,
                    });
                }
                if (newAppShortcut.displayName !== short.displayName) {
                    changes.push({
                        key: `${short.shortcutType} shortcut: ${short.displayName} Display Name`,
                        action: 'change',
                        oldValue: short.displayName as string | undefined,
                        newValue: newAppShortcut.displayName as string | undefined,
                    });
                }
            }
        }

        for (const short of newApp.shortcuts) {
            if (!oldApp.shortcuts.find((x) => x.name === short.name && x.shortcutType === short.shortcutType)) {
                changes.push({
                    key: `Added ${short.shortcutType} shortcut: ${short.displayName}`,
                    action: 'add',
                    newValue: short.displayName as string,
                });
            }
        }
        if (newApp.eventSubscriptions.url !== oldApp.eventSubscriptions.url) {
            changes.push({
                key: `Events URL`,
                action: 'change',
                oldValue: oldApp.eventSubscriptions.url,
                newValue: newApp.eventSubscriptions.url,
            });
        }
        if (
            !(newApp.eventSubscriptions.events || []).every((x) =>
                (oldApp.eventSubscriptions.events || []).includes(x)
            ) ||
            !(oldApp.eventSubscriptions.events || []).every((x) => (newApp.eventSubscriptions.events || []).includes(x))
        ) {
            changes.push({
                key: 'Events',
                action: 'change',
                oldValue: (oldApp.eventSubscriptions.events || []).map<string>((e) =>
                    typeof e === 'object' ? e.name : e
                ),
                newValue: (newApp.eventSubscriptions.events || []).map<string>((e) =>
                    typeof e === 'object' ? e.name : e
                ),
            });
        }
        if (this.botScopesChanged(oldApp, newApp)) {
            changes.push({
                key: 'Bot Scopes',
                action: 'change',
                oldValue: oldApp.scopes.botScopes,
                newValue: newApp.scopes.botScopes,
            });
        }
        if (this.userScopesChanged(oldApp, newApp)) {
            changes.push({
                key: 'User Scopes',
                action: 'change',
                oldValue: oldApp.scopes.userScopes,
                newValue: newApp.scopes.userScopes,
            });
        }
        if (oldApp.listingUrl?.toString() !== newApp.listingUrl?.toString()) {
            if (!(oldApp.listingUrl?.startsWith('/') && !newApp.listingUrl)) {
                changes.push({
                    key: 'Listing URL',
                    action: 'change',
                    oldValue: oldApp.listingUrl,
                    newValue: newApp.listingUrl,
                });
            }
        }
        if (oldApp.helpUrl?.toString() !== newApp.helpUrl?.toString()) {
            changes.push({
                key: 'Help URL',
                action: 'change',
                oldValue: oldApp.helpUrl,
                newValue: newApp.helpUrl,
            });
        }
        if (oldApp.welcomeMessage?.toString() !== newApp.welcomeMessage?.toString()) {
            changes.push({
                key: 'Welcome Message',
                action: 'change',
                oldValue: oldApp.welcomeMessage,
                newValue: newApp.welcomeMessage,
            });
        }
        if (oldApp.offlineMessage?.toString() !== newApp.offlineMessage?.toString()) {
            changes.push({
                key: 'Offline Message',
                action: 'change',
                oldValue: oldApp.offlineMessage,
                newValue: newApp.offlineMessage,
            });
        }
        return changes;
    }

    private async updateApp(app: AddonManifest, manifest: AddonManifest) {
        await cliPumbleApiClient
            .updateApp(app.id, manifest)
            .catch((e) => {
                if (e instanceof AxiosError) {
                    logger.error(`Error updating app: ${e.response?.data.message}`);
                } else {
                    console.log('ERROR', e);
                }
            })
            .then(() => {
                logger.success('App is updated');
            });
    }

    private userScopesChanged(oldApp: AddonManifest, newApp: AddonManifest): boolean {
        const newAppScopes: { botScopes: string[]; userScopes: string[] } = newApp.scopes;
        const oldAppScopes: { botScopes: string[]; userScopes: string[] } = oldApp.scopes;
        if (!newAppScopes.userScopes.every((x) => oldAppScopes.userScopes.includes(x))) {
            return true;
        }
        if (!oldAppScopes.userScopes.every((x) => newAppScopes.userScopes.includes(x))) {
            return true;
        }
        return false;
    }

    private botScopesChanged(oldApp: AddonManifest, newApp: AddonManifest): boolean {
        const newAppScopes: { botScopes: string[]; userScopes: string[] } = newApp.scopes;
        const oldAppScopes: { botScopes: string[]; userScopes: string[] } = oldApp.scopes;
        if (!newAppScopes.botScopes.every((x) => oldAppScopes.botScopes.includes(x))) {
            return true;
        }
        if (!oldAppScopes.botScopes.every((x) => newAppScopes.botScopes.includes(x))) {
            return true;
        }
        return false;
    }

    private async reinstallApp(app: AddonManifest, newApp: AddonManifest): Promise<void> {
        const { redirectUrl } = await cliPumbleApiClient.getRedirectUrl(app, newApp, true);
        await axios.get(redirectUrl);
    }

    private logManifestChanges(changes: ManifestChange[]) {
        changes.forEach((item, index) => {
            this.logManifestChange(index + 1, item);
        });
    }

    private logManifestChange(index: number, change: ManifestChange) {
        const str = `${index}. (${change.action.toUpperCase()}) - ${yellow(change.key)}`;
        const valueChange =
            red`${change.oldValue?.toString() || '(none)'}` +
            ' -> ' +
            green`${change.newValue?.toString() || '(none)'}`;
        console.log(`${str}\n${valueChange}\n`);
    }
}

export const cliAppSync = new AppSync();
