import {BaseApiClient} from "../BaseApiClient";
import {V1} from "./types";

export class AppClientV1 extends BaseApiClient {
    private urls = {
        removeAuthorization: () => `/v1/app/authorization`,
        uninstallApp: () => `/v1/app/installation`,
        publishHomeView: (workspaceUserId: string) => `/v1/app/homeView/workspaceUsers/${workspaceUserId}`,
    };

    public async removeAuthorization() {
        return this.request({
            url: this.urls.removeAuthorization(),
            method: 'DELETE',
        });
    }

    public async uninstallApp() {
        return this.request({
            url: this.urls.uninstallApp(),
            method: 'DELETE',
        });
    }

    public async publishHomeView(workspaceUserId: string, payload: V1.PublishHomeViewRequest) {
        return this.request({
            url: this.urls.publishHomeView(workspaceUserId),
            method: 'POST',
            data: payload
        });
    }
}