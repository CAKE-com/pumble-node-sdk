import { AddonManifest, Shortcut } from '../types/types';
import { CredentialsStore, OAuth2AccessTokenResponse } from '../../auth';
import {
    AckCallback,
    EventContext,
    NackCallback,
    OnErrorCallback,
    SayFunction,
    GlobalShortcutContext,
    MessageShortcutContext,
    SlashCommandContext,
    OnMessageContext,
    OnReactionContext,
    PumbleEventContext,
    SayContext,
    FetchMessageContext,
    ReplyContext,
    ReplyFunction,
    ChannelDetailsContext,
    BlockInteractionContext,
} from '../types/contexts';
import { Addon, ContextCallback } from './Addon';
import { PumbleEventType } from '../types/pumble-events';
import { EventEmitter } from 'events';
import { ApiClient } from '../../api';
import { OAuth2Client, OAuth2Config } from '../../auth';
import { AddonHttpListener, AddonHttpServerOptions } from '../adapters/http/AddonHttpListener';
import { AddonWebsocketListener } from '../adapters/socket/AddonWebsocketListener';
import { Express } from 'express';
import {
    BlockInteractionPayload,
    GlobalShortcutPayload,
    MessageShortcutPayload,
    PumbleEventPayload,
    SlashCommandPayload,
} from '../types/payloads';
import path from 'path';
import { ClientUtils } from './ClientUtils';
import { V1 } from '../../api/v1/types';

type ContextCache = {
    botUserId?: string | null;
    botClient?: ApiClient | null;
    userClients?: Record<string, ApiClient | null>;
    message?: V1.Message | null;
};

const EVENT = 'event';
const SLASH = 'slash';
const GLOBAL_SHORTCUT = 'global_shortcut';
const MESSAGE_SHORTCUT = 'message_shortcut';
const BLOCK_INTERACTION_VIEW = 'block_interaction_view';
const BLOCK_INTERACTION_MESSAGE = 'block_interaction_message';
const BLOCK_INTERACTION_EPHEMERAL_MESSAGE = 'block_interaction_ephemeral_message';
const ERROR = 'error';

const availableEvents = [
    EVENT,
    SLASH,
    GLOBAL_SHORTCUT,
    MESSAGE_SHORTCUT,
    BLOCK_INTERACTION_VIEW,
    BLOCK_INTERACTION_MESSAGE,
    BLOCK_INTERACTION_EPHEMERAL_MESSAGE,
] as const;

export type AvailableEvents = (typeof availableEvents)[number];

export class AddonService<T extends AddonManifest = AddonManifest> extends EventEmitter implements Addon<T> {
    private httpListener?: AddonHttpListener<T>;
    private socketListener?: AddonWebsocketListener<T>;
    private serverConfigurationCallbacks: Array<(server: Express, addon: Addon<T>) => void> = [];
    private clientUtils: ClientUtils;

    public constructor(
        private readonly manifest: T,
        private readonly options: AddonHttpServerOptions & {
            oauth2Config?: OAuth2Config;
        }
    ) {
        super();
        this.clientUtils = new ClientUtils(this.manifest, this.options.oauth2Config?.tokenStore);
        Object.seal(this.manifest);
        this.manifest.shortcuts.forEach((shortcut) => {
            if (shortcut.shortcutType === 'GLOBAL') {
                const handler = (shortcut as Shortcut).handler as ContextCallback<GlobalShortcutContext>;
                if (handler) {
                    this.globalShortcut(shortcut.name, handler);
                }
            } else {
                const handler = (shortcut as Shortcut).handler as ContextCallback<MessageShortcutContext>;
                if (handler) {
                    this.messageShortcut(shortcut.name, handler);
                }
            }
        });
        this.manifest.slashCommands.forEach((slashCommand) => {
            if (slashCommand.handler) {
                this.slashCommand(slashCommand.command, slashCommand.handler);
            }
        });
        if (this.manifest.blockInteraction) {
            this.blockInteractionView(this.manifest.blockInteraction.handlerView);
            this.blockInteractionMessage(this.manifest.blockInteraction.handlerMessage);
            this.blockInteractionEphemeralMessage(this.manifest.blockInteraction.handlerEphemeralMessage);
        }
        this.manifest.eventSubscriptions.events?.forEach((event) => {
            if (typeof event === 'object') {
                if (event.name === 'REACTION_ADDED') {
                    const options = event.options || { match: /.*/ };
                    this.reaction(options.match, event.handler);
                } else if (event.name === 'NEW_MESSAGE') {
                    const options = event.options || { match: /.*/, includeBotMessages: false };
                    this.message(options, event.handler);
                } else {
                    this.event(event.name, event.handler as ContextCallback<PumbleEventContext<typeof event.name>>);
                }
            }
        });
    }

