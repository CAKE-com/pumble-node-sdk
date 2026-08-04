import Parser from "rss-parser";
import { credentialsStore } from "../addon";
import { ADDON_APP_KEY, ADDON_CLIENT_ID, ADDON_CLIENT_SECRET, BATCH_SIZE, CONCURRENCY_LIMIT, MAX_ITEMS_NUMBER_PER_CYCLE, MAX_RESPONSE_SIZE_MB, TIMEOUT_BETWEEN_BATCHES_MS } from "../config/config";
import { subscribedFeedRepository } from "../repository/SubscribedFeedRepositoryMongo";
import { RemoveFeedResult, SubscribedFeed } from "../types";
import { Logger } from "../utils/Logger";
import { contentFormatService } from "./ContentFormatService";
import { SlashCommandContext } from "pumble-sdk/lib/core/types/contexts";
import {ApiClient, OAuth2Client, V1} from "pumble-sdk";
import pLimit from 'p-limit';
import axios from "axios";
import { homeViewService } from "./HomeViewService";
import WorkspaceUser = V1.WorkspaceUser;
import ChannelInfo = V1.ChannelInfo;

const limit = pLimit(CONCURRENCY_LIMIT);

class SubscribedFeedService {
    private logger = Logger.getInstance(SubscribedFeedService);
    private parser = new Parser();

    public async subscribeToFeed(workspaceId: any, userId: any, channelId: any, client: ApiClient, feedLink: string | undefined): Promise<string> {
        const botId = await credentialsStore.getBotUserId(workspaceId);
        if (!botId) {
            return "Something went wrong. Try again.";
        }

        let channelInfo = undefined;
        try {
            channelInfo = await client.v1.channels.getChannelDetails(channelId);
        } catch(e) {
            this.logger.error(`Cannot access channel ${channelId}, error ${e}`);
        }

        if (!channelInfo) {
            return "Something went wrong. Try again!";
        }

        if (!channelInfo.users || !channelInfo.users.includes(userId)) {
            this.logger.error(`User ${userId} cannot subscribe to feed because is not channel member ${channelId}.`);
            return "You cannot subscribe to feed because you are not a channel member.";
        }

        if (!["PUBLIC", "PRIVATE"].includes(channelInfo?.channel.channelType)) {
            return "Currently you can receive news only in public and private channels";
        }

        if (!feedLink || feedLink === "") {
            return `You need to give me a url: /feed subscribe url`;
        }

        const canSubscribe = await this.canSubscribeFeedToChannel(channelInfo, userId, botId, client);
        if (!canSubscribe) {
            return "RSS does not have sufficient permissions to post in this channel.";
        }

        const userFeeds = await subscribedFeedRepository.list(
            workspaceId,
            channelId
        );

        if (userFeeds.find(feed => feed.link === feedLink)) {
            return `This channel is already subscribed to feed ${feedLink}. Type "/feed list" to see them all.`;
        }

        let feed = null;
        try {
            feed = await this.parser.parseURL(feedLink);
        } catch (e) {
            this.logger.info(`Error when parsing feed url ${feedLink}. Error ${e}`)
            return `‘${feedLink}’ doesn’t look like a feed url. Try again?`;
        }

        await subscribedFeedRepository.create(workspaceId, userId, channelId, feedLink, feed.title ? feed.title.trim() : "", new Date());

        const sortedItems = feed.items.sort(function(a, b) {
            if (!a.pubDate || !b.pubDate) {
                return 0;
            } 

            return Date.parse(b.pubDate) - Date.parse(a.pubDate);
        })

        let message = `Feed subscribed: ${feed.title ? feed.title.trim() : ""}.`

        if (sortedItems && sortedItems.length > 0) {
            message += `\n\n` + contentFormatService.newItemMessage(sortedItems[0])
        }
        
        // update home view to all users in channel
        channelInfo.users.forEach(async user => {
            const workspaceFeeds = await this.listAll(workspaceId, user, client, false);
            await homeViewService.updateHomeView(workspaceId, user, workspaceFeeds);
        })

        this.logger.info(`Successfully subscribed to feed ${feedLink}`)
        return message;
    }

