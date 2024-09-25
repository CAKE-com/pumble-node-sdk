import { BaseApiClient } from "../BaseApiClient";
import { V1 } from "./types";
var mime = require('mime-types')
var path = require('path'); 
var fs = require('fs');

export class FileuploadApiClient extends BaseApiClient {
    private urls = {
        uploadFile: () => `/upload/files`
    };

    public async uploadFile(filePath: string, uploadToken: V1.FileUploadToken): Promise<V1.CompleteFileUpload|null> {
        const formData = new FormData();
        try {
            const file = fs.readFileSync(filePath);
            const mimeType = mime.lookup(filePath);

            formData.append('file', new Blob([file], {type: mimeType ? mimeType : 'application/octet-stream'}), path.parse(filePath).base)
        } catch(e) {
            console.log(`Error while reading file ${filePath}. Err ${e}.`);
            return null;
        }
        
        return await this.sendFileToServer(formData, uploadToken);
    }

    public async uploadFileFrom(buffer: Buffer, name: string, mimeType: string, uploadToken: V1.FileUploadToken): Promise<V1.CompleteFileUpload|null> {
        const formData = new FormData();
        formData.append('file', new Blob([buffer], {type: mimeType ? mimeType : 'application/octet-stream'}), name)

        return await this.sendFileToServer(formData, uploadToken);
    }

    private async sendFileToServer(formData: FormData, uploadToken: V1.FileUploadToken): Promise<V1.CompleteFileUpload|null> {
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