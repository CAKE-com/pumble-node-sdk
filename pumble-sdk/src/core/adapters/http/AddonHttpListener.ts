import { AddonService } from '../../services/AddonService';
import express, { Express, Request, Response } from 'express';
import { rawBody, verifySignature } from './middlewares';
import { AddonManifest } from '../../types/types';
import {
    AppMessage,
    isBlockInteractionEphemeralMessage,
    isBlockInteractionMessage,
    isBlockInteractionView,
    isGlobalShortcut,
    isMessageShortcut,
    isPumbleEvent,
    isSlashCommand,
} from '../../types/payloads';
import path from 'path';

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
        this.manifest.slashCommands.forEach((slashCommand) => {
            paths.add(this.getPathname(slashCommand.url));
        });
        this.manifest.shortcuts.forEach((shortcut) => {
            paths.add(this.getPathname(shortcut.url));
        });
        this.server.post(Array.from(paths), rawBody(), verifySignature(this.manifest.signingSecret), (req, res) => {
            this.handleMessage(req, res);
        });
    }

    private handleMessage(req: Request, res: Response) {
        const message: AppMessage = req.body;
        if (isPumbleEvent(message)) {
            const pumbleEventPayload = JSON.parse(message.body);
            this.service.postEvent({ ...message, body: pumbleEventPayload });
            res.send('ok');
            return;
        } else {
            const ack = this.ackFunction(res);
            const nack = this.nackFunction(res);
            if (isMessageShortcut(message)) {
                this.service.postMessageShortcut(message, ack, nack);
                return;
            }
            if (isGlobalShortcut(message)) {
                this.service.postGlobalShortcut(message, ack, nack);
                return;
            }
            if (isSlashCommand(message)) {
                this.service.postSlashCommand(message, ack, nack);
                return;
            }
            if (isBlockInteractionView(message)) {
                this.service.postBlockInteractionView(message, ack, nack);
            }
            if (isBlockInteractionMessage(message)) {
                this.service.postBlockInteractionMessage(message, ack, nack);
            }
            if (isBlockInteractionEphemeralMessage(message)) {
                this.service.postBlockInteractionEphemeralMessage(message, ack, nack);
            }
        }
    }

    private ackFunction(res: express.Response) {
        return async (arg?: string) => {
            if (!res.headersSent) {
                res.contentType('application/json').status(200).send({ message: arg });
            }
        };
    }

    private nackFunction(res: express.Response) {
        return async (arg?: string, status: number = 400) => {
            if (!res.headersSent) {
                res.contentType('application/json').status(status).send({ message: arg });
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
