import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { OAuth2Client } from '../auth';
import { PUMBLE_API_URL } from '../constants';
import { InteractionsClientInternalV1 } from "./v1/InteractionsClientInternalV1";

export class ApiClientInternal {
    private readonly axiosInstance: AxiosInstance;
    public readonly v1: {
        interactions: InteractionsClientInternalV1;
    };

    public constructor(
        client: OAuth2Client,
        public readonly workspaceId: string,
        public readonly workspaceUserId: string
    ) {
        if (!client.accessToken) {
            throw new Error('Client is not authenticated');
        }
        this.axiosInstance = axios.create({
            baseURL: PUMBLE_API_URL,
            headers: {
                'content-type': 'application/json',
                token: client.accessToken,
                'x-app-token': client.appKey,
            },
        });
        this.v1 = {
            interactions: new InteractionsClientInternalV1(this.axiosInstance, this.workspaceId, this.workspaceUserId),
        };
    }

    public async request<T, R = unknown>(config: AxiosRequestConfig<R>): Promise<T> {
        const result = await this.axiosInstance.request<T>(config);
        return result.data;
    }
}
