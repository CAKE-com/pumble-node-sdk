import { ApiClient } from '../../api';
import { OAuth2AccessTokenResponse } from '../../auth';
import {
    BlockInteractionContext,
    GlobalShortcutContext,
    MessageShortcutContext,
    OnErrorCallback,
    OnMessageContext,
    OnReactionContext,
    PumbleEventContext,
    SlashCommandContext,
} from '../types/contexts';
import { AddonManifest, EventKeys, GlobalShortcutsKeys, MessageShortcutsKeys, SlashCommandKeys } from '../types/types';
import { Express } from 'express';

export type ContextCallback<TContext> = (ctx: TContext) => void | Promise<void>;

export interface Addon<T extends AddonManifest = AddonManifest> {
    event<E extends EventKeys<T>>(name: E, cb: ContextCallback<PumbleEventContext<E>>): this;

    slashCommand(command: SlashCommandKeys<T>, cb: ContextCallback<SlashCommandContext>): this;

    messageShortcut(shortcut: MessageShortcutsKeys<T>, cb: ContextCallback<MessageShortcutContext>): this;

    globalShortcut(shortcut: GlobalShortcutsKeys<T>, cb: ContextCallback<GlobalShortcutContext>): this;

    blockInteractionView(cb: ContextCallback<BlockInteractionContext<'VIEW'>>): this;

    blockInteractionMessage(cb: ContextCallback<BlockInteractionContext<'MESSAGE'>>): this;

    blockInteractionEphemeralMessage(cb: ContextCallback<BlockInteractionContext<'EPHEMERAL_MESSAGE'>>): this;

    message(message: string, cb: ContextCallback<OnMessageContext>): this;

    message(message: RegExp, cb: ContextCallback<OnMessageContext>): this;

    message(
        options: {
            match: string | RegExp;
            includeBotMessages?: boolean;
        },
        cb: ContextCallback<OnMessageContext>
    ): this;

    reaction(reaction: string | RegExp, cb: ContextCallback<OnReactionContext>): this;

    onError(cb: OnErrorCallback): this;

    getManifest(): T;

    start(): Promise<void>;

    onServerConfiguring(cb: (express: Express, addon: Addon<T>) => void | Promise<void>): void;

    getBotClient(workspaceId: string): Promise<ApiClient | undefined>;
    getUserClient(workspaceId: string, workspaceUserId: string): Promise<ApiClient | undefined>;
    generateAccessToken(code: string, save?: boolean): Promise<OAuth2AccessTokenResponse>;
}
