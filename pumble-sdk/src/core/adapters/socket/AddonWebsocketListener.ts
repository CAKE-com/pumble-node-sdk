import { AddonService } from '../../services/AddonService';
import { AddonManifest } from '../../types/types';
import axios, { AxiosInstance } from 'axios';
import {WebSocket} from 'ws';
import {AckCallback, ResponseCallback, NackCallback} from '../../types/contexts';
import { promisify } from 'util';
import { PUMBLE_API_URL } from '../../../constants';
import {
    AppMessage,
    isBlockInteractionEphemeralMessage,
    isBlockInteractionMessage,
    isBlockInteractionView, isDynamicMenuInteraction,
    isGlobalShortcut,
    isMessageShortcut,
    isPumbleEvent,
    isSlashCommand,
    isViewAction,
} from '../../types/payloads';
import express, {Express, Request, Response} from "express";
import {ManifestProcessor} from "../../util/ManifestProcessor";
import {AddonHttpServerOptions} from "../http/AddonHttpListener";

type WebsocketMessage = {
    payload: AppMessage;
    correlation_id: string;
};

export class AddonWebsocketListener<T extends AddonManifest> {
    private axiosInstance: AxiosInstance;
    private server?: Express;

    public constructor(private service: AddonService<T>, private options: AddonHttpServerOptions) {
        this.axiosInstance = axios.create({baseURL: PUMBLE_API_URL});
    }

    private get manifest(): AddonManifest {
        return this.service.getManifest();
    }

    private async getWebsocketUrl(): Promise<string> {
        const url = `/apps/${this.manifest.id}/websocket-connection`;
        const result = await this.axiosInstance.get<{ url: string }>(url, {
            params: {appKey: this.manifest.appKey},
        });
        return result.data.url;
    }

    private async connect() {
        const urlString = await this.getWebsocketUrl();
        const ws = new WebSocket(urlString);
        const url = new URL(urlString);
        let pingInterval: NodeJS.Timeout;
        ws.on('open', () => {
            console.log(`Websocket connected to ${url.host}`);
            pingInterval = setInterval(() => {
                ws.send("ping");
            }, 25000);
        });
        ws.on('close', async () => {
            console.log(`Closed connection with ${url.host}`);
            ws.removeAllListeners();
            ws.close();
            if (pingInterval) {
                clearInterval(pingInterval);
            }
            await promisify(setTimeout)(2000);
            await this.connect();
        });
        ws.on('error', async (e) => {
            console.log('Websocket error', e);
            ws.removeAllListeners();
            ws.close();
            if (pingInterval) {
                clearInterval(pingInterval);
            }
            await promisify(setTimeout)(2000);
            await this.connect();
        });
        ws.on('message', async (data) => {
            if (data.toString() === "pong") {
                return;
            }
            const request: WebsocketMessage = JSON.parse(data.toString());
            await this.handleMessage(request.payload, request.correlation_id, ws);
        });
    }

    private async handleMessage(message: AppMessage, correlationId: string, ws: WebSocket) {
        if (isPumbleEvent(message)) {
            const pumbleEventPayload = JSON.parse(message.body);
            this.service.postEvent({...message, body: pumbleEventPayload});
            return;
        } else {
            const ack: AckCallback = async (arg?: string) => {
                const response = {
                    correlation_id: correlationId,
                    status: 200,
                    message: arg,
                };
                ws.send(Buffer.from(JSON.stringify(response)));
            };
            const nack: NackCallback = async (arg?: string, status?: number) => {
                const response = {
                    correlation_id: correlationId,
                    status: status || 500,
                    message: arg,
                };
                ws.send(Buffer.from(JSON.stringify(response)));
            };

            const response: ResponseCallback<any> = async (result: any) => {
                const response = {
                    correlation_id: correlationId,
                    status: 200,
                    message: "ok",
                    body: result
                };
                ws.send(Buffer.from(JSON.stringify(response)));
            };

            if (isMessageShortcut(message)) {
                this.service.postMessageShortcut(message, response, ack, nack);
                return;
            }

            if (isGlobalShortcut(message)) {
                this.service.postGlobalShortcut(message, response, ack, nack);
                return;
            }

            if (isSlashCommand(message)) {
                this.service.postSlashCommand(message, response, ack, nack);
            }

            if (isBlockInteractionView(message)) {
                this.service.postBlockInteractionView(message, response, ack, nack);
            }

            if (isBlockInteractionMessage(message)) {
                this.service.postBlockInteractionMessage(message, response, ack, nack);
            }
            if (isBlockInteractionEphemeralMessage(message)) {
                this.service.postBlockInteractionEphemeralMessage(message, response, ack, nack);
            }
            if (isDynamicMenuInteraction(message)) {
                this.service.postDynamicSelectMenu(message, response, nack);
            }
            if (isViewAction(message)) {
                this.service.postViewAction(message, response, ack, nack);
            }
        }
    }

    private serveManifest(req: Request, res: Response) {
        try {
            const host = process.env.ADDON_HOST ? process.env.ADDON_HOST : `https://${req.hostname}`;
            res.send(ManifestProcessor.prepareForServing(this.manifest, host));
        } catch (e) {
            console.error(`Unable to serve manifest: ${e}`);
            res.status(500).send();
        }
    }

    public async start(...onConfig: Array<(e: Express, addon: AddonService<T>) => void>) {
        if (onConfig && onConfig.length > 0) {
            this.server = express();
            this.server.get('/manifest', async (req, res) => {
                this.serveManifest(req, res);
            });
            for (const configCallback of onConfig) {
                configCallback(this.server, this.service);
            }
            await new Promise<void>((resolve) => {
                this.server?.listen(this.options.serverPort, resolve);
            });
            const yellow = "\x1b[33m";
            const reset = "\x1b[0m";
            console.warn(`${yellow}Addon http server listening at ${this.options.serverPort}, also socket mode is enabled. 
                If other users will not be authorizing this app and it won't be listed on the Marketplace, feel free to disable the HTTP endpoints. 
                Set 'redirect:{ enable: false }' explicitly and remove onServerConfiguring from the app:App object in your main file. 
                Note: Disabling Socket Mode is highly recommended for production-grade add-ons.${reset}`);
        }
        await this.connect();
    }
}