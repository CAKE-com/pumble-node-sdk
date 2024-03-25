import { PumbleEventNotificationPayload, PumbleEventType } from './pumble-events';
import { BlockInteractionSourceType, ShortcutType } from './types';

export enum MessageType {
    SLASH_COMMAND = 'SLASH_COMMAND',
    SHORTCUT = 'SHORTCUT',
    APP_EVENT = 'APP_EVENT',
    PUMBLE_EVENT = 'PUMBLE_EVENT',
    BLOCK_INTERACTION = 'BLOCK_INTERACTION',
}

export type AppMessage = {
    messageType: MessageType;
};

export type ShortcutPayload = AppMessage & {
    type: ShortcutType;
};

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
    userId: string;
    channelId: string;
    threadRootId?: string;
    workspaceId: string;
};

export type GlobalShortcutPayload = AppMessage & {
    shortcut: string;
    userId: string;
    channelId: string;
    workspaceId: string;
};

export type MessageShortcutPayload = AppMessage & {
    shortcut: string;
    messageId: string;
    userId: string;
    channelId: string;
    workspaceId: string;
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
