import { ChannelSubscription, CommentPayload, TicketPayload, ZendeskAuth } from '../types';
import {V1} from "pumble-sdk";
import SendMessagePayload = V1.SendMessagePayload;
import MainBlock = V1.MainBlock;
import BlockRichText = V1.BlockRichText;
import WorkspaceUser = V1.WorkspaceUser;
import BlockButton = V1.BlockButton;
import { BlockInteractionContext } from 'pumble-sdk/lib/core/types/contexts';
import { ViewBuilder } from 'pumble-sdk/lib/core/util/ViewUtils';
import { value } from './utils';
import { FILTER_FIELD_NAME } from './constants';
import { ticketService } from '../service/TicketService';
import BlockInput = V1.BlockInput;
import BlockDynamicSelectMenu = V1.BlockDynamicSelectMenu;
import BlockBasic = V1.BlockBasic;

export class MessageFormatter {
    public static buildTicketMessage(title: string, ticket: TicketPayload, user: WorkspaceUser, subdomain?: string, group?: string, assignee?: string, requester?: string): SendMessagePayload {
        const usFormatter = new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: '2-digit', // MM
            day: '2-digit',   // DD
            hour: '2-digit',  // HH
            minute: '2-digit', // MM
            second: '2-digit', // SS
            hour12: true,      // AM/PM format
            timeZone: user.timeZoneId
        });

        return {
            text: title,
            attachments: [{
                color: this.mapTicketColor(ticket.status),
                blocks: [{
                    type: "rich_text",
                    elements: [{
                        type: "rich_text_section",
                        elements: [{ type: "text", text: "Description\n", style: { bold: true } }, {
                            type: "text",
                            text: ticket.description
                        }]
                    }]
                }],
                fields: [
                    { title: "Subject", value: ticket.subject, short: true },
                    {
                        title: "Created at",
                        value: `${usFormatter.format(new Date(ticket.created_at))} ${user.timeZoneId}`,
                        short: true
                    },
                    ticket.tags && ticket.tags.length > 0 ? { title: "Tags", value: ticket.tags?.join(", "), short: true } : undefined,
                    ticket.type ? { title: "Type", value: ticket.type, short: true } : undefined,
                    group ? { title: "Group", value: group, short: true } : undefined,
                    assignee ? { title: "Assignee", value: assignee, short: true } : undefined,
                    requester ? { title: "Requester", value: requester, short: true } : undefined,
                ].filter(f => !!f),
                footer: `Author: ${user.name} | ${subdomain ? subdomain : 'Ticket #' + ticket.id} | Priority: ${ticket.priority} | Status: ${ticket.status} | Last update: ${usFormatter.format(new Date(ticket.updated_at))}`,
                footer_icon: user.avatar.scaledPath,
                author_name: `Ticket #${ticket.id}`,
                author_link: subdomain ? `https://${subdomain}.zendesk.com/agent/tickets/${ticket.id}` : undefined
            }]
        }
    }

    public static buildCommentMessage(comment: CommentPayload, asBot: boolean): SendMessagePayload {
        const parts = comment.body.split(/(\*\*)|(_)|(`)/).filter(x => x !== undefined);
        let boldOpen = false, italicOpen = false, codeOpen = false;
        const blocks: any[] = [];
        for (let i = 0; i < parts.length; ++i) {
            if (parts[i] === "_") {
                italicOpen = !italicOpen;
                continue;
            }
            if (parts[i] === "**") {
                boldOpen = !boldOpen;
                continue;
            }
            if (parts[i] === "`") {
                codeOpen = !codeOpen;
                continue;
            }
            let style = {};
            if (italicOpen || boldOpen || codeOpen) {
                style = {italic: italicOpen, bold: boldOpen, code: codeOpen};
            }
            blocks.push({ type: "text", text: parts[i], style: style });
        }
        const block: BlockRichText = {
            type: "rich_text",
            elements: [
                {
                    type: "rich_text_section",
                    elements: [{
                        type: "text",
                        text: `${!comment.is_public ? "Internal note " : "Public reply "}${asBot ? `by ${comment.author.name}` : ''}`,
                        style: { italic: true }
                    }]
                },
                {
                    type: "rich_text_quote",
                    elements: blocks
                }
            ]
        };
        return {
            text: comment.body,
            blocks: [block]
        };
    }

    public static createTicketModalContent(auth: ZendeskAuth): MainBlock[] {
        return [
            {
                type: "rich_text",
                elements: [{
                    type: "rich_text_section",
                    elements: [{ type: "text", text: "Subdomain " }, {
                        type: "text",
                        text: auth.subdomain,
                        style: { bold: true }
                    }]
                }]
            },
            {
                type: "input",
                blockId: "subject",
                label: { text: "Subject", type: "plain_text" },
                element: {
                    type: "plain_text_input",
                    placeholder: { text: "Enter ticket subject", type: "plain_text" },
                    onAction: "subject",
                    max_length: 200,
                    autofocused: true
                },
                optional: false,
            },
            {
                type: "input",
                blockId: "requester",
                label: { text: "Requester", type: "plain_text" },
                element: {
                    type: "dynamic_select_menu",
                    placeholder: { text: "Select requester", type: "plain_text" },
                    onAction: "requester",
                    loadingTimeout: 5
                }
            },
            {
                type: "input",
                blockId: "description",
                label: { text: "Description", type: "plain_text" },
                element: {
                    type: "plain_text_input",
                    placeholder: { text: "Add ticket description here", type: "plain_text" },
                    onAction: "description",
                    line_mode: "multiline",
                    max_length: 1000
                },
                optional: false,
            },
            {
                type: "input",
                blockId: "assignee",
                label: { text: "Assignee", type: "plain_text" },
                optional: true,
                element: {
                    type: "dynamic_select_menu",
                    placeholder: { text: "Select assignee", type: "plain_text" },
                    onAction: "assignee",
                    loadingTimeout: 5
                }
            },
        ];
    }

    public static generateHomeView(subs: ChannelSubscription[], auth?: ZendeskAuth): MainBlock[] {
        const buttons: BlockButton[] = [];

        if (auth) {
            buttons.push({
                type: "button",
                onAction: "create_ticket_bttn",
                text: {
                    text: ':memo: Create a ticket',
                    type: "plain_text",
                    emoji: true
                },
                loadingTimeout: 5,
                style: "primary"
            });

            buttons.push({
                type: "button",
                onAction: "add_sub_btn_open_modal",
                text: {
                    text: ':bell: Subscribe to channel',
                    type: "plain_text",
                    emoji: true
                },
                loadingTimeout: 5,
                style: "primary"
            });

            if (subs.length > 0) {
                buttons.push({
                    type: "button",
                    onAction: "remove_sub_btn_open_modal",
                    text: {
                        text: ':no_bell: Unsubscribe channel',
                        type: "plain_text",
                        emoji: true
                    },
                    loadingTimeout: 5,
                    style: "secondary"
                });
            }

            buttons.push({
                type: "button",
                onAction: "remove_org_btn_open_modal",
                confirm: {
                    title: { type: "plain_text", text: "Disconnect Zendesk account?" },
                    text: { type: "plain_text", text: 'Disconnecting the account will immediately stop all data synchronization and halt any in-progress actions. To resume service, you will need to reconnect the account. However, your existing channel subscriptions will be retained and will automatically resume syncing once you reconnect.', },
                    confirm: { type: "plain_text", text: "Disconnect" },
                    deny: { type: "plain_text", text: "Close" },
                    style: "warning"
                },
                text: {
                    text: 'Disconnect',
                    type: "plain_text",
                },
                loadingTimeout: 5,
                style: "danger"
            });
        } else {
            buttons.push({
                type: "button",
                onAction: "add_org_btn_open_modal",
                text: {
                    text: ':paperclip: Connect Zendesk account',
                    type: "plain_text",
                    emoji: true
                },
                loadingTimeout: 5,
                style: "primary"
            });
        }

        const channelElements: any[] = []
        if (auth) {
            subs.forEach((value, key) => {
                channelElements.push({
                        type: "rich_text_section",
                        elements: [
                            {
                                type: "channel",
                                channel_id: value.channelId.toHexString()
                            },
                            { type: "text", text: value.filters ? ' with filters ': ' for all events'},
                            value.filters ? { type: "text", text: value.filters, style: { code: true } } : undefined,
                        ].filter(e => !!e)
                    }
                );
            });
        }

        return [
            {
                type: "rich_text",
                elements: [
                    {
                        type: "rich_text_section",
                        elements: [
                            {
                                type: "emoji",
                                name: "wave"
                            },
                            {
                                type: "text",
                                text: " Welcome to the Zendesk app"
                            },
                        ]
                    }
                ]
            },
            {
                type: "actions",
                elements: buttons
            },
            { type: "divider" },
            channelElements && channelElements.length > 0 ?
                {
                    type: "rich_text",
                    elements: [
                        {
                            type: "rich_text_section",
                            elements: [
                                {
                                    type: "text",
                                    text: 'Subscribed channels for the subdomain '
                                },
                                {
                                    type: "text",
                                    text: auth?.subdomain,
                                    style: { bold: true }
                                }
                            ]
                        },
                        {
                            type: "rich_text_list",
                            indent: 2,
                            style: "bullet",
                            elements: channelElements
                        }]
                } : undefined,
        ].filter(e => !!e) as MainBlock[]
    }

    public static generateAddChannelSubModal(filterButtons: boolean, initialChannel?: {id: string, name: string}): MainBlock[] {
        let blocks: MainBlock[] = [
            {
                type: 'input',
                blockId: "channelId",
                optional: false,
                label: { type: "plain_text", text: "Subscribe channel" },
                element: {
                    onAction: "dynamic_select_channel",
                    type: "dynamic_select_menu",
                    placeholder: { type: "plain_text", text: "Select channel" },
                    autofocused: true,
                    loadingTimeout: 5,
                    initial_option: initialChannel ? {value: initialChannel.id, text: {type: "plain_text", text: initialChannel.name}} : undefined
                }
            }
        ];

        if (filterButtons) {
            blocks.push(...MessageFormatter.filtersToAddChannelSubModal(1));
            blocks.push(this.generateAddRemoveFilterButtons(true, false));
        }
        return blocks;
    }

    public static generateAddRemoveFilterButtons(addButton: boolean, removeButton: boolean): MainBlock {
        let buttons: BlockButton[] = [];

        if (addButton) {
            buttons.push({
                type: 'button',
                text: { type: "plain_text", text: "Add filter" },
                loadingTimeout: 5,
                onAction: "add_filter_bttn"
            });
        }
        if (removeButton) {
            buttons.push({
                type: 'button',
                text: { type: "plain_text", text: "Remove filter" },
                style: 'secondary',
                loadingTimeout: 5,
                onAction: "remove_filter_bttn"
            });
        }

        return {
            type: 'actions',
            elements: buttons
        };
    }

    public static filtersToAddChannelSubModal(order: number): MainBlock[] {
        return [{
            type: 'input',
            blockId: `${FILTER_FIELD_NAME}${order}`,
            label: { type: "plain_text", text: "Select field to filter by" },
            optional: true,
            element: {
                onAction: FILTER_FIELD_NAME,
                type: "dynamic_select_menu",
                placeholder: { type: "plain_text", text: `Filter ${order}` },
                loadingTimeout: 5,
            }
        }];
    }

    public static async replaceDynamicMenusWithInitialData(ctx: BlockInteractionContext<"VIEW">, builder: ViewBuilder<"HOME" | "MODAL">, auth: ZendeskAuth) {
        const channelId = value(ctx.payload.view?.state?.values["channelId"]?.["dynamic_select_channel"]);
        if (channelId) {
            const client = await ctx.getUserClient(ctx.payload.userId);
            const channel = await client?.v1.channels.getChannelDetails(channelId);
            if (channel && channel?.channel.name) {
                builder.removeBlockAt(0);
                builder.prependBlocks(MessageFormatter.generateAddChannelSubModal(false, {
                    id: channel.channel.id,
                    name: channel.channel.name
                }));
            }
        }

        const replaceInputBlock = (builder: ViewBuilder<"HOME" | "MODAL">, options: V1.OptionGroup[], filter: string, index: number) => {
            const defaultOption = options.flatMap(f => f.options).find(option => option.value === filter);
            if (defaultOption && ctx.viewBlocks && ctx.viewBlocks.length > index &&
                    ctx.viewBlocks[index].type === "input" && ctx.viewBlocks[index].blockId.startsWith(FILTER_FIELD_NAME)) {
                const block = ctx.viewBlocks[index] as BlockInput;
                const dynamicMenu = block.element as BlockDynamicSelectMenu;
                dynamicMenu.initial_option = defaultOption;
                builder.removeBlockAt(index);
                builder.insertBlocksAt(index, [block]);
            }
        }

        const firstFilter = value(ctx.payload.view?.state?.values[`${FILTER_FIELD_NAME}1`]?.[FILTER_FIELD_NAME]);
        const secondFilter = value(ctx.payload.view?.state?.values[`${FILTER_FIELD_NAME}2`]?.[FILTER_FIELD_NAME]);
        const thirdFilter = value(ctx.payload.view?.state?.values[`${FILTER_FIELD_NAME}3`]?.[FILTER_FIELD_NAME]);
        if (firstFilter || secondFilter || thirdFilter) {
            const fieldsList = await ticketService.getTicketFieldsListNested(auth);
            if (firstFilter) {
                replaceInputBlock(builder, fieldsList, firstFilter, 1);
            }
            if (secondFilter) {
                replaceInputBlock(builder, fieldsList, secondFilter, 2);
            }
            if (thirdFilter) {
                replaceInputBlock(builder, fieldsList, thirdFilter, 3);
            }
        }
    }


    public static generateRemoveChannelSubModal(channels: {channelId: string, channelName?: string}[]): MainBlock[] {
        return [{
            type: 'input',
            blockId: "channelId",
            optional: false,
            label: { type: "plain_text", text: "Unsubscribe channel" },
            element: {
                onAction: "select_channel_unsubscribe",
                type: "static_select_menu",
                placeholder: { type: "plain_text", text: "Select channel" },
                autofocused: true,
                options: channels.map(ch => {
                    return { value: ch.channelId, text: { text: ch.channelName?.slice(0, 75) ?? "", type: "plain_text" } }
                })
            }
        }]
    }

    public static generateConnectOrgView(): MainBlock[] {
        return [
            {
                type: 'input',
                blockId: "subdomain",
                optional: false,
                label: { type: "plain_text", text: "" },
                element: {
                    onAction: "subdomain",
                    type: "plain_text_input",
                    placeholder: { type: "plain_text", text: "Enter subdomain" },
                    max_length: 50,
                    line_mode: "singleline",
                    autofocused: true
                }
            }
        ];
    }

    public static generateConnectOrgLinkModalMessage(preText: string, url: string): MainBlock[] {
        return [
            {
                type: 'section',
                text: {type: "plain_text", text: preText},
                accessory: {
                    type: "input",
                    dispatchAction: true,
                    blockId: "connect_org_link",
                    label: {type: "plain_text", text: ""},
                    element: {
                        type: "button",
                        onAction: "connect_org_link_bttn",
                        text: {type: "plain_text", text: "Connect"},
                        url: url
                    }
                }
            }
        ]
    }

    public static generateConnectOrgLinkMessage(preText: string, actionName: string, url: string): MainBlock[] {
        return [
            {
                type: 'rich_text',
                elements: [
                    {
                        type: "rich_text_section",
                        elements: [{
                            type: "text",
                            text: preText
                        }]
                    }]
            },
            {
                type: "actions",
                elements: [
                    {
                        type: "button",
                        text: { type: "plain_text", text: actionName },
                        url: url,
                        style: "secondary"
                    }
                ]
            }]
    };

    public static generateConnectOrgCloseWindowMessage(): MainBlock[] {
        return [
            {
                type: 'rich_text',
                elements: [
                    {
                        type: 'rich_text_section',
                        elements: [
                            {
                                type: 'text',
                                text: `You may close this window now.`,
                            }
                        ],
                    },
                ],
            }
        ];
    }

    private static mapTicketColor(status: string) {
        switch (status) {
            case "OPEN":
            case "IN PROGRESS": return "#CD3642";
            case "NEW": return "#FCA347";
            case "PENDING": return "#1F73B7";
            case "SOLVED": return "#5C6970";
        }
    }
}