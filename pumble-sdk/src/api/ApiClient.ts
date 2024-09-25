import axios, {AxiosInstance, AxiosRequestConfig, AxiosRequestHeaders} from 'axios';
import {OAuth2Client} from '../auth';
import {PUMBLE_API_URL, PUMBLE_FILEUPLOAD_URL} from '../constants';
import {ChannelsApiClientV1} from './v1/ChannelsApiClientV1';
import {MessagesApiClientV1} from './v1/MessagesApiClientV1';
import {UsersApiClientV1} from './v1/UsersApiClientV1';
import {WorkspaceApiClientV1} from './v1/WorkspaceApiClientV1';
import {CallsApiClientV1} from './v1/CallsApiClientV1';
import { FilesApiClientV1 } from './v1/FilesApiClientV1';
import {schemasLoader} from "../schemas";
import {AppClientV1} from "./v1/AppClientV1";
import { FileuploadApiClient } from './v1/FileuploadApiClient';

export class ApiClient {
    private axiosInstance: AxiosInstance;
    private fileuploadAxiosInstance: AxiosInstance;
    public readonly v1: {
        channels: ChannelsApiClientV1;
        messages: MessagesApiClientV1;
        users: UsersApiClientV1;
        workspace: WorkspaceApiClientV1;
        calls: CallsApiClientV1;
        app: AppClientV1;
        files: FilesApiClientV1;
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
        })
        this.axiosInstance.interceptors.request.use(async (request) => {
            const controller = new AbortController();
            if (request.method &&
                ['post', 'put'].includes(request.method.toLowerCase()) &&
                request.url?.includes('/messages')
            ) {
                if (request.data?.blocks &&
                    !(await schemasLoader.blocksValid(request.data.blocks))) {
                    controller.abort('Blocks model invalid. Aborting request...');
                    return {
                        ...request,
                        headers: {} as AxiosRequestHeaders,
                        reason: controller.signal.reason,
                        signal: controller.signal,
                    };
                }

                if (request.data?.attachments &&
                    !(await schemasLoader.attachmentBlocksValid(request.data.attachments))) {
                    controller.abort('Attachment block model invalid. Aborting request...');
                    return {
                        ...request,
                        headers: {} as AxiosRequestHeaders,
                        reason: controller.signal.reason,
                        signal: controller.signal,
                    };
                }
            }

            return {
                ...request,
            };
        });
        this.v1 = {
            channels: new ChannelsApiClientV1(this.axiosInstance, this.workspaceId, this.workspaceUserId),
            messages: new MessagesApiClientV1(this.axiosInstance, this.workspaceId, this.workspaceUserId),
            users: new UsersApiClientV1(this.axiosInstance, this.workspaceId, this.workspaceUserId),
            workspace: new WorkspaceApiClientV1(this.axiosInstance, this.workspaceId, this.workspaceUserId),
            calls: new CallsApiClientV1(this.axiosInstance, this.workspaceId, this.workspaceUserId),
            app: new AppClientV1(this.axiosInstance, this.workspaceId, this.workspaceUserId),
            files: new FilesApiClientV1(this.axiosInstance, this.workspaceId, this.workspaceUserId, new FileuploadApiClient(this.fileuploadAxiosInstance, this.workspaceId, this.workspaceUserId))
        };
    }

    public async request<T, R = unknown>(config: AxiosRequestConfig<R>): Promise<T> {
        const result = await this.axiosInstance.request<T>(config);
        return result.data;
    }
}
