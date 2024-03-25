import { CredentialsStore, OAuth2Config } from '../../auth';
import {
    BlockInteractionContext,
    GlobalShortcutContext,
    MessageShortcutContext,
    OnMessageContext,
    OnReactionContext,
    PumbleEventContext,
    SlashCommandContext,
} from '../types/contexts';
import { PumbleEventType } from '../types/pumble-events';
import { Express } from 'express';
import { promises as fs } from 'fs';
import { AddonManifest } from '../types/types';
import { setup } from './AddonService';
import _ from 'lodash';
import { Addon } from './Addon';

type OptionsForEvent<T extends PumbleEventType> = T extends 'NEW_MESSAGE'
    ? { match: string | RegExp; includeBotMessages?: boolean }
    : T extends 'UPDATED_MESSAGE'
    ? { match: string | RegExp; includeBotMessages?: boolean }
    : T extends 'REACTION_ADDED'
    ? { match: string | RegExp }
    : never;

type EventContext<T extends PumbleEventType> = T extends 'NEW_MESSAGE'
    ? OnMessageContext
    : T extends 'UPDATED_MESSAGE'
    ? OnMessageContext
    : T extends 'REACTION_ADDED'
    ? OnReactionContext
    : PumbleEventContext<T>;

type EventDeclare<T extends PumbleEventType> = {
    name: T;
    options?: OptionsForEvent<T>;
    handler: (ctx: EventContext<T>) => void | Promise<void>;
};

type Distribute<U> = U extends PumbleEventType ? EventDeclare<U> : never;
type PossibleEvents = Distribute<PumbleEventType>;

export type App = {
    globalShortcuts?: {
        path?: string;
        name: string;
        description?: string;
        handler: (ctx: GlobalShortcutContext) => void | Promise<void>;
    }[];
    messageShortcuts?: {
        path?: string;
        name: string;
        description?: string;
        handler: (ctx: MessageShortcutContext) => void | Promise<void>;
    }[];
    slashCommands?: {
        path?: string;
        command: string;
        usageHint?: string;
        description?: string;
        handler: (ctx: SlashCommandContext) => void | Promise<void>;
    }[];
    blockInteraction?: {
        path?: string;
        interactions: (
            | {
                  viewId: string;
                  sourceType: 'VIEW';
                  handlers: {
                      [key: string]: (ctx: BlockInteractionContext<'VIEW'>) => void | Promise<void>;
                  };
              }
            | {
                  sourceType: 'MESSAGE';
                  handlers: {
                      [key: string]: (ctx: BlockInteractionContext<'MESSAGE'>) => void | Promise<void>;
                  };
              }
            | {
                  sourceType: 'EPHEMERAL_MESSAGE';
                  handlers: {
                      [key: string]: (ctx: BlockInteractionContext<'EPHEMERAL_MESSAGE'>) => void | Promise<void>;
                  };
              }
        )[];
    };
    events?: PossibleEvents[];
    eventsPath?: string;
    tokenStore?: CredentialsStore;
    onServerConfiguring?: (express: Express, addon: Addon<AddonManifest>) => void | Promise<void>;
    redirect?: OAuth2Config['redirect'];
    id?: string;
    clientSecret?: string;
    appKey?: string;
    signingSecret?: string;
    botScopes?: string[];
    userScopes?: string[];
    port?: number;
};

class Runner {
    public async start(app: App): Promise<Addon<AddonManifest>> {
        const port = app.port || +(process.env.PUMBLE_ADDON_PORT || '5000');
        const manifest_path = process.env.PUMBLE_ADDON_MANIFEST_PATH || 'manifest.json';
        const emitManifestPath = process.env.PUMBLE_ADDON_EMIT_MANIFEST_PATH;
        const manifest = await this.buildManifest(app, manifest_path);
        if (emitManifestPath) {
            let existing: AddonManifest | undefined;
            try {
                existing = JSON.parse((await fs.readFile(emitManifestPath)).toString());
            } catch (err) {}
            const { id, signingSecret, clientSecret, appKey, ...cleanedManifest } = manifest;
            if (!existing || this.hasManifestChanged(existing, cleanedManifest)) {
                await fs.writeFile(emitManifestPath, JSON.stringify(cleanedManifest));
            }
        }
        return await this.startAddonServer(app, manifest, port);
    }

    public hasManifestChanged(oldManifest: Partial<AddonManifest>, newManifest: Partial<AddonManifest>): boolean {
        return !_.isEqual(oldManifest, newManifest);
    }

    private async startAddonServer(app: App, manifest: AddonManifest, port: number): Promise<Addon<AddonManifest>> {
        const addon = setup(manifest, {
            serverPort: port,
            oauth2Config: {
                redirect: app.redirect || { enable: true },
                tokenStore: app.tokenStore,
            },
        });
        if (app.onServerConfiguring) {
            addon.onServerConfiguring(app.onServerConfiguring);
        }
        addon.onError((err) => {
            console.error('Unhandled error occurred', err);
        });
        await addon.start();
        return addon;
    }