    public getBotClient(workspaceId: string): Promise<ApiClient | undefined> {
        return this.clientUtils.getBotClient(workspaceId);
    }

    public getUserClient(workspaceId: string, workspaceUserId: string): Promise<ApiClient | undefined> {
        return this.clientUtils.getUserClient(workspaceId, workspaceUserId);
    }

    public getAuthUrl(options: { defaultWorkspaceId?: string; state?: string; redirectUrl?: string }): string {
        return this.clientUtils.generateAuthUrl(options);
    }

    public generateAccessToken(code: string, save: boolean = true): Promise<OAuth2AccessTokenResponse> {
        return this.clientUtils.generateAccessToken(code, save);
    }

    private get credentialsStore(): CredentialsStore | undefined {
        return this.options.oauth2Config?.tokenStore;
    }

    public onServerConfiguring(cb: (express: Express, addon: Addon<T>) => void | Promise<void>): void {
        this.serverConfigurationCallbacks.push(cb);
    }

    public on(
        name: AvailableEvents | typeof ERROR | PumbleEventType,
        cb: (...args: any[]) => void | Promise<void>
    ): this {
        const wrappedCallback = async (...args: any[]) => {
            try {
                await cb(...args);
            } catch (err) {
                if (this.listeners(ERROR) && this.listeners(ERROR).length) {
                    if (name !== ERROR) {
                        this.emit(ERROR, {
                            eventData: args[0],
                            event: name,
                            error: err,
                        });
                    }
                } else {
                    console.error('Unhandled error occurred', { eventData: args[0], event: name, error: err });
                }
            }
        };
        return super.on(name as string, wrappedCallback);
    }

    public getManifest(): T {
        return this.manifest;
    }

    public postEvent(evt: PumbleEventPayload): void {
        const cache: ContextCache = {};
        const ctx = this.createEventContext(evt, evt.workspaceId, undefined, cache);
        this.emit(EVENT, ctx);
        this.emit(evt.eventType, ctx);
    }

    public postGlobalShortcut(payload: GlobalShortcutPayload, ack: AckCallback, nack: NackCallback): void {
        const cache: ContextCache = {};
        const eventContext = this.createEventContext(payload, payload.workspaceId, payload.userId, cache);
        const sayContext = this.createSayContext(eventContext, payload.userId, payload.channelId);
        const ctx: GlobalShortcutContext = {
            ack,
            nack,
            ...eventContext,
            ...sayContext,
        };
        this.emit(GLOBAL_SHORTCUT, ctx);
    }

    public postMessageShortcut(payload: MessageShortcutPayload, ack: AckCallback, nack: NackCallback): void {
        const cache: ContextCache = {};
        const eventContext = this.createEventContext(payload, payload.workspaceId, payload.userId, cache);
        const fetchMessageContext = this.createFetchMessageContext(
            eventContext,
            payload.channelId,
            payload.messageId,
            cache
        );
        const replyContext = this.createReplyContext(
            eventContext,
            fetchMessageContext,
            payload.userId,
            payload.channelId
        );
        const ctx: MessageShortcutContext = {
            ack,
            nack,
            ...eventContext,
            ...fetchMessageContext,
            ...replyContext,
        };
        this.emit(MESSAGE_SHORTCUT, ctx);
    }

