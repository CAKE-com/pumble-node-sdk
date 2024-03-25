import { AddonService } from '../../services/AddonService';
import { AddonManifest } from '../../types/types';
import axios, { AxiosInstance } from 'axios';
import { WebSocket } from 'ws';
import { AckCallback, NackCallback } from '../../types/contexts';
import { promisify } from 'util';
import { PUMBLE_API_URL } from '../../../constants';
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

type WebsocketMessage = {
    payload: AppMessage;
    correlation_id: string;
};

export class AddonWebsocketListener<T extends AddonManifest> {
    private axiosInstance: AxiosInstance;

    public constructor(private service: AddonService<T>) {
        this.axiosInstance = axios.create({ baseURL: PUMBLE_API_URL });
    }

    private get manifest(): AddonManifest {
        return this.service.getManifest();
    }

    private async getWebsocketUrl(): Promise<string> {
        const url = `/apps/${this.manifest.id}/websocket-connection`;
        const result = await this.axiosInstance.get<{ url: string }>(url, {
            params: { appSecret: this.manifest.appKey },
        });
        return result.data.url;
    }

    private async connect() {
        const url = await this.getWebsocketUrl();
        const ws = new WebSocket(url);
        ws.on('open', () => {
            console.log(`Connected with ${PUMBLE_API_URL}`);
        });
        ws.on('close', async () => {
            console.log(`Closed connection with ${PUMBLE_API_URL}`);
            ws.removeAllListeners();
            ws.close();
            await promisify(setTimeout)(2000);
            await this.connect();
        });
        ws.on('error', async (e) => {
            console.log('Websocket error', e);
            ws.removeAllListeners();
            ws.close();
            await promisify(setTimeout)(2000);
            await this.connect();
        });
        ws.on('message', async (data) => {
            const request: WebsocketMessage = JSON.parse(data.toString());
            await this.handleMessage(request.payload, request.correlation_id, ws);
        });
    }

    private async handleMessage(message: AppMessage, correlationId: string, ws: WebSocket) {
        if (isPumbleEvent(message)) {
            const pumbleEventPayload = JSON.parse(message.body);
            this.service.postEvent({ ...message, body: pumbleEventPayload });
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

    public async start() {
        await this.connect();
    }
}
