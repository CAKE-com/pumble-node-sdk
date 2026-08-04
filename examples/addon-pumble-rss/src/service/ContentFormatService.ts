import Parser from "rss-parser";
import { SubscribedFeed } from "../types";
import { Logger } from "../utils/Logger";
import { V1 } from 'pumble-sdk';
import BlockRichText = V1.BlockRichText;
import SendMessagePayload = V1.SendMessagePayload;
import BlockRichTextSection = V1.BlockRichTextSection;
import BlockRichTextList = V1.BlockRichTextList;
import MainBlock = V1.MainBlock;
import BlockButton = V1.BlockButton;
import { BlockInteractionContext } from "pumble-sdk/lib/core/types/contexts";
import {DEMO_VIDEO_URL, HELP_PAGE_URL, PUMBLE_APP_URL} from "../config/config";
import {authService} from "./AuthService";


class ContentFormatService {
    private logger = Logger.getInstance(ContentFormatService);
    
    public listChannelFeedsMessage(feeds: SubscribedFeed[]): string {
        return feeds
            .map((feed) => {
                return `ID: ${feed.code} - Title: ${feed.title.trim()} \nURL: ${feed.link}`
            })
            .join(`\n\n`);
    }

    public listWorkspaceFeedsMessage(feedsWithChannelNames: Map<string, Array<SubscribedFeed>>): string {
        if (!feedsWithChannelNames || feedsWithChannelNames.size === 0) {
            return "No feeds.";
        }

        let message = "";
        feedsWithChannelNames.forEach((value, key) => {
            message += `Channel ${key}:\n`;
            value.forEach((feed) => message += `    • ID: ${feed.code} - Title: ${feed.title.trim()}. URL: ${feed.link}\n`)
        })
        return message;
    }

    public newItemMessage(item: Parser.Item): string {
        let message = `${item.link} - ${item.title?.trim()}`;
        if (item.summary) {
            message = message + `\n${item.summary}`;
        }

        return message;
    }

    public async mapChannelsToOptions(channels: V1.ChannelInfo[], payloadQuery: string|undefined): Promise<V1.Option[]> {
        return channels.map(channel => {
            return {text: {type: "plain_text", text: `${this.trimToLength(channel.channel.name, 75)}`}, value: channel.channel.id.toString()}
        }).filter(op => !payloadQuery ||
            op.text.text.toLowerCase().includes(payloadQuery.toLowerCase()) ||
            op.value.toLowerCase().includes(payloadQuery.toLowerCase())) as V1.Option[];
    }

    public async mapFeedsToOptionsGroups(userFeeds: Map<string, SubscribedFeed[]>, payloadQuery: string|undefined) : Promise<V1.OptionGroup[]> {
        payloadQuery = payloadQuery ? payloadQuery.toLowerCase() : payloadQuery;
        const options: V1.OptionGroup[] = [];
        userFeeds.forEach((value, key) => {
            const values: V1.Option[] = value.map(feed => {return {
                text: {
                    type: "plain_text",
                    text: feed.title.trim()
                },
                value: feed._id.toHexString()
            }});
            options.push({
                label: {
                    type: "plain_text",
                    text: `${this.trimToLength(key, 75)}`
                },
                options: values
            });
        });

        return options
                .filter(og => og.options.some(opt => !payloadQuery ||
                    og.label.text.toLowerCase().includes(payloadQuery) ||
                    opt.text.text.toLowerCase().includes(payloadQuery)))
                .map(og => {
                    if (!payloadQuery || og.label.text.toLowerCase().includes(payloadQuery)) {
                        return og;
                    }

                    og.options = og.options.filter(opt => opt.text.text.toLowerCase().includes(payloadQuery));
                    return og;
                }) as V1.OptionGroup[];;
    }

    public async addFeedModal(ctx: BlockInteractionContext<'VIEW'>): Promise<V1.View<"MODAL">> {
        return {
            callbackId: "modalAddFeedCallback",
            parentViewId: ctx.payload.sourceId,
            type: "MODAL",
            title: {type: "plain_text", text: "Add a Feed"},
            submit: {type: "plain_text", text: "Add"},
            close: {type: "plain_text", text: "Close"},
            notifyOnClose: false,
            blocks: [
                {
                    type: "input",
                    blockId: "add_feed_url_block",
                    label: {text: "Feed URL", type: "plain_text"},
                    element: {
                        type: "plain_text_input",
                        placeholder: {text: "http://", type: "plain_text"},
                        onAction: "input_add_url_block",
                        autofocused: true
                    },
                    optional: false
                },
                {
                    type: "input",
                    blockId: "choose_channel_dynamic_block",
                    label: {text: "Post to Channel", type: "plain_text"},
                    element: {
                        type: "dynamic_select_menu",
                        onAction: "onChannelDynamicItemSelect",
                        placeholder: {
                            type: "plain_text",
                            text: "Select a channel"
                        }
                    },
                    optional: false
                }
            ],
        };
    }

