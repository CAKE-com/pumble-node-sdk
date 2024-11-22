import type { AvailableEvents } from '../services/AddonService';
import { PumbleEventType } from './pumble-events';
import { ApiClient } from '../../api';
import { V1 } from '../../api';
import {
    BlockInteractionPayload, DynamicMenuOptionsResponse, DynamicMenuPayload,
    GlobalShortcutPayload, MessageShortcutPayload,
    PumbleEventPayload,
    SlashCommandPayload,
} from './payloads';
import {AddonManifest, BlockInteractionSourceType, GoogleDriveModalCredentials} from './types';

export type AckCallback = (arg?: string) => Promise<void>;
export type NackCallback = (arg?: string, status?: number) => Promise<void>;
export type ResponseCallback<T> = (arg: T) => Promise<void>;
export type SpawnModalCallback<T> = (arg: T) => Promise<void>;

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
    SpawnModalContext;
export type GlobalShortcutContext = EventContext<GlobalShortcutPayload> & SayContext & AcknowledgeContext & SpawnModalContext;
export type MessageShortcutContext = EventContext<MessageShortcutPayload> &
    ReplyContext &
    AcknowledgeContext &
    FetchMessageContext &
    SpawnModalContext;
export type BlockInteractionContext<T extends BlockInteractionSourceType = BlockInteractionSourceType> =
    T extends 'VIEW'
        ? EventContext<BlockInteractionPayload<'VIEW'>> & AcknowledgeContext
        : T extends 'EPHEMERAL_MESSAGE'
        ? EventContext<BlockInteractionPayload<'EPHEMERAL_MESSAGE'>> & AcknowledgeContext & ChannelDetailsContext
        : EventContext<BlockInteractionPayload<'MESSAGE'>> &
              AcknowledgeContext &
              ReplyContext &
              FetchMessageContext &
              ChannelDetailsContext;
export type DynamicMenuContext = ResponseContext<DynamicMenuOptionsResponse> & EventContext<DynamicMenuPayload>;
export type SpawnModalContext = {
    spawnModal: SpawnModalCallback<GoogleDriveModalCredentials>
};
export type OnMessageContext = EventContext<PumbleEventPayload<'NEW_MESSAGE'>> & ReplyContext;
export type OnReactionContext = EventContext<PumbleEventPayload<'REACTION_ADDED'>> & ReplyContext & FetchMessageContext;
export type OnErrorCallback = (arg: EventHandlingException<any>) => void;
