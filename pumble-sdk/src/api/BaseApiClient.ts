import { AxiosInstance, AxiosRequestConfig } from 'axios';

export class BaseApiClient {
    public constructor(
        protected axiosInstance: AxiosInstance,
        protected workspaceId: string,
        protected workspaceUserId: string
    ) {}
    protected async request<T, R = unknown>(config: AxiosRequestConfig<R>): Promise<T> {
        const result = await this.axiosInstance.request<T>(config);
        return result.data;
    }
}
