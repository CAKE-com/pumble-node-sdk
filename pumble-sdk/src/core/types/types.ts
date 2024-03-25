import { ContextCallback } from '../services/Addon';
import {
    BlockInteractionContext,
    GlobalShortcutContext,
    MessageShortcutContext,
    OnMessageContext,
    OnReactionContext,
    PumbleEventContext,
    SlashCommandContext,
} from './contexts';
import { PumbleEventType } from './pumble-events';

export type ShortcutType = 'GLOBAL' | 'ON_MESSAGE';

export type Shortcut = {
    name: string;
    url: string;
    [key: string]: unknown;
} & (
    | {
          shortcutType: 'GLOBAL';
          handler?: (ctx: GlobalShortcutContext) => void | Promise<void>;
      }
    | {
          shortcutType: 'ON_MESSAGE';
          handler?: (ctx: MessageShortcutContext) => void | Promise<void>;
      }
);

type SlashCommand = {
    command: string;
    url: string;
    [key: string]: unknown;
    handler?: ContextCallback<SlashCommandContext>;
};

export type BlockInteractionSourceType = 'VIEW' | 'MESSAGE' | 'EPHEMERAL_MESSAGE';

type BlockInteraction = {
    url: string;
    handlerView: ContextCallback<BlockInteractionContext<'VIEW'>>;
    handlerMessage: ContextCallback<BlockInteractionContext<'MESSAGE'>>;
    handlerEphemeralMessage: ContextCallback<BlockInteractionContext<'EPHEMERAL_MESSAGE'>>;
};

type OptionsForEvent<T extends PumbleEventType> = T extends 'NEW_MESSAGE'
    ? { match: string | RegExp; includeBotMessages?: boolean }
    : T extends 'UPDATED_MESSAGE'
    ? { match: string | RegExp; includeBotMessages?: boolean }
    : T extends 'REACTION_ADDED'
    ? { match: string | RegExp }
    : never;

type EventContext<T extends PumbleEventType> = T extends 'NEW_MESSAGE'
    ? OnMessageContext
    : T extends 'UPDATED_MESSAGE'
    ? OnMessageContext
    : T extends 'REACTION_ADDED'
    ? OnReactionContext
    : PumbleEventContext<T>;

type EventDeclare<T extends PumbleEventType> =
    | T
    | {
          name: T;
          options?: OptionsForEvent<T>;
          handler: ContextCallback<EventContext<T>>;
      };

type Distribute<U> = U extends PumbleEventType ? EventDeclare<U> : never;
type PossibleEvents = Distribute<PumbleEventType>;

type ManifestEvents = {
    url: string;
    events?: readonly PossibleEvents[];
};

export type AddonManifest = {
    id: string;
    socketMode?: boolean;
    shortcuts: readonly Shortcut[];
    slashCommands: readonly SlashCommand[];
    blockInteraction?: BlockInteraction;
    redirectUrls: readonly string[];
    eventSubscriptions: ManifestEvents;
    clientSecret: string;
    appKey: string;
    signingSecret: string;
    scopes: {
        userScopes: string[];
        botScopes: string[];
    };
    [key: string]: unknown;
};

type GetShortcuts<T> = T extends { shortcuts: readonly Shortcut[] } ? T['shortcuts'] : never;
type GetSlashCommands<T> = T extends { slashCommands: readonly SlashCommand[] } ? T['slashCommands'] : never;
type MessageShortcutName<T extends Shortcut> = T['shortcutType'] extends 'ON_MESSAGE' ? T['name'] : never;
type GlobalShortcutName<T extends Shortcut> = T['shortcutType'] extends 'GLOBAL' ? T['name'] : never;
type SlashCommandCommand<T extends SlashCommand> = T['command'];
type I_MessageShortcuts<T extends readonly Shortcut[]> = T extends readonly [infer head, ...infer tail]
    ? head extends Shortcut
        ? tail extends readonly Shortcut[]
            ? MessageShortcutName<head> | I_MessageShortcuts<tail>
            : MessageShortcutName<head>
        : never
    : never;
type I_GlobalShortcuts<T extends readonly Shortcut[]> = T extends readonly [infer head, ...infer tail]
    ? head extends Shortcut
        ? tail extends readonly Shortcut[]
            ? GlobalShortcutName<head> | I_GlobalShortcuts<tail>
            : GlobalShortcutName<head>
        : never
    : never;
type I_SlashCommands<T extends readonly SlashCommand[]> = T extends readonly [infer head, ...infer tail]
    ? head extends SlashCommand
        ? tail extends readonly SlashCommand[]
            ? SlashCommandCommand<head> | I_SlashCommands<tail>
            : SlashCommandCommand<head>
        : never
    : never;

export type MessageShortcutsKeys<T extends { shortcuts: readonly Shortcut[] }> = I_MessageShortcuts<
    GetShortcuts<T>
> extends never
    ? string
    : I_MessageShortcuts<GetShortcuts<T>>;

export type EventKeys<T> = T extends {
    eventSubscriptions: { events: readonly EventDeclare<PumbleEventType>[] };
}
    ? T['eventSubscriptions']['events'][number] extends EventDeclare<infer E>
        ? E
        : PumbleEventType
    : PumbleEventType;

export type GlobalShortcutsKeys<T extends { shortcuts: readonly Shortcut[] }> = I_GlobalShortcuts<
    GetShortcuts<T>
> extends never
    ? string
    : I_GlobalShortcuts<GetShortcuts<T>>;

export type SlashCommandKeys<T extends { slashCommands: readonly SlashCommand[] }> = I_SlashCommands<
    GetSlashCommands<T>
> extends never
    ? string
    : I_SlashCommands<GetSlashCommands<T>>;
