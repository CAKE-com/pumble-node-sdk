import { cliPumbleApiClient } from './PumbleApiClient';
import { cliEnvironment } from './Environment';
import { AddonManifest } from '../types';
import axios, { AxiosError } from 'axios';
import path from 'path';
import prompts from 'prompts';

class AppSync {
    public async syncApp(manifest: AddonManifest, host: string, install: boolean): Promise<{ created: boolean }> {
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
        if (this.manifestChanged(app, manifest)) {
            if (app.published) {
                if (cliEnvironment.allowSyncingPublishedApps) {
                    const { confirmation } = await prompts([
                        {
                            name: 'confirmation',
                            type: 'confirm',
                            message: 'WARNING. Addon is already published. Are you sure you want to update it?',
                        },
                    ]);
                    if (confirmation) {
                        await this.updateApp(app, manifest);
                    }
                } else {
                    console.log('App is published and it cannot not be updated!');
                }
            } else {
                await this.updateApp(app, manifest);
            }
        }
        if (!(await this.isAuthorized(app.id)) && install) {
            await this.authorizeApp(app, manifest);
            console.log('App is installed');
        } else {
            if (this.botScopesChanged(app, manifest) && install) {
                await this.reinstallApp(app, manifest);
                console.log('Bot scopes have changed. App is reinstalled.');
            } else if (this.userScopesChanged(app, manifest) && install) {
                await this.authorizeApp(app, manifest);
                console.log('User scopes have changed. App is reauthorized.');
            }
        }
        return { created };
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
                console.log('App is found. Using existing app.');
                return { app: pumbleApp, created: false };
            } catch (err) {}
        }
        if (!appFound) {
            console.log('App is not found. Creating a new App.');
            const app = await cliPumbleApiClient.createApp(manifest);
            return { app, created: true };
        }
        throw new Error('App is not created!');
    }

    private manifestChanged(oldApp: AddonManifest, newApp: AddonManifest): boolean {
        if (
            !oldApp.name !== newApp.name ||
            oldApp.displayName !== oldApp.displayName ||
            oldApp.botTitle !== newApp.botTitle
        ) {
            return true;
        }
        if (
            !oldApp.redirectUrls.every((x) => newApp.redirectUrls.includes(x)) ||
            !newApp.redirectUrls.every((x) => oldApp.redirectUrls.includes(x))
        ) {
            return true;
        }
        if (oldApp.blockInteraction?.url !== newApp.blockInteraction?.url) {
            return true;
        }
        for (const slash of oldApp.slashCommands) {
            const newAppSlashCommand = newApp.slashCommands.find((x) => x.command === slash.command);
            if (!newAppSlashCommand) return true;
            if (newAppSlashCommand.url !== slash.url) {
                return true;
            }
            if (newAppSlashCommand.description !== slash.description) {
                return true;
            }
            if (newAppSlashCommand.usageHint !== slash.usageHint) {
                return true;
            }
        }
        for (const slash of newApp.slashCommands) {
            if (!oldApp.slashCommands.find((x) => x.command === slash.command)) {
                return true;
            }
        }
        for (const short of oldApp.shortcuts) {
            const newAppShortcut = newApp.shortcuts.find(
                (x) => x.command === short.command && x.shortcutType === short.shortcutType
            );
            if (!newAppShortcut) {
                return true;
            }
            if (newAppShortcut.url !== short.url) {
                return true;
            }
            if (newAppShortcut.description !== short.description) {
                return true;
            }
            if (newAppShortcut.displayName !== short.displayName) {
                return true;
            }
        }
        for (const short of newApp.shortcuts) {
            if (!oldApp.shortcuts.find((x) => x.command === short.command && x.shortcutType === short.shortcutType)) {
                return true;
            }
        }
        if (newApp.eventSubscriptions.url !== oldApp.eventSubscriptions.url) {
            return true;
        }
        if (
            !(newApp.eventSubscriptions.events || []).every((x) =>
                (oldApp.eventSubscriptions.events || []).includes(x)
            ) ||
            !(oldApp.eventSubscriptions.events || []).every((x) => (newApp.eventSubscriptions.events || []).includes(x))
        ) {
            return true;
        }
        return this.botScopesChanged(oldApp, newApp) || this.userScopesChanged(oldApp, newApp);
    }

    private async updateApp(app: AddonManifest, manifest: AddonManifest) {
        await cliPumbleApiClient
            .updateApp(app.id, manifest)
            .catch((e) => {
                if (e instanceof AxiosError) {
                    console.error(`Error updating app: ${e.response?.data.message}`);
                }
            })
            .then(() => {
                console.log('App is updated!');
            });
    }

    private userScopesChanged(oldApp: AddonManifest, newApp: AddonManifest): boolean {
        const newAppScopes: { botScopes: string[]; userScopes: string[] } = newApp.scopes as any;
        const oldAppScopes: { botScopes: string[]; userScopes: string[] } = oldApp.scopes as any;
        if (!newAppScopes.userScopes.every((x) => oldAppScopes.userScopes.includes(x))) {
            return true;
        }
        if (!oldAppScopes.userScopes.every((x) => newAppScopes.userScopes.includes(x))) {
            return true;
        }
        return false;
    }

    private botScopesChanged(oldApp: AddonManifest, newApp: AddonManifest): boolean {
        const newAppScopes: { botScopes: string[]; userScopes: string[] } = newApp.scopes as any;
        const oldAppScopes: { botScopes: string[]; userScopes: string[] } = oldApp.scopes as any;
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

    private async authorizeApp(app: AddonManifest, newApp: AddonManifest): Promise<void> {
        const { redirectUrl } = await cliPumbleApiClient.getRedirectUrl(app, newApp, false);
        await axios.get(redirectUrl);
    }
}

export const cliAppSync = new AppSync();