    public postSlashCommand(payload: SlashCommandPayload, ack: AckCallback, nack: NackCallback): void {
        const cache: ContextCache = {};
        const eventContext = this.createEventContext(payload, payload.workspaceId, payload.userId, cache);
        const sayContext = this.createSayContext(eventContext, payload.userId, payload.channelId, payload.threadRootId);
        const channelDetailsContext = this.createChannelDetailsContext(eventContext, payload.channelId);
        const appEventArg: SlashCommandContext = {
            ack,
            nack,
            ...eventContext,
            ...sayContext,
            ...channelDetailsContext,
        };
        this.emit(SLASH, appEventArg);
    }

    public postBlockInteractionMessage(payload: BlockInteractionPayload, ack: AckCallback, nack: NackCallback): void {
        const cache: ContextCache = {};
        const eventContext = this.createEventContext(
            payload,
            payload.workspaceId,
            payload.userId,
            cache
        ) as EventContext<BlockInteractionPayload<'MESSAGE'>>;
        const channelDetailsContext = this.createChannelDetailsContext(eventContext, payload.channelId!);
        const fetchMessageContext = this.createFetchMessageContext(
            eventContext,
            payload.channelId!,
            payload.sourceId,
            cache
        );
        const replyContext = this.createReplyContext(
            eventContext,
            fetchMessageContext,
            payload.userId,
            payload.channelId!
        );

        const appEventArg: BlockInteractionContext<'MESSAGE'> = {
            ack,
            nack,
            ...eventContext,
            ...replyContext,
            ...channelDetailsContext,
            ...fetchMessageContext,
        };
        this.emit(BLOCK_INTERACTION_MESSAGE, appEventArg);
    }

    public postBlockInteractionEphemeralMessage(
        payload: BlockInteractionPayload,
        ack: AckCallback,
        nack: NackCallback
    ): void {
        const cache: ContextCache = {};
        const eventContext = this.createEventContext(
            payload,
            payload.workspaceId,
            payload.userId,
            cache
        ) as EventContext<BlockInteractionPayload<'EPHEMERAL_MESSAGE'>>;
        const channelDetailsContext = this.createChannelDetailsContext(eventContext, payload.channelId!);

        const appEventArg: BlockInteractionContext<'EPHEMERAL_MESSAGE'> = {
            ack,
            nack,
            ...eventContext,
            ...channelDetailsContext,
        };
        this.emit(BLOCK_INTERACTION_EPHEMERAL_MESSAGE, appEventArg);
    }

    public postBlockInteractionView(payload: BlockInteractionPayload, ack: AckCallback, nack: NackCallback): void {
        const cache: ContextCache = {};
        const eventContext = this.createEventContext(
            payload,
            payload.workspaceId,
            payload.userId,
            cache
        ) as EventContext<BlockInteractionPayload<'VIEW'>>;

        const appEventArg: BlockInteractionContext<'VIEW'> = {
            ack,
            nack,
            ...eventContext,
        };
        this.emit(BLOCK_INTERACTION_VIEW, appEventArg);
    }

    public event<E extends PumbleEventType>(name: E, cb: ContextCallback<PumbleEventContext<E>>): this {
        return this.on(EVENT, (evt: EventContext<PumbleEventPayload<E>>) => {
            if (evt.payload.eventType === name) {
                return cb(evt);
            }
        });
    }

    public globalShortcut(shortcut: string, cb: ContextCallback<GlobalShortcutContext>): this {
        const wrapperCallback: ContextCallback<GlobalShortcutContext> = (evt) => {
            if (evt.payload.shortcut === shortcut) {
                return cb(evt);
            }
        };
        return this.on(GLOBAL_SHORTCUT, wrapperCallback);
    }