    public async removeById(workspaceId: any, userId: any, feedId: any, client: ApiClient): Promise<RemoveFeedResult> {
        if (!feedId || feedId === "") {
            return {
                message: `You need to give me a feed ID.`,
                channelId: ''
            };
        }

        const subscribedFeed = await subscribedFeedRepository.findById(feedId);

        if (!subscribedFeed) {
            return {
                message: `Feed with ${feedId} does not exist.`,
                channelId: ''
            }
        }

        const message = await this.removeFeed(client, workspaceId, userId, subscribedFeed.channelId.toHexString(), subscribedFeed.code);
        return {
            message: message,
            channelId: subscribedFeed.channelId.toHexString()
        }
    }

    public async remove(workspaceId: any, userId: any, channelId: any, feedCode: string|undefined, client: ApiClient): Promise<string> {
        if (!feedCode || feedCode === "") {
            return `You need to give me a feed ID: /feed remove ID`;
        }

        return this.removeFeed(client, workspaceId, userId, channelId, feedCode);
    }

    public async list(context: SlashCommandContext) {
        const feeds = await subscribedFeedRepository.list(context.payload.workspaceId, context.payload.channelId);

        if (!feeds || feeds.length === 0) {
            context.say(`No feeds`, 'ephemeral');
            return;
        }

        const message = contentFormatService.listChannelFeedsMessage(feeds);
        
        context.say(message, 'ephemeral');
    }

    public async listAll(workspaceId: any, userId: any, client: ApiClient, allPublicChannels: boolean): Promise<Map<string, Array<SubscribedFeed>>> {
        const feeds = await subscribedFeedRepository.listWorkspaceFeeds(workspaceId.toString());

        const groupedByChannelId = feeds.reduce<Map<string, Array<SubscribedFeed>>>(
            (a, i) => {
                const current = a.get(i.channelId.toString());
                if (current) {
                    current.push(i)
                }
                a.set(i.channelId.toString(), current ? current : [i]);
                return a;
            }, 
            new Map()
        )
        
        const allChannels = await client.v1.channels.listChannels(["PUBLIC", "PRIVATE"]);
        const withChannelNames = new Map();
        for (const key of groupedByChannelId.keys()) {
            try {
                let channelDetails = allChannels.filter(ch => ch.channel.id === key).at(0);
                
                if (!channelDetails) {
                    continue;
                }

                if ((channelDetails.channel.channelType === "PRIVATE" || !allPublicChannels) 
                    && (!channelDetails.users || !channelDetails.users.includes(userId))) {
                    continue;
                }

                withChannelNames.set(channelDetails.channel.name, groupedByChannelId.get(key))
            } catch(e) {
                continue;
            }
        }

        return withChannelNames;
    }

    public async processAllFeeds() {
        let progress: number = 0;
        let counter: number = 0;
        const allFeeds = await subscribedFeedRepository.listAll();
        
        let subscribedFeeds: Array<SubscribedFeed> = [];
        while(await allFeeds.hasNext()) {
            let doc = await allFeeds.next();

            if (!doc) {
                continue;
            }

            subscribedFeeds.push(doc);

            if (++counter % BATCH_SIZE === 0 || !(await allFeeds.hasNext())) {
                this.logger.info(`Processing ${++progress}th batch of size ${subscribedFeeds.length}`);
                
                await this.processFeeds(subscribedFeeds);
                subscribedFeeds = [];
                await this.sleep(TIMEOUT_BETWEEN_BATCHES_MS);
            }
        }
        
    }

    public async listEligibleChannels(userId: string, botId: string, client: ApiClient) {
        let userData: WorkspaceUser | null = null;
        try {
            userData = await client!.v1.users.userInfo(client.workspaceUserId);
        } catch (e) {
            console.error(`Unable to fetch user info for workspace user: ${userId}`, e);
        }
        const channels = await client.v1.channels.listChannels(["PUBLIC", "PRIVATE"]);
        return channels
            .filter(channel => channel.users?.includes(userId) && !channel.channel.isArchived)
            .filter(channel =>
                userData === null ||  // Preventing failure if new scope is not authorized, for backward compatibility
                (this.canPostToChannel(channel, botId, 'USER') && this.canPostToChannel(channel, userId, userData.role))
            );
    }

