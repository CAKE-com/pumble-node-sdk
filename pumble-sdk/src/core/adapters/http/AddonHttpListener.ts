import { AddonService } from '../../services/AddonService';
import express, { Express, Request, Response } from 'express';
import { rawBody, verifySignature } from './middlewares';
import { AddonManifest } from '../../types/types';
import {
    AppMessage,
    isBlockInteractionEphemeralMessage,
    isBlockInteractionMessage,
    isBlockInteractionView, isDynamicMenuInteraction,
    isGlobalShortcut,
    isMessageShortcut,
    isPumbleEvent,
    isSlashCommand, isViewAction,
} from '../../types/payloads';
import path from 'path';
import {ManifestProcessor} from "../../util/ManifestProcessor";

// Debug logging helper
const isDebugMode = () => process.env.PUMBLE_DEBUG === 'true' || process.env.DEBUG === 'true';

function debugLog(category: string, message: string, data?: unknown) {
    if (!isDebugMode()) return;
    const timestamp = new Date().toISOString();
    console.log(`[DEBUG ${timestamp}] [${category}] ${message}`);
    if (data !== undefined) {
        console.log(JSON.stringify(data, null, 2));
    }
}

export type AddonHttpServerOptions = {
    serverPort: number;
};

export class AddonHttpListener<T extends AddonManifest> {
    private readonly server: Express;

    public constructor(private service: AddonService<T>, private options: AddonHttpServerOptions) {
        this.server = express();
    }

    private get manifest(): AddonManifest {
        return this.service.getManifest();
    }

    public async start(...onConfig: Array<(e: Express, addon: AddonService<T>) => void>) {
        this.registerMessageEndpoints();
        for (const configCallback of onConfig) {
            configCallback(this.server, this.service);
        }
        await new Promise<void>((resolve) => {
            this.server.listen(this.options.serverPort, resolve);
        });
        console.log(`Addon http server listening at ${this.options.serverPort}`);
    }

    private registerMessageEndpoints() {
        const paths = new Set<string>();
        if (this.manifest.eventSubscriptions?.url) {
            paths.add(this.getPathname(this.manifest.eventSubscriptions.url));
        }
        if (this.manifest.blockInteraction) {
            paths.add(this.getPathname(this.manifest.blockInteraction.url));
        }
        if (this.manifest.viewAction) {
            paths.add(this.getPathname(this.manifest.viewAction.url));
        }
        this.manifest.dynamicMenus.forEach((selectMenu) => {
            paths.add(this.getPathname(selectMenu.url));
        });
        this.manifest.slashCommands.forEach((slashCommand) => {
            paths.add(this.getPathname(slashCommand.url));
        });
        this.manifest.shortcuts.forEach((shortcut) => {
            paths.add(this.getPathname(shortcut.url));
        });
        this.server.post(Array.from(paths), rawBody(), verifySignature(this.manifest.signingSecret), (req, res) => {
            this.handleMessage(req, res);
        });
        this.server.get('/manifest', async (req, res) => {
            this.serveManifest(req, res);
        });
    }

