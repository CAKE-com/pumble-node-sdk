import type { AvailableEvents } from '../services/AddonService';
import { PumbleEventType } from './pumble-events';
import {ApiClient, V1} from '../../api';
import {
    BlockInteractionPayload, DynamicMenuOptionsResponse, DynamicMenuPayload,
    GlobalShortcutPayload, MessageShortcutPayload,
    PumbleEventPayload,
    SlashCommandPayload, ViewActionPayload,
} from './payloads';
import {
    AddonManifest,
    BlockInteractionSourceType
} from './types';
import { ViewBuilder } from "../util/ViewUtils";

export type AckCallback = (arg?: string) => Promise<void>;
export type NackCallback = (arg?: string, status?: number) => Promise<void>;
export type ResponseCallback<T> = (arg: T) => Promise<void>;

export type SayFunction = (message: V1.SendMessagePayload, type?: 'in_channel' | 'ephemeral') => Promise<void>;

export type ReplyFunction = (
    message: V1.SendMessagePayload,
    type?: 'in_channel' | 'ephemeral',
    reply?: boolean
) => Promise<void>;

/**
 * Every event from the event emitter will have this body
 */
export type EventContext<T> = {
    payload: T;
    getBotClient: () => Promise<ApiClient | undefined>;
    getUserClient: (userId?: string) => Promise<ApiClient | undefined>;
    getBotUserId: () => Promise<string | undefined>;
    getAuthUrl: (options?: {
        defaultWorkspaceId?: string;
        redirectUrl?: string;
        state?: string;
        isReinstall?: boolean;
    }) => string;
    getManifest: () => AddonManifest;
};

/**
 * Triggers need to acknowledge therefore for triggers (slash commands + shortcuts) these function will exist in the body
 */
export type AcknowledgeContext = {
    ack: AckCallback;
    nack: NackCallback;
};

export type ResponseContext<T> = {
    response: ResponseCallback<T>;
    nack: NackCallback;
};

/**
 * Only events where you have enough information to respond will have this "say" function
 * Slash commands
 * Shortcuts
 * NEW_MESSAGE, REACTION_ADDED etc.
 * All of these events have channel information
 */
export type SayContext = {
    say: SayFunction;
};

export type ReplyContext = {
    say: ReplyFunction;
};

export type FetchMessageContext = {
    fetchMessage(): Promise<V1.Message | undefined>;
};

export type ChannelDetailsContext = {
    getChannelDetails(channelId?: string): Promise<V1.ChannelInfo | undefined>;
};

export type EventHandlingException<T> = {
    eventData: EventContext<T>;
    error: any;
    event: AvailableEvents;
};

export type PumbleEventContext<T extends PumbleEventType> = EventContext<PumbleEventPayload<T>>;
export type SlashCommandContext = EventContext<SlashCommandPayload> &
    SayContext &
    AcknowledgeContext &
    ChannelDetailsContext &
    ViewContext;
export type GlobalShortcutContext = EventContext<GlobalShortcutPayload> & SayContext & AcknowledgeContext & ViewContext;
export type MessageShortcutContext = EventContext<MessageShortcutPayload> &
    ReplyContext &
    AcknowledgeContext &
    FetchMessageContext &
    ViewContext;
export type BlockInteractionContext<T extends BlockInteractionSourceType = BlockInteractionSourceType> =
    T extends 'VIEW'
        ? EventContext<BlockInteractionPayload<'VIEW'>> & AcknowledgeContext & ViewActionFunctionContext & ViewPayloadContext
        : T extends 'EPHEMERAL_MESSAGE'
        ? EventContext<BlockInteractionPayload<'EPHEMERAL_MESSAGE'>> & AcknowledgeContext & ChannelDetailsContext & ViewContext & ViewActionFunctionContext
        : EventContext<BlockInteractionPayload<'MESSAGE'>> &
              AcknowledgeContext &
              ReplyContext &
              FetchMessageContext &
              ChannelDetailsContext &
              ViewContext &
              ViewActionFunctionContext;
export type DynamicMenuContext = ResponseContext<DynamicMenuOptionsResponse> & EventContext<DynamicMenuPayload>;

export type ViewContext = {
    spawnModalView: ResponseCallback<V1.StorageIntegrationModalCredentials | V1.View<"MODAL">>
};

export type ViewActionFunctionContext = {
    updateView: ResponseCallback<V1.View<"MODAL" | "HOME">>
    pushModalView: ResponseCallback<V1.View<"MODAL">>
};

export type ViewActionContext = EventContext<ViewActionPayload> & AcknowledgeContext & ViewContext;

export type ViewPayloadContext = {
    viewId: () => string | undefined;
    viewType: () => V1.ViewType | undefined;
    viewTitle: () => V1.BlockTextElement | undefined;
    viewBlocks: () => V1.MainBlock[] | undefined;
    viewState: () => V1.State | undefined;
    viewCallbackId: () => string | undefined;
    viewNotifyOnClose: () => boolean | undefined;
    viewSubmit: () => V1.BlockTextElement | undefined;
    viewClose: () => V1.BlockTextElement | undefined;
    parentViewId: () => string | undefined;
    viewBuilder: <T extends V1.ViewType>(view: V1.View<T>) => ViewBuilder<T>;
}

export type OnMessageContext = EventContext<PumbleEventPayload<'NEW_MESSAGE' | 'UPDATED_MESSAGE'>> & ReplyContext;
export type OnReactionContext = EventContext<PumbleEventPayload<'REACTION_ADDED'>> & ReplyContext & FetchMessageContext;
export type OnErrorCallback = (arg: EventHandlingException<any>) => void;