    public async removeFeedModal(ctx: BlockInteractionContext<'VIEW'>): Promise<V1.View<"MODAL">>  {
        return {
            callbackId: "modalRemoveFeedCallback",
            parentViewId: ctx.payload.sourceId,
            type: "MODAL",
            title: {type: "plain_text", text: "Remove a Feed"},
            submit: {type: "plain_text", text: "Remove"},
            close: {type: "plain_text", text: "Close"},
            notifyOnClose: false,
            blocks: [
                {
                    type: "input",
                    blockId: "remove_feed_dynamic_block",
                    label: {text: "Choose channel and feed", type: "plain_text"},
                    element: {
                        type: "dynamic_select_menu",
                        onAction: "onChannelFeedDynamicMenuItemGroupSelect",
                        placeholder: {
                            type: "plain_text",
                            text: "Select a feed"
                        },
                        autofocused: true
                    },
                }
            ],
        }
    }

    public async homeViewBlocks(feedsWithChannelNames: Map<string, Array<SubscribedFeed>>): Promise<MainBlock[]> {
        const buttonsElements: BlockButton[] = [
            {
                type: "button",
                onAction: "add_feed_btn_open_modal",
                value: `test metadata`,
                text: {
                    text: 'Add a Feed',
                    type: "plain_text"
                },
                style: "primary"
            }
        ];

        if (feedsWithChannelNames.size > 0) {
            buttonsElements.push({
                type: "button",
                onAction: "remove_feed_btn_open_modal",
                value: `test metadata`,
                text: {
                    text: 'Remove a Feed',
                    type: "plain_text"
                },
                style: "primary"
            });
        }

        const channelElements: any[] = []
        feedsWithChannelNames.forEach((value, key) => {
            channelElements.push({
                type: "rich_text_section",
                elements: [
                    {
                        type: "text",
                        text: "\n"
                    },
                    {
                        type: "text",
                        text: "Subscribed feeds on "
                    },
                    {
                        type: "channel",
                        channel_id: value.at(0)?.channelId
                    }
                ]
            });

            const channelFeedsElements: BlockRichTextSection[] = []
            value.forEach(feed => {
                channelFeedsElements.push(
                    {
                        "type": "rich_text_section",
                        "elements": [
                            {
                                type: "link",
                                text: feed.title.trim(),
                                url: feed.link
                            }
                        ]
                    }
                )
            });

            const channelFeed: BlockRichTextList = {
                type: "rich_text_list",
                indent: 0,
                style: "bullet",
                elements: channelFeedsElements
            }

            channelElements.push(channelFeed);
        });

        return [
            {
                type: "rich_text",
                elements: [
                    {
                        type: "rich_text_section",
                        elements: [
                            {
                                type: "text",
                                text: "Subscribe to your favorite websites or online sources and receive updates in your Pumble" 
                                + " channels automatically. Feeds will be fetched periodically and posted to your Pumble channels."
                            },
                            {
                                type: "text",
                                text: "\n\n"
                            },
                            {
                                type: "text",
                                text: "Feeds can also be managed from within Pumble channels. Type "
                            },
                            {
                                type: "text",
                                text: "/feed help",
                                style: {
                                    code: true
                                }
                            },
                            {
                                type: "text",
                                text: " to get started."
                            }
                        ]
                    }
                ]
            },
            {
                type: "actions",
                elements: buttonsElements
            },
            {
                type: "rich_text",
                elements: channelElements
            }
        ]
    }

    public helpMessage(): SendMessagePayload {
        const helpMessageText = `Valid commands: subscribe, list, list_all, remove, help.
    • /feed subscribe https://pumble.com/blog/feed - to subscribe to a feed in this channel.
    • /feed list - to list subscribed feeds from this channel.
    • /feed list_all - to list subscribed feeds from this workspace.
    • /feed remove ID - to remove a feed from this channel.`

        const helpMessageBlocks: BlockRichText[] = [
            {
                "type": "rich_text",
                "elements": [
                    {
                        "type": "rich_text_section",
                        "elements": [
                            {
                                "type": "text",
                                "text": "Valid commands: subscribe, list, list_all, remove, help.\n"
                            },
                            {
                                "type": "text",
                                "text": "/feed subscribe",
                                "style": {
                                    "code": true
                                }
                            },
                            {
                                "type": "text",
                                "text": " "
                            },
                            {
                                "type": "link",
                                "url": "https://pumble.com/blog/feed"
                            },
                            {
                                "type": "text",
                                "text": " - to subscribe to a feed in this channel.\n"
                            },
                            {
                                "type": "text",
                                "text": "/feed list",
                                "style": {
                                    "code": true
                                }
                            },
                            {
                                "type": "text",
                                "text": "  - to list subscribed feeds from this channel.\n"
                            },
                            {
                                "type": "text",
                                "text": "/feed list_all",
                                "style": {
                                    "code": true
                                }
                            },
                            {
                                "type": "text",
                                "text": " - to list subscribed feeds from this workspace.\n"
                            },
                            {
                                "type": "text",
                                "text": "/feed remove ID",
                                "style": {
                                    "code": true
                                }
                            },
                            {
                                "type": "text",
                                "text": " - to remove a feed from this channel."
                            }
                        ]
                    }
                ]
            }
        ];
            
        return {
            text: helpMessageText, 
            blocks: helpMessageBlocks
        }
    }