    public messageShortcut(shortcut: string, cb: ContextCallback<MessageShortcutContext>): this {
        const wrapperCallback: ContextCallback<MessageShortcutContext> = (evt) => {
            if (evt.payload.shortcut === shortcut) {
                return cb(evt);
            }
        };
        return this.on(MESSAGE_SHORTCUT, wrapperCallback);
    }

    public slashCommand(command: string, cb: ContextCallback<SlashCommandContext>): this {
        const wrapperCallback: ContextCallback<SlashCommandContext> = (evt) => {
            if (evt.payload.slashCommand === command) {
                return cb(evt);
            }
        };
        return this.on(SLASH, wrapperCallback);
    }

    public blockInteractionView(cb: ContextCallback<BlockInteractionContext<'VIEW'>>): this {
        const wrapperCallback: ContextCallback<BlockInteractionContext<'VIEW'>> = (ctx) => {
            return cb(ctx);
        };
        return this.on(BLOCK_INTERACTION_VIEW, wrapperCallback);
    }

    public blockInteractionMessage(cb: ContextCallback<BlockInteractionContext<'MESSAGE'>>): this {
        const wrapperCallback: ContextCallback<BlockInteractionContext<'MESSAGE'>> = (ctx) => {
            return cb(ctx);
        };
        return this.on(BLOCK_INTERACTION_MESSAGE, wrapperCallback);
    }

    public blockInteractionEphemeralMessage(cb: ContextCallback<BlockInteractionContext<'EPHEMERAL_MESSAGE'>>): this {
        const wrapperCallback: ContextCallback<BlockInteractionContext<'EPHEMERAL_MESSAGE'>> = (ctx) => {
            return cb(ctx);
        };
        return this.on(BLOCK_INTERACTION_EPHEMERAL_MESSAGE, wrapperCallback);
    }

    public message(
        opt: string | RegExp | { match: string | RegExp; includeBotMessages?: boolean },
        cb: ContextCallback<OnMessageContext>
    ): this {
        return this.event('NEW_MESSAGE', async (evt) => {
            const matcher: {
                match: string | RegExp;
                includeBotMessages?: boolean;
            } = typeof opt === 'string' || opt instanceof RegExp ? { match: opt, includeBotMessages: false } : opt;
            if (typeof matcher.match === 'string' && !evt.payload.body.tx.includes(matcher.match)) {
                return;
            }
            if (!evt.payload.body.tx.match(matcher.match)) {
                return;
            }
            if (!matcher.includeBotMessages) {
                const botUserId = await evt.getBotUserId();
                if (evt.payload.body.aId === botUserId) {
                    return;
                }
            }
            const cache: ContextCache = {};
            const eventContext = this.createEventContext(
                evt.payload,
                evt.payload.workspaceId,
                evt.payload.body.aId,
                cache
            );
            const replyContext: ReplyContext = {
                say: async (message, type, reply) => {
                    let messageThreadRootId =
                        evt.payload.body.trId && evt.payload.body.trId !== '' ? evt.payload.body.trId : undefined;
                    const threadId = reply ? messageThreadRootId || evt.payload.body.mId : messageThreadRootId;
                    const sayContext = this.createSayContext(
                        eventContext,
                        evt.payload.body.aId,
                        evt.payload.body.cId,
                        threadId
                    );
                    await sayContext.say(message, type);
                },
            };
            const ctx: OnMessageContext = {
                ...eventContext,
                ...replyContext,
            };
            return cb(ctx);
        });
    }

