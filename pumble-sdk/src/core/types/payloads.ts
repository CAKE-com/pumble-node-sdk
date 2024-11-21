import { PumbleEventNotificationPayload, PumbleEventType } from './pumble-events';
import { BlockInteractionSourceType, ShortcutType } from './types';
import {V1} from "../../api";
import OptionGroup = V1.OptionGroup;
import Option = V1.Option;

export enum MessageType {
    SLASH_COMMAND = 'SLASH_COMMAND',
    SHORTCUT = 'SHORTCUT',
    APP_EVENT = 'APP_EVENT',
    PUMBLE_EVENT = 'PUMBLE_EVENT',
    BLOCK_INTERACTION = 'BLOCK_INTERACTION',
    DYNAMIC_MENU = 'DYNAMIC_MENU'
}

export type AppMessage = {
    messageType: MessageType;
};

export type ShortcutPayload = AppMessage & {
    type: ShortcutType;
};

export type DynamicMenuPayload = AppMessage & {
    onAction: string;
    query?: string;
    workspaceId: string;
    userId: string;
    triggerId: string;
}

export type DynamicMenuOptionsResponse = {
    onAction: string;
    options: Option[] | OptionGroup[];
    triggerId: string
}

export type GlobalShortcutResponse = {
    key: string
}

export type PumbleEventPayload<T extends PumbleEventType = PumbleEventType> = AppMessage & {
    body: PumbleEventNotificationPayload<T>;
    eventType: T;
    workspaceId: string;
    /**
     * If more than one user that can receive this event have authorized the app they will be in this list
     * This avoids sending the event multiple times for each user.
     * You will receive only one copy of the event.
     */
    workspaceUserIds: Array<string>;
};

export type SlashCommandPayload = AppMessage & {
    slashCommand: string;
    text: string;
    blocks?: V1.BlockRichText[];
    userId: string;
    channelId: string;
    threadRootId?: string;
    workspaceId: string;
    triggerId: string
};

export type GlobalShortcutPayload = AppMessage & {
    shortcut: string;
    userId: string;
    channelId: string;
    workspaceId: string;
    triggerId: string;
};

export type MessageShortcutPayload = AppMessage & {
    shortcut: string;
    messageId: string;
    userId: string;
    channelId: string;
    workspaceId: string;
    triggerId: string;
};

export type BlockInteractionPayload<T extends BlockInteractionSourceType = BlockInteractionSourceType> = AppMessage & {
    workspaceId: string;
    userId: string;
    channelId?: string;
    sourceType: T;
    sourceId: string;
    actionType: string;
    onAction: string;
    payload: string;
    triggerId: string;
};

export function isPumbleEvent(message: AppMessage): message is Omit<PumbleEventPayload, 'body'> & { body: string } {
    return message.messageType === MessageType.PUMBLE_EVENT || message.messageType === MessageType.APP_EVENT;
}

export function isSlashCommand(message: AppMessage): message is SlashCommandPayload {
    return message.messageType === MessageType.SLASH_COMMAND;
}

export function isShortcut(message: AppMessage): message is ShortcutPayload {
    return message.messageType === MessageType.SHORTCUT;
}

export function isMessageShortcut(message: AppMessage): message is MessageShortcutPayload {
    return isShortcut(message) && message.type === 'ON_MESSAGE';
}

export function isGlobalShortcut(message: AppMessage): message is GlobalShortcutPayload {
    return isShortcut(message) && message.type === 'GLOBAL';
}

export function isBlockInteraction(message: AppMessage): message is BlockInteractionPayload {
    return message.messageType === 'BLOCK_INTERACTION';
}

export function isBlockInteractionView(message: AppMessage): message is BlockInteractionPayload {
    return isBlockInteraction(message) && message.sourceType === 'VIEW';
}

export function isBlockInteractionMessage(message: AppMessage): message is BlockInteractionPayload {
    return isBlockInteraction(message) && message.sourceType === 'MESSAGE';
}

export function isBlockInteractionEphemeralMessage(message: AppMessage): message is BlockInteractionPayload {
    return isBlockInteraction(message) && message.sourceType === 'EPHEMERAL_MESSAGE';
}

export function isDynamicMenuInteraction(message: AppMessage): message is DynamicMenuPayload {
    return message.messageType === 'DYNAMIC_MENU';
}