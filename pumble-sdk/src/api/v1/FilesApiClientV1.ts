import { AxiosInstance } from "axios";
import { BaseApiClient } from "../BaseApiClient";
import { V1 } from "./types";
import { FileuploadApiClient } from "./FileuploadApiClient";
var fs = require('fs');
var path = require('path'); 
var mime = require('mime-types')

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
        getRequestFileUploadToken: () => `/v1/files/upload/token`,
        completeFileUpload: () => `/v1/files/upload/complete`,
    };

    public async uploadFile(input: Buffer|Blob|String, options?: V1.FileUploadOptions): Promise<V1.File|null> {
        var processedInput = await this.processInput(input, options);
        if (!processedInput) {
            return null;
        }

        const uploadToken = await this.getUploadToken(processedInput.name, processedInput.length);

        const uploadedFile = await this.fileuploadApiClient.uploadFile(processedInput.blob, processedInput.name, uploadToken);
        if (!uploadedFile) {
            return null;
        }
        
        return await this.completeFileUpload(uploadedFile);
    }

    private async processInput(input: Buffer|Blob|String, options?: V1.FileUploadOptions): Promise<V1.ProccessedFile|null> {
        if (input instanceof Blob) {
            if (!options) {
                return null;
            }

            return {
                blob: input,
                name: options.name,
                length: input.size
            };
        }

        if (input instanceof Buffer) {
            if (!options) {
                return null;
            }

            return {
                blob: new Blob([input], {type: options.mimeType ? options.mimeType : 'application/octet-stream'}),
                name: options.name,
                length: input.length
            };
        }

        const buffer = await this.readFile(input);
        if (!buffer) {
            return null;
        }


        const name = options?.name ? options.name : path.parse(input).base;
        const mimeTypeFromPath = mime.lookup(input);
        return {
            blob: new Blob([buffer], {type: options?.mimeType ? options.mimeType : mimeTypeFromPath}),
            name: name,
            length: buffer.length
        };
    }

    private async readFile(filePath: String): Promise<Buffer|null> {
        try {
            return fs.readFileSync(filePath);
        } catch (e) {
            console.log(`Error while reading ${filePath}. Err: ${e}.`);
            return null;
        }
    }

    private async getUploadToken(fileName: string, fileSize: number): Promise<V1.FileUploadToken> {
        const getUploadTokenUrl = this.urls.getRequestFileUploadToken();

        return await this.request<V1.FileUploadToken>({ 
            method: 'POST', 
            url: getUploadTokenUrl,
            data: {
                filename: fileName,
                length: fileSize
            }
        });
    }

    private async completeFileUpload(uploadedFile: V1.CompleteFileUpload): Promise<V1.File> {
        const completeFileUploadUrl = this.urls.completeFileUpload();

        return await this.request<V1.File>({ method: 'POST', url: completeFileUploadUrl, data: uploadedFile});
    }
}