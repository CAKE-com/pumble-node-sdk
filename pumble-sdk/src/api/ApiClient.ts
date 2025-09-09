import axios, {AxiosInstance, AxiosRequestConfig} from 'axios';
import {OAuth2Client} from '../auth';
import {PUMBLE_API_URL, PUMBLE_FILEUPLOAD_URL} from '../constants';
import {ChannelsApiClientV1} from './v1/ChannelsApiClientV1';
import {MessagesApiClientV1} from './v1/MessagesApiClientV1';
import {UsersApiClientV1} from './v1/UsersApiClientV1';
import {WorkspaceApiClientV1} from './v1/WorkspaceApiClientV1';
import {CallsApiClientV1} from './v1/CallsApiClientV1';
import {AppClientV1} from "./v1/AppClientV1";
import {FileHostClientV1} from "./v1/FileHostClientV1";

export class ApiClient {
    private axiosInstance: AxiosInstance;
    private fileuploadAxiosInstance: AxiosInstance;
    private fileHostAxiosInstance: AxiosInstance;
    public readonly v1: {
        channels: ChannelsApiClientV1;
        messages: MessagesApiClientV1;
        users: UsersApiClientV1;
        workspace: WorkspaceApiClientV1;
        calls: CallsApiClientV1;
        app: AppClientV1;
        files: FileHostClientV1
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
        this.fileuploadAxiosInstance = axios.create({
            baseURL: PUMBLE_FILEUPLOAD_URL
        });
        this.fileHostAxiosInstance = axios.create({
            headers: {
                token: client.accessToken,
                'x-app-token': client.appKey
            }
        });
        this.v1 = {
            channels: new ChannelsApiClientV1(this.axiosInstance, this.workspaceId, this.workspaceUserId),
            messages: new MessagesApiClientV1(this.axiosInstance, this.fileuploadAxiosInstance, this.workspaceId, this.workspaceUserId),
            users: new UsersApiClientV1(this.axiosInstance, this.workspaceId, this.workspaceUserId),
            workspace: new WorkspaceApiClientV1(this.axiosInstance, this.workspaceId, this.workspaceUserId),
            calls: new CallsApiClientV1(this.axiosInstance, this.workspaceId, this.workspaceUserId),
            app: new AppClientV1(this.axiosInstance, this.workspaceId, this.workspaceUserId),
            files: new FileHostClientV1(this.fileHostAxiosInstance, this.workspaceId, this.workspaceUserId)
        };
    }

    public async request<T, R = unknown>(config: AxiosRequestConfig<R>): Promise<T> {
        const result = await this.axiosInstance.request<T>(config);
        return result.data;
    }
}