    private handleMessage(req: Request, res: Response) {
        const startTime = Date.now();
        
        try {
            const message: AppMessage = req.body;
            
            // Debug: log incoming request
            debugLog('REQUEST', `Incoming ${req.method} ${req.path}`, {
                messageType: message.messageType,
                onAction: (message as any).onAction,
                slashCommand: (message as any).slashCommand,
                shortcut: (message as any).shortcut,
            });
            
            if (isPumbleEvent(message)) {
                const pumbleEventPayload = JSON.parse(message.body);
                debugLog('EVENT', `Event: ${pumbleEventPayload.eventType}`, pumbleEventPayload);
                this.service.postEvent({ ...message, body: pumbleEventPayload });
                debugLog('RESPONSE', `Responded in ${Date.now() - startTime}ms`);
                res.send('ok');
                return;
            } else {
                const ack = this.ackFunction(res, startTime);
                const nack = this.nackFunction(res, startTime);
                const response = this.responseFunction(res, startTime);
                if (isMessageShortcut(message)) {
                    debugLog('SHORTCUT', `Message shortcut: ${message.shortcut}`, message);
                    this.service.postMessageShortcut(message, response, ack, nack);
                    return;
                }
                if (isGlobalShortcut(message)) {
                    debugLog('SHORTCUT', `Global shortcut: ${message.shortcut}`, message);
                    this.service.postGlobalShortcut(message, response, ack, nack);
                    return;
                }
                if (isSlashCommand(message)) {
                    debugLog('COMMAND', `Slash command: ${message.slashCommand}`, message);
                    this.service.postSlashCommand(message, response, ack, nack);
                    return;
                }
                if (isBlockInteractionView(message)) {
                    debugLog('INTERACTION', `Block interaction (view): ${message.onAction}`, message);
                    this.service.postBlockInteractionView(message, response, ack, nack);
                }
                if (isBlockInteractionMessage(message)) {
                    debugLog('INTERACTION', `Block interaction (message): ${message.onAction}`, message);
                    this.service.postBlockInteractionMessage(message, response, ack, nack);
                }
                if (isBlockInteractionEphemeralMessage(message)) {
                    debugLog('INTERACTION', `Block interaction (ephemeral): ${message.onAction}`, message);
                    this.service.postBlockInteractionEphemeralMessage(message, response, ack, nack);
                }
                if (isDynamicMenuInteraction(message)) {
                    debugLog('MENU', `Dynamic menu: ${message.onAction}`, message);
                    this.service.postDynamicSelectMenu(message, response, nack);
                }
                if (isViewAction(message)) {
                    debugLog('VIEW', `View action: ${message.viewActionType}`, message);
                    this.service.postViewAction(message, response, ack, nack);
                }
            }
        } catch (err) {
            console.error('========== PUMBLE SDK HTTP ERROR ==========');
            console.error(`Time: ${new Date().toISOString()}`);
            console.error(`Path: ${req.path}`);
            if (err instanceof Error) {
                console.error(`Error: ${err.message}`);
                console.error(`Stack: ${err.stack}`);
            } else {
                console.error(`Error: ${err}`);
            }
            console.error('==========================================');
            if (!res.headersSent) {
                res.status(500).json({ error: 'Internal server error' });
            }
        }
    }

    private serveManifest(req: Request, res: Response) {
        try {
            const host = process.env.ADDON_HOST ? process.env.ADDON_HOST : `https://${req.hostname}`;
            res.send(ManifestProcessor.prepareForServing(this.manifest, host));
        } catch (e) {
            console.error('========== PUMBLE SDK MANIFEST ERROR ==========');
            console.error(`Time: ${new Date().toISOString()}`);
            if (e instanceof Error) {
                console.error(`Error: ${e.message}`);
                console.error(`Stack: ${e.stack}`);
            } else {
                console.error(`Error: ${e}`);
            }
            console.error('===============================================');
            res.status(500).json({ error: 'Unable to serve manifest' });
        }
    }

    private ackFunction(res: express.Response, startTime?: number) {
        return async (arg?: string) => {
            if (!res.headersSent) {
                debugLog('ACK', `Ack sent in ${startTime ? Date.now() - startTime : '?'}ms`, { message: arg });
                res.contentType('application/json').status(200).send({ message: arg });
            }
        };
    }

    private nackFunction(res: express.Response, startTime?: number) {
        return async (arg?: string, status: number = 400) => {
            if (!res.headersSent) {
                debugLog('NACK', `Nack sent in ${startTime ? Date.now() - startTime : '?'}ms`, { message: arg, status });
                res.contentType('application/json').status(status).send({ message: arg });
            }
        };
    }
    private responseFunction(res: express.Response, startTime?: number) {
        return async (arg: any) => {
            if (!res.headersSent) {
                debugLog('RESPONSE', `Response sent in ${startTime ? Date.now() - startTime : '?'}ms`, arg);
                res.contentType('application/json').status(200).send(arg);
            }
        };
    }
    private getPathname(url: string) {
        if (!url.match(/^https?:\/\//)) {
            const newUrl = new URL(path.join(`https://yourhost.com`, url));
            return newUrl.pathname;
        }
        return new URL(url).pathname;
    }
}