    private async buildManifest(app: App, manifestPath: string): Promise<AddonManifest> {
        const hookUrl = `/hook`;
        const redirectUrl = `/redirect`;
        const blockInteractionsUrl = `/blockInteractions`;
        const manifest = JSON.parse((await fs.readFile(manifestPath)).toString());
        manifest.id = app.id || process.env.PUMBLE_APP_ID;
        manifest.clientSecret = app.clientSecret || process.env.PUMBLE_APP_CLIENT_SECRET;
        manifest.signingSecret = app.signingSecret || process.env.PUMBLE_APP_SIGNING_SECRET;
        manifest.appKey = app.appKey || process.env.PUMBLE_APP_KEY;
        manifest.eventSubscriptions = {
            url: app.eventsPath || hookUrl,
            events: (app.events || []).map((x) => ({
                options: x.options,
                name: x.name,
                handler: x.handler,
            })),
        };
        manifest.slashCommands = (app.slashCommands || []).map((x) => {
            return {
                command: x.command,
                description: x.description || '',
                usageHint: x.usageHint || '',
                url: x.path || hookUrl,
                handler: x.handler,
            };
        });
        manifest.shortcuts = [
            ...(app.globalShortcuts || []).map((x) => {
                return {
                    url: x.path || hookUrl,
                    shortcutType: 'GLOBAL',
                    displayName: x.name,
                    name: x.name.toLowerCase().replace(/\s+/g, '_'),
                    description: x.description || '',
                    handler: x.handler,
                };
            }),
            ...(app.messageShortcuts || []).map((x) => {
                return {
                    url: x.path || hookUrl,
                    shortcutType: 'ON_MESSAGE',
                    displayName: x.name,
                    name: x.name.toLowerCase().replace(/\s+/g, '_'),
                    description: x.description || '',
                    handler: x.handler,
                };
            }),
        ];
        manifest.blockInteraction = app.blockInteraction
            ? {
                  url: app.blockInteraction?.path ?? blockInteractionsUrl,
                  handlerView: (ctx: BlockInteractionContext<'VIEW'>) => {
                      if (!app.blockInteraction?.interactions) {
                          return;
                      }
                      var handlersList = app.blockInteraction?.interactions?.filter(
                          (i) =>
                              !!i.handlers[ctx.payload.onAction] &&
                              i.sourceType === 'VIEW' &&
                              i.viewId === ctx.payload.sourceId
                      );
                      for (let i = 0; i < handlersList?.length; ++i) {
                          const currentHandler = handlersList[i];
                          if (currentHandler.sourceType === 'VIEW') {
                              currentHandler.handlers[ctx.payload.onAction](ctx as BlockInteractionContext<'VIEW'>);
                          }
                      }
                  },
                  handlerMessage: (ctx: BlockInteractionContext<'MESSAGE'>) => {
                      if (!app.blockInteraction?.interactions) {
                          return;
                      }
                      var handlersList = app.blockInteraction?.interactions?.filter(
                          (i) => !!i.handlers[ctx.payload.onAction]
                      );
                      for (let i = 0; i < handlersList?.length; ++i) {
                          const currentHandler = handlersList[i];
                          if (currentHandler.sourceType === 'MESSAGE') {
                              currentHandler.handlers[ctx.payload.onAction](ctx as BlockInteractionContext<'MESSAGE'>);
                          }
                      }
                  },
                  handlerEphemeralMessage: (ctx: BlockInteractionContext<'EPHEMERAL_MESSAGE'>) => {
                      if (!app.blockInteraction?.interactions) {
                          return;
                      }
                      var handlersList = app.blockInteraction?.interactions?.filter(
                          (i) => !!i.handlers[ctx.payload.onAction]
                      );
                      for (let i = 0; i < handlersList?.length; ++i) {
                          const currentHandler = handlersList[i];
                          if (currentHandler.sourceType === 'EPHEMERAL_MESSAGE') {
                              currentHandler.handlers[ctx.payload.onAction](
                                  ctx as BlockInteractionContext<'EPHEMERAL_MESSAGE'>
                              );
                          }
                      }
                  },
              }
            : undefined;
        manifest.redirectUrls = app.redirect?.path ? [app.redirect.path] : [redirectUrl];
        if (app.botScopes) {
            manifest.scopes.botScopes = app.botScopes;
        }
        if (app.userScopes) {
            manifest.scopes.userScopes = app.userScopes;
        }
        return manifest;
    }
}

const runner = new Runner();

export const start = async (app: App) => {
    return runner.start(app);
};
