import { AxiosInstance } from "axios";
import { BaseApiClient } from "../BaseApiClient";
import { V1 } from "./types";
import { FileuploadApiClient } from "./FileuploadApiClient";
var fs = require('fs');
var path = require('path'); 

export class FilesApiClientV1 extends BaseApiClient {
    public constructor(
        protected axiosInstance: AxiosInstance,
        protected workspaceId: string,
        protected workspaceUserId: string,
        protected fileuploadApiClient: FileuploadApiClient
    ) {
        super(axiosInstance, workspaceId, workspaceUserId);
        this.fileuploadApiClient = fileuploadApiClient;
    }

    private urls = {
        getRequestFileUploadToken: () => `/v1/files/getUploadToken`,
        completeFileUpload: () => `/v1/files/completeUpload`,
    };

    public async uploadFile(filePath: string): Promise<V1.File|null> {    
        let fileSize = 0;
        try {
            const fileStats = fs.statSync(filePath);
            fileSize = fileStats.size;
        } catch (e) {
            console.log(`Error while fetching file size. Err: ${e}.`)
            return null;
        }

        const uploadToken = await this.getUploadToken(path.parse(filePath).base, fileSize);

        const uploadedFile = await this.fileuploadApiClient.uploadFile(filePath, uploadToken);
        if (!uploadedFile) {
            return null;
        }
        
        return await this.completeFileUpload(uploadedFile);
    }

    public async uploadFileFrom(file: Buffer, name: string, mimeType: string): Promise<V1.File|null> {
        const fileSize = file.length;

        const uploadToken = await this.getUploadToken(name, fileSize);

        const uploadedFile = await this.fileuploadApiClient.uploadFileFrom(file, name, mimeType, uploadToken);
        if (!uploadedFile) {
            return null;
        }
        
        return await this.completeFileUpload(uploadedFile);
    }

    private async getUploadToken(fileName: string, fileSize: number): Promise<V1.FileUploadToken> {
        const getUploadTokenUrl = this.urls.getRequestFileUploadToken();

        return await this.request<V1.FileUploadToken>({ 
            method: 'POST', 
            url: getUploadTokenUrl,
            data: {
                filename: fileName,
                length: fileSize,
                audioRecording: false,
                videoRecording: false
            }
        });
    }

    private async completeFileUpload(uploadedFile: V1.CompleteFileUpload): Promise<V1.File> {
        const completeFileUploadUrl = this.urls.completeFileUpload();

        return await this.request<V1.File>({ method: 'POST', url: completeFileUploadUrl, data: uploadedFile});
    }
}