    canPostToChannel(channel: ChannelInfo, userId: string, role: string) {
        const postingPermissions = channel.channel.postingPermissions;
        if (postingPermissions.postingPermissionsGroup === 'EVERYONE' || postingPermissions.postingPermissionsGroup === 'EVERYONE_BUT_GUESTS') {
            return true;
        }
        return role === 'ADMINISTRATOR' || role === 'OWNER' || postingPermissions.workspaceUserIds!.includes(userId);
    }

    async canSubscribeFeedToChannel(channel: ChannelInfo, userId: string, botUserId: string, client: ApiClient): Promise<boolean> {
        const postingPermissions = channel.channel.postingPermissions;
        if (postingPermissions.postingPermissionsGroup === 'EVERYONE' || postingPermissions.postingPermissionsGroup === 'EVERYONE_BUT_GUESTS') {
            return true;
        }
        if (!postingPermissions.workspaceUserIds!.includes(botUserId)) {
            return false;
        }
        let userData: WorkspaceUser | null = null;
        try {
            userData = await client!.v1.users.userInfo(userId);
        } catch (e) {
            console.error(`Unable to fetch user info for workspace user: ${userId}`, e);
            return true; // Preventing failure if new scope is not authorized, for backward compatibility
        }
        return userData.role === 'ADMINISTRATOR' || userData.role === 'OWNER' || postingPermissions.workspaceUserIds!.includes(userId);
    }

   async processFeeds(subscribedFeeds:Array<SubscribedFeed>) {
        const byWorkspaceId = subscribedFeeds.reduce<Record<string, Array<SubscribedFeed>>>(
            (a, i) => {
                a[i.workspaceId.toString()] = a[i.workspaceId.toString()] || [];
                a[i.workspaceId.toString()].push(i);
                return a;
            },
            {}
        )

        const uniqueWorkspaces: Array<string> = Array.from(
            new Set(subscribedFeeds.map((x) => x.workspaceId.toString()))
        );

        const botClients: Record<string, ApiClient> = {};
        await Promise.all(
            uniqueWorkspaces.map(async (ws) => {
                const token = await credentialsStore.getBotToken(ws);
                const botId = await credentialsStore.getBotUserId(ws);
                if (token && botId) {
                    const auth = new OAuth2Client(
                        ADDON_CLIENT_ID,
                        ADDON_CLIENT_SECRET,
                        ADDON_APP_KEY,
                        token
                    );
                    botClients[ws] = new ApiClient(auth, ws, botId);
                }
            })
        );

        let tasks = []
        for (let workspaceId of uniqueWorkspaces) {
            if (!botClients[workspaceId]) {
                this.logger.info(
                    'Workspace without bot. Skipping...',
                    { workspaceId }
                );
                continue;
            }

            var workspaceFeeds = byWorkspaceId[workspaceId];

            for (let workspaceFeed of workspaceFeeds) {
                tasks.push(limit(() => this.sendMessage(botClients[workspaceFeed.workspaceId.toString()], workspaceFeed)));
            }
        }

        await Promise.all(tasks)
   }

