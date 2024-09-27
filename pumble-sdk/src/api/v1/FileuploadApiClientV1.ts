import { BaseApiClient } from "../BaseApiClient";
import { V1 } from "./types";

export class FileuploadApiClientV1 extends BaseApiClient {
    private urls = {
        uploadFile: () => `/upload/files`
    };

    public async uploadFile(file: Blob, name: string, uploadToken: V1.FileUploadToken): Promise<V1.CompleteFileUpload|null> {
        const formData = new FormData();

        formData.append('file', file, name);

        const uploadFileUrl = this.urls.uploadFile();
        return await this.request<V1.CompleteFileUpload>({ 
            method: 'POST', 
            url: uploadFileUrl, 
            data: formData,
            headers: {
                'authtoken': uploadToken.token,
                'Remote-Product-Token': uploadToken?.remoteProductToken
        }});
    }
}