    public welcomeMessageInstallerBlocks(workspaceId: string, channelId?: string): MainBlock[] {
        return [
            {
                type: 'rich_text',
                elements: [
                    {
                        type: 'rich_text_section',
                        elements: [
                            { type: 'emoji', name: 'tada' },
                            { type: 'text', text: ' Congratulations! You have successfully installed the RSS app ' },
                            { type: 'emoji', name: 'newspaper' },
                            {
                                type: 'text',
                                text: ' on this Pumble workspace.\nUse it to automatically post updates from your favorite websites, blogs, or news feeds directly into Pumble channels.\n\n'
                            },
                            { type: 'text', text: 'Quick Start:', style: { bold: true } }
                        ]
                    },
                    {
                        type: 'rich_text_list',
                        indent: 0,
                        style: 'bullet',
                        elements: [
                            {
                                type: 'rich_text_section',
                                elements: [
                                    { type: 'text', text: 'Once set up, check out the app\'s ' },
                                    channelId ?
                                        {
                                            type: 'link',
                                            url: `${PUMBLE_APP_URL}/workspace/${workspaceId}/${channelId}#home`,
                                            text: 'Home tab',
                                            style: { bold: true }
                                        } :
                                        { type: 'text', text: 'Home tab', style: { bold: true } },
                                    { type: 'text', text: ' to manage your feed subscriptions.' }
                                ]
                            },
                            {
                                type: 'rich_text_section',
                                elements: [
                                    { type: 'text', text: 'Type ' },
                                    { type: 'text', text: '/rss help', style: { code: true } },
                                    { type: 'text', text: ' to see a list of all available commands.' }
                                ]
                            },
                            {
                                type: 'rich_text_section',
                                elements: [
                                    { type: 'text', text: 'For additional info you can visit our ' },
                                    { type: 'link', url: HELP_PAGE_URL, text: 'help page' },
                                    { type: 'text', text: ' or check out the ' },
                                    { type: 'link', url: DEMO_VIDEO_URL, text: 'video' },
                                    { type: 'text', text: ' below for a quick walkthrough.' }
                                ]
                            }
                        ]
                    }
                ]
            }
        ];
    }

    public welcomeMessageUsersBlocks(listingUrl: string): MainBlock[] {
        return [
            {
                type: 'rich_text',
                elements: [
                    {
                        type: 'rich_text_section',
                        elements: [
                            { type: 'text', text: 'RSS app ' },
                            { type: 'emoji', name: 'newspaper' },
                            { type: 'text', text: ' has been installed to your workspace ' },
                            { type: 'emoji', name: 'tada' },
                            { type: 'text', text: '\nUse it to automatically post updates from your favorite websites, blogs, or news feeds directly into Pumble channels.\n\n' },
                            { type: 'text', text: 'Quick Tips:', style: { bold: true } }
                        ]
                    },
                    {
                        type: 'rich_text_list',
                        indent: 0,
                        style: 'bullet',
                        elements: [
                            {
                                type: 'rich_text_section',
                                elements: [
                                    { type: 'text', text: 'Check the app\'s ' },
                                    { type: 'text', text: 'Home tab', style: { bold: true } },
                                    { type: 'text', text: ' from where you can manage all feed subscriptions for the workspace - all in one place.' }
                                ]
                            },
                            {
                                type: 'rich_text_section',
                                elements: [
                                    { type: 'text', text: 'View available options by typing the command ' },
                                    { type: 'text', text: '/rss help', style: { code: true } },
                                    { type: 'text', text: ' to help you manage your feeds.' }
                                ]
                            },
                            {
                                type: 'rich_text_section',
                                elements: [
                                    { type: 'text', text: 'For additional info you can visit our ' },
                                    { type: 'link', url: HELP_PAGE_URL, text: 'help page' },
                                    { type: 'text', text: ' or check out the ' },
                                    { type: 'link', url: DEMO_VIDEO_URL, text: 'video' },
                                    { type: 'text', text: ' below for a quick walkthrough.' }
                                ]
                            }
                        ]
                    },
                    {
                        type: 'rich_text_section',
                        elements: [
                            { type: 'link', text: '\nAuthorize the app', style: { bold: true }, url: listingUrl },
                            { type: 'text', text: ' in order to use it, or visit the Configure apps page.' }
                        ]
                    }
                ]
            }
        ];
    }

    trimToLength = (text: string|undefined, maxLength: number) => {
        if (!text) {
            return text;
        }
    
        return text.length >= maxLength ? text.substring(0, maxLength - 1) : text;
    }
}

export const contentFormatService = new ContentFormatService();