    async sendMessage(botClient: ApiClient, subscribedFeed: SubscribedFeed) {
        let result = await this.parseUrl(subscribedFeed.link);
        if (!result) {
            return;
        }

        let sentItems = 0;
        let lastFetchedItemPublishedAt = subscribedFeed.lastFetchedAt;

        const items = result.items.sort(function(a, b) {
            if (!a.pubDate || !b.pubDate) {
                return 0;
            } 

            return Date.parse(a.pubDate) - Date.parse(b.pubDate);
        })

        for (let item of items) {
            const title = item.title;

            if (!title || !item.pubDate) {
                continue;
            }

            if (new Date(item.pubDate).getTime() <= subscribedFeed.lastFetchedAt.getTime()) {
                continue;
            }

            const message = contentFormatService.newItemMessage(item);

            try {
                const response = await botClient.v1.messages.postMessageToChannel(subscribedFeed.channelId.toString(), message);
                this.logger.info(
                    `Sending message ${response.id} to channel ${subscribedFeed.channelId.toString()} with new article. Title: ${title}`
                );
                await this.sleep(500);
            } catch (err) {
                const errAny = err as any;
                if (errAny && errAny.response) {
                    this.removeFromUnreachableChannel(errAny, subscribedFeed);
                    if (errAny.response.status === 400 || errAny.response.status === 401) {
                        this.logger.error(`Error while sendig message. Status code ${errAny.response.status}.`, {request: errAny.response.config.data, response: errAny.response.data})
                    } else {
                        this.logger.error(`Error while sending message to ${subscribedFeed.channelId.toString()}.`, { error: err })
                    }
                }
                await this.sleep(500);
                continue;
            }

            if (item.pubDate) {
                if (lastFetchedItemPublishedAt.getTime() < new Date(item.pubDate).getTime()) {
                    lastFetchedItemPublishedAt = new Date(new Date(item.pubDate).getTime())
                }
            }

            sentItems += 1;
            if (sentItems >= Number(MAX_ITEMS_NUMBER_PER_CYCLE)) {
                break;
            }
        }

        this.logger.info(`Last fetched at ${lastFetchedItemPublishedAt}, channelId ${subscribedFeed.channelId}.`)
        subscribedFeedRepository.update(subscribedFeed._id, lastFetchedItemPublishedAt);
    }

    async parseUrl(url: string) {
        try {
            this.logger.info(`Parsing feed ${url}.`);
            const response = await axios.get(url, {
                timeout: 5000,
                responseType: 'text',
                maxContentLength: MAX_RESPONSE_SIZE_MB * 1024 * 1024,
            });
            
            return await this.parser.parseString(response.data);
        } catch(e) {
            this.logger.error(
                'Error while parsing feed.',
                {
                    url: url,
                    error: e
                }
            );
            return null;
        }
    }

    private removeFromUnreachableChannel(error: any, feed: SubscribedFeed) {
        if (!error || !error.response || !error.response.data) {
            return;
        }

        if (error.response.data.code === 400440 || error.response.data.code === 404100 
            || error.response.data.code === 403000 || error.response.data.code === 403200) 
        {
            subscribedFeedRepository.remove(feed.code, feed.workspaceId.toHexString(), feed.channelId.toHexString());
            this.logger.info(`Removed feed ${feed.link} for ${feed.channelId.toHexString()} channel from ${feed.workspaceId.toHexString()} workspace.  Reason: archived/deleted channel or lack of permissions.`)
        }
    }

    private async removeFeed(client: ApiClient, workspaceId: string, userId: string, channelId: string, feedCode: string) {
        let channelInfo = undefined;
        try {
            channelInfo = await client.v1.channels.getChannelDetails(channelId);
        } catch(ignore) {

        }

        if (!channelInfo || !channelInfo.users || !channelInfo.users.includes(userId)) {
            return `Cannot remove feed from channel because user cannot access to channel. Channel id ${channelId}, user id ${userId}.`;
        }

        const subscribedFeed = await subscribedFeedRepository.find(feedCode, workspaceId, channelId);

        if (!subscribedFeed) {
            return `I couldn’t find feed with ID: ${feedCode} in this channel.`;
        }

        await subscribedFeedRepository.remove(feedCode, workspaceId, channelId);

        // update home view to all users in channel
        channelInfo.users.forEach(async user => {
            const workspaceFeeds = await this.listAll(workspaceId, user, client, false);
            await homeViewService.updateHomeView(workspaceId, user, workspaceFeeds);
        });

        return `Feed ${feedCode} removed`;
    }

    private sleep(ms: number) {
        return new Promise((resolve) => {
          setTimeout(resolve, ms);
        });
    }

}

export const subscribedFeedService = new SubscribedFeedService();