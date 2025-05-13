import {BaseApiClient} from "../BaseApiClient";
import {Readable} from "node:stream";

export class FileHostClientV1 extends BaseApiClient {

    public async fetchFile(fileUrl: string) {
        return await this.request<Readable>({
            method: 'GET',
            url: fileUrl,
            responseType: 'stream'
        });
    }
}