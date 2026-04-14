import {V1} from "pumble-sdk";
import SendMessagePayload = V1.SendMessagePayload;
import { PUMBLE_APP_URL } from '../config/config';

export const FILTER_FIELD_NAME = "filterField";

const HELP_PAGE_URL = "https://pumble.com/help/integrations/automation-workflow-integrations/zendesk-addon/";
const DEMO_VIDEO_URL = "https://vimeo.com/1170967941/c03c8411d7";

export const HELP_MESSAGE: SendMessagePayload = {
    text: 'Hi there \uD83D\uDC4B\uD83C\uDFFD here are some ideas of what you can do:\n\nConnect to repositories\nSubscribe ⁣`/github subscribe owner/repo`⁣\nUnsubscribe ⁣`/github unsubscribe owner/repo`⁣\nShow subscriptions ⁣`/github list`⁣\n\nAdvanced commands to customize your subscriptions\n\nConfigure subscriptions\nYou can customize your notifications by subscribing to activity that is relevant to your Pumble channel by naming them (comma separated) at the end of subscribe command.\n⁣`/github subscribe owner/repo issues, pull_request, release`⁣\n⁣`/github unsubscribe owner/repo issues, pull_request, release`⁣\n\nIf no event is provided, default events are applied: ⁣`issues, push, pull_request, pull_request_review, release, deployment_status`⁣. \nAdditionally, You can subscribe to ⁣`workflow_run and deployment`⁣.\n\nBranch filters for commit\nBranch filters allow filtering commit notifications. By default when you subscribe for commits feature, you will get notifications for your default branch (i.e. main or master). However, you can choose to filter on a specific branch, or a pattern of branches or all branches.\n⁣`/github subscribe owner/repo push:mybranch/*`⁣\n\nList active subscriptions\nList all active subscriptions in a channel\n⁣`/github list`⁣',
    blocks: [
        {
            type: 'rich_text',
            elements: [
                {
                    type: 'rich_text_section',
                    elements: [
                        {
                            type: 'text',
                            text: 'Hi there ',
                        },
                        {
                            type: 'emoji',
                            name: 'wave',
                        },
                        {
                            type: 'text',
                            text: ' here are some ideas of what you can do:\n\n',
                        },
                        {
                            type: 'text',
                            text: 'Connect Zendesk account',
                            style: {
                                bold: true,
                            },
                        },
                        {
                            type: 'text',
                            text: '\nConnect ',
                        },
                        {
                            type: 'text',
                            text: '/zendesk connect {subdomain}',
                            style: {
                                code: true,
                            },
                        },
                        {
                            type: 'text',
                            text: '\nDisconnect ',
                        },
                        {
                            type: 'text',
                            text: '/zendesk disconnect',
                            style: {
                                code: true,
                            },
                        },
                        {
                            type: 'text',
                            text: '\n\nSubscribe channel to events\n',
                            style: {
                                bold: true
                            }
                        },
                        {
                            type: 'text',
                            text: 'Subscribe with optional field filters '
                        },
                        {
                            type: 'text',
                            text: '/zendesk subscribe',
                            style: {
                                code: true,
                            },
                        },
                        {
                            type: 'text',
                            text: '\nUnsubscribe '
                        },
                        {
                            type: 'text',
                            text: '/zendesk unsubscribe',
                            style: {
                                code: true,
                            },
                        },
                        {
                            type: 'text',
                            text: '\n\nCreate ticket from Pumble',
                            style: { bold: true }
                        },
                        {
                            type: 'text',
                            text: '\nInvoke global shortcut ',
                        },
                        {
                            type: 'text',
                            text: 'Create Zendesk ticket',
                            style: {
                                code: true,
                            },
                        }
                    ],
                },
            ],
        },
    ],
};

export const welcomeMessageInstaller = (workspaceId: string, channelId?: string): SendMessagePayload => {
    return {
        text: "",
        blocks: [
            {
                type: 'rich_text',
                elements: [
                    {
                        type: 'rich_text_section',
                        elements: [
                            { type: 'emoji', name: 'tada' },
                            { type: 'text', text: ' Congratulations! You have successfully installed Zendesk app ' },
                            { type: 'emoji', name: 'ticket' },
                            {
                                type: 'text',
                                text: ' on this Pumble workspace.\n\nUse it to centralize your Zendesk updates, create tickets and get notifications on ticket updates directly on Pumble. Updates are limited to tickets belonging exclusively to your connected account.\n\n'
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
                                    { type: 'text', text: '/zendesk help', style: { code: true } },
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
        ]
    };
};

export const welcomeMessageUser = (workspaceId: string, channelId?: string): SendMessagePayload => {
    return {
        text: "",
        blocks: [
            {
                type: 'rich_text',
                elements: [
                    {
                        type: 'rich_text_section',
                        elements: [
                            { type: 'text', text: 'Zendesk app ' },
                            { type: 'emoji', name: 'ticket' },
                            {type: 'text', text: ' has been installed to your workspace '},
                            { type: 'emoji', name: 'tada' },
                            {
                                type: 'text',
                                text: '\n\nUse it to centralize your Zendesk updates, create tickets and get notifications on ticket updates directly on Pumble. Updates are limited to tickets belonging exclusively to your connected account.\nAuthorize the app in order to use it, or visit the Configure apps page.\n\n'
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
                                    { type: 'text', text: '/zendesk help', style: { code: true } },
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
        ]
    };
};

export const WELCOME_MESSAGE_USERS = "Zendesk  app 🎫  has been installed to your workspace 🎉\n"+
    "Use it to centralize your Zendesk updates, create tickets and get notifications on ticket updates directly on Pumble. Updates are limited to tickets belonging exclusively to your connected account.\n\n"
    + "Authorize the app here in order to use it, or visit the Configure apps page.\n" +
    "Once authorized, type `/zendesk help` to list available commands or check the Home tab from where you can manage your tickets - all in one place.";

export const AUTHORIZATION_MESSAGE: SendMessagePayload = {
    text: `In order to use Zendesk please authorize the Zendesk app on the Configure Apps page. Click the 'Add Apps' button at the bottom of the left sidebar to open it.`,
};

export const ACCOUNT_NOT_CONNECTED_MESSAGE: SendMessagePayload = {
    text: "Error occurred, please connect Zendesk account by using `/zendesk connect {subdomain}` command"
};

export const ONLY_PUBLIC_AND_PRIVATE_CHANNELS_ALLOWED: SendMessagePayload = {
    text: "Only public and private channels can be subscribed to Zendesk"
}