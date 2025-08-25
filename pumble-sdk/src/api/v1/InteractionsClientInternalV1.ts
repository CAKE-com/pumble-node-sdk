import { BaseApiClient } from "../BaseApiClient";
import { BlockInteractionPayload } from "../../core/types/payloads";
import { V1 } from "./types";

export class InteractionsClientInternalV1 extends BaseApiClient {
    private urls = {
        completeProcessing: () => `/v1/interactions/complete`,
    };

    public async completeProcessing(payload: BlockInteractionPayload) {
        const requestBody: V1.CompleteInteractionProcessingRequest = {
            channelId: payload.channelId,
            sourceId: payload.sourceId,
            sourceType: payload.sourceType,
            triggerId: payload.triggerId
        };
        await this.request({
            url: this.urls.completeProcessing(),
            method: 'POST',
            data: requestBody
        });
    }
}