    public reaction(reaction: string | RegExp, cb: ContextCallback<OnReactionContext>): this {
        return this.event('REACTION_ADDED', (evt) => {
            if (
                (typeof reaction === 'string' && evt.payload.body.rc === reaction) ||
                (typeof reaction === 'object' && evt.payload.body.rc.match(reaction))
            ) {
                const cache: ContextCache = {};
                const eventContext = this.createEventContext(
                    evt.payload,
                    evt.payload.workspaceId,
                    evt.payload.body.uId,
                    cache
                );
                const fetchMessageContext = this.createFetchMessageContext(
                    eventContext,
                    evt.payload.body.cId,
                    evt.payload.body.mId,
                    cache
                );
                const replyContext = this.createReplyContext(
                    eventContext,
                    fetchMessageContext,
                    evt.payload.body.uId,
                    evt.payload.body.cId
                );
                const ctx: OnReactionContext = {
                    ...eventContext,
                    ...fetchMessageContext,
                    ...replyContext,
                };
                return cb(ctx);
            }
        });
    }

    public onError(cb: OnErrorCallback): this {
        return this.on(ERROR, cb);
    }

    public async start() {
        if (this.manifest.socketMode) {
            this.socketListener = new AddonWebsocketListener(this);
        } else {
            this.httpListener = new AddonHttpListener(this, this.options);
        }
        if (this.options.oauth2Config) {
            this.setupOAuth(this.options.oauth2Config);
        }
        await this.credentialsStore?.initialize();
        await this.socketListener?.start();
        await this.httpListener?.start(...this.serverConfigurationCallbacks);
    }

    private createEventContext<T>(
        payload: T,
        workspaceId: string,
        userId: string | undefined,
        cache: ContextCache
    ): EventContext<T> {
        const getBotClient = async () => {
            if (!cache.botClient && cache.botClient !== null) {
                const result = await this.getBotClient(workspaceId);
                cache.botClient = result || null;
                return result;
            }
            return cache.botClient || undefined;
        };
        const getUserClient = async (id?: string) => {
            id = id || userId;
            if (!id) {
                throw new Error('Cannot get userClient. Unspecified userId');
            }
            const userClients = cache.userClients || {};
            if (!userClients[id] && userClients[id] !== null) {
                const result = await this.getUserClient(workspaceId, id);
                userClients[id] = result || null;
                cache.userClients = userClients;
                return result;
            }
            return userClients[id] || undefined;
        };
        const getBotUserId = async () => {
            const client = await getBotClient();
            return client?.workspaceUserId;
        };
        const getAuthUrl = (options?: {
            defaultWorkspaceId?: string;
            state?: string;
            redirectUrl?: string;
            isReinstall?: boolean;
        }) => {
            return this.clientUtils.generateAuthUrl(options);
        };
        const getManifest = () => this.getManifest();
        return { payload, getBotClient, getUserClient, getBotUserId, getAuthUrl, getManifest };
    }

    private createChannelDetailsContext<T>(
        evtContext: EventContext<T>,
        channelFromContext: string
    ): ChannelDetailsContext {
        const getChannelDetails = async (channel?: string): Promise<V1.ChannelInfo | undefined> => {
            {
                const channelId = channel ? channel : channelFromContext;
                let client = await evtContext.getUserClient();
                if (!client) {
                    client = await evtContext.getBotClient();
                }
                let result: V1.ChannelInfo | undefined = undefined;
                if (client) {
                    try {
                        result = await client.v1.channels.getChannelDetails(channelId);
                    } catch (err) {
                        //Ignore
                    }
                }
                return result;
            }
        };

        return { getChannelDetails };
    }

    private createReplyContext<T>(
        evtContext: EventContext<T>,
        fetchMessageContext: FetchMessageContext,
        userId: string,
        channelId: string
    ): ReplyContext {
        const say: ReplyFunction = async (message, type = 'ephemeral', reply): Promise<void> => {
            if (reply) {
                const apiMessage = await fetchMessageContext.fetchMessage();
                if (apiMessage) {
                    if (apiMessage.threadReplyInfo?.rootId) {
                        const sayContext = this.createSayContext(
                            evtContext,
                            userId,
                            apiMessage.channelId,
                            apiMessage.threadReplyInfo.rootId
                        );
                        await sayContext.say(message, type);
                    } else {
                        let sayContext: SayContext;
                        if (reply) {
                            sayContext = this.createSayContext(evtContext, userId, apiMessage.channelId, apiMessage.id);
                        } else {
                            sayContext = this.createSayContext(evtContext, userId, apiMessage.channelId);
                        }
                        await sayContext.say(message, type);
                    }
                }
            } else {
                const sayContext = this.createSayContext(evtContext, userId, channelId);
                await sayContext.say(message, type);
            }
        };
        return { say };
    }

    private createSayContext<T>(
        evtContext: EventContext<T>,
        userId: string,
        channelId: string,
        threadId?: string
    ): SayContext {
        const say: SayFunction = async (message: V1.SendMessagePayload, type = 'ephemeral') => {
            const bot = await evtContext.getBotClient();
            if (bot) {
                if (type == 'in_channel') {
                    if (threadId) {
                        await bot.v1.messages.reply(threadId, channelId, message);
                    } else {
                        await bot.v1.messages.postMessageToChannel(channelId, message);
                    }
                } else {
                    if (threadId) {
                        await bot.v1.messages.replyEphemeral(threadId, channelId, message, userId);
                    } else {
                        await bot.v1.messages.postEphemeral(channelId, message, userId);
                    }
                }
            }
        };
        return { say };
    }

    private createFetchMessageContext<T>(
        evtContext: EventContext<T>,
        channelId: string,
        messageId: string,
        cache: ContextCache
    ): FetchMessageContext {
        const fetchMessage = async (): Promise<V1.Message | undefined> => {
            if (!cache.message && cache.message !== null) {
                let client = await evtContext.getUserClient();
                if (!client) {
                    client = await evtContext.getBotClient();
                }
                let result: V1.Message | undefined = undefined;
                if (client) {
                    try {
                        result = await client.v1.messages.fetchMessage(messageId, channelId);
                    } catch (err) {
                        //Ignore
                    }
                }
                cache.message = result || null;
                return result;
            }
            return cache.message || undefined;
        };
        return { fetchMessage };
    }

    private setupOAuth(config: OAuth2Config) {
        if (config.redirect && config.redirect.enable) {
            const paths = config.redirect.path
                ? [config.redirect.path]
                : this.manifest.redirectUrls.map((url) => {
                      if (!url.match(/^https?:\/\//)) {
                          url = path.join(`http://yourhost.com`, url);
                      }
                      return new URL(url).pathname;
                  });
            this.onServerConfiguring((e) => {
                const onSuccess = config.redirect?.onSuccess;
                const onError = config.redirect?.onError;

                e.get(paths, async (req, res) => {
                    const code = req.query['code'] as string | undefined;
                    if (!code) {
                        if (onError) {
                            onError(new Error('Authorization code not found'), req, res);
                        } else {
                            res.send('Could not authorize! Authorization code not found');
                        }
                        return;
                    } else {
                        try {
                            const client = new OAuth2Client(
                                this.manifest.id,
                                this.manifest.clientSecret,
                                this.manifest.appKey
                            );
                            const result = await client.generateAccessToken(code);
                            await config.tokenStore?.saveTokens(result);
                            if (onSuccess) {
                                onSuccess(result, req, res);
                            } else {
                                res.send('Successfully connected!');
                            }
                        } catch (err) {
                            if (onError) {
                                onError(err, req, res);
                            } else {
                                res.send('Something went wrong! Could not authorize');
                            }
                        }
                    }
                });
            });
        }
    }
}

export const setup = <T extends AddonManifest>(
    manifest: T,
    options: AddonHttpServerOptions & { oauth2Config: OAuth2Config }
): Addon<T> => {
    return new AddonService(manifest, options);
};
