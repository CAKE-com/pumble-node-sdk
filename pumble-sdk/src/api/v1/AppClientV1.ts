import {BaseApiClient} from "../BaseApiClient";
import {V1} from "./types";

export class AppClientV1 extends BaseApiClient {
    private urls = {
        removeAuthorization: () => `/v1/app/authorization`,
        uninstallApp: () => `/v1/app/installation`,
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
}