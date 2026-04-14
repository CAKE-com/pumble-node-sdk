import {GlobalShortcutContext, MessageShortcutContext, SlashCommandContext} from "pumble-sdk/lib/core/types/contexts";
import {authService} from "../service/AuthService";
import {ticketService} from "../service/TicketService";
import {IntegrationError, ZendeskAuth} from "../types";
import {
    ACCOUNT_NOT_CONNECTED_MESSAGE,
    AUTHORIZATION_MESSAGE,
    HELP_MESSAGE,
    ONLY_PUBLIC_AND_PRIVATE_CHANNELS_ALLOWED
} from "../utils/constants";
import {logger} from "../utils/Logger";
import { validateSubdomain } from '../utils/utils';

class CommandsAdapter {
    public async handle(ctx: SlashCommandContext) {
        const command = ctx.payload.text
            .split(' ')
            .map((x) => x.trim())[0];
        if (command && command in this.handlers) {
            const client = await ctx.getUserClient();
            if (!client) {
                throw new IntegrationError(AUTHORIZATION_MESSAGE, 'Not authorized');
            }

            await this.handlers[command](ctx);
        } else {
            await this.handlers['help'](ctx);
        }
    }

    private handlers: Record<
        string,
        (ctx: SlashCommandContext) => Promise<void>
    > = {
        connect: (ctx) => this.connect(ctx),
        disconnect: (ctx) => this.disconnect(ctx),
        subscribe: (ctx) => this.subscribe(ctx),
        unsubscribe: (ctx) => this.unsubscribe(ctx),
        help: (ctx) => this.help(ctx),
    };

    private async connect(ctx: SlashCommandContext) {
        const subdomain = ctx.payload.text.replace("connect", "").trim();
        validateSubdomain(subdomain);
        await ctx.say(authService.createAuthorizationUrlMessage("Connect Zendesk account", "Connect", ctx.payload.workspaceId, ctx.payload.userId, subdomain), "in_channel");
    }

    private async disconnect(ctx: SlashCommandContext) {
        await authService.deleteAuth(ctx.payload.workspaceId, ctx.payload.userId, await ctx.getBotClient());
    }

    private async subscribe(ctx: SlashCommandContext) {
        const auth = await authService.getAuth(ctx.payload.workspaceId, ctx.payload.userId);
        if (!auth) {
            return await ctx.say(ACCOUNT_NOT_CONNECTED_MESSAGE, "ephemeral");
        }
        const channel = await ctx.getChannelDetails(ctx.payload.channelId);
        if (!channel || !["PUBLIC", "PRIVATE"].includes(channel.channel.channelType)) {
            return await ctx.say(ONLY_PUBLIC_AND_PRIVATE_CHANNELS_ALLOWED, "ephemeral");
        }
        await ticketService.subscribeChannelToTickets(auth.subdomain, ctx.payload.workspaceId, ctx.payload.userId, channel, await ctx.getBotClient(),undefined);
    }

    private async unsubscribe(ctx: SlashCommandContext) {
        const auth = await authService.getAuth(ctx.payload.workspaceId, ctx.payload.userId);
        if (!auth) {
            return await ctx.say(ACCOUNT_NOT_CONNECTED_MESSAGE, "ephemeral");
        }
        const channel = await ctx.getChannelDetails(ctx.payload.channelId);
        if (!channel || !["PUBLIC", "PRIVATE"].includes(channel.channel.channelType)) {
            return await ctx.say(ONLY_PUBLIC_AND_PRIVATE_CHANNELS_ALLOWED, "ephemeral");
        }
        await ticketService.unsubscribeChannelFromTickets(auth.subdomain, ctx.payload.workspaceId, ctx.payload.userId, channel, await ctx.getBotClient());
    }

    private async help(ctx: SlashCommandContext) {
        await ctx.say(HELP_MESSAGE, 'ephemeral');
    }

    public async handleAuthorizationAndErrors(func: (ctx: MessageShortcutContext | GlobalShortcutContext, auth: ZendeskAuth) => Promise<void>, ctx: MessageShortcutContext | GlobalShortcutContext): Promise<boolean> {
        try {
            const client = await ctx.getUserClient();
            if (!client) {
                throw new IntegrationError(AUTHORIZATION_MESSAGE, "Not authorized");
            }
            const auth = await authService.getAuth(ctx.payload.workspaceId, ctx.payload.userId);
            if (!auth) {
                throw new IntegrationError(ACCOUNT_NOT_CONNECTED_MESSAGE, "Not connected");
            }
            await func.call(this, ctx, auth);
            return true;
        } catch (e) {
            if (e instanceof IntegrationError) {
                await ctx.say(e.errorMessage, "ephemeral");
            } else {
                logger.error(`Unexpected error on command ${e}`, e);
                await ctx.say("Operation failed due to error", "ephemeral");
            }
        }
        return false;
    }
}

export const commandsAdapter = new CommandsAdapter();
