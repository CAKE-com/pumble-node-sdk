import {V1} from "pumble-sdk";
import MainBlock = V1.MainBlock;
import {Poll} from "../domain/Poll";
import {PUMBLE_FRONTEND_URL} from "../config";
import { Logger } from "./Logger";

const logger = Logger.getInstance("utils");

export const getQuestionParts = (question: string) => {
    let questionParts = question.split(new RegExp('(?:<<|>>)'))
    let text = '';
    let userIds = [];
    let channelIds = [];
    let groupIds = [];

    for (let questionPart of questionParts) {
        let id = questionPart.trim().substring(1, questionPart.length);
        if (questionPart.startsWith('@')) {
            userIds.push(id);
            text += `<span class="user">${id}</span>`
        } else if (questionPart.startsWith('#')) {
            channelIds.push(id);
            text += `<span class="channel">${id}</span>`
        } else if (questionPart.startsWith('&')) {
            groupIds.push(id);
            text += `<span class="user">${id}</span>`
        } else {
            text += questionPart;
        }
    }
    return {
        text,
        userIds,
        channelIds,
        groupIds
    };
}

export const getQuestionBlocks = (poll: Poll) => {
    if (!poll.question.includes('<<') || !poll.question.includes('>>')) {
        return questionText(poll);
    }

    let questionParts = poll.question.split(new RegExp('(?:<<|>>)'))
    const blocks = [];

    for (let questionPart of questionParts) {
        let id = questionPart.trim().substring(1, questionPart.length);
        if (questionPart.startsWith('@')) {
            blocks.push({
                "type": "user",
                "user_id": id
            })
        } else if (questionPart.startsWith('#')) {
            blocks.push({
                "type": "channel",
                "channel_id": id
            })
        } else if (questionPart.startsWith('&')) {
            blocks.push({
                "type": "usergroup",
                "usergroup_id": id
            })
        } else {
            blocks.push({
                type: "text",
                text: questionPart,
                style: {
                    bold: true
                }
            })
        }
    }

    logger.info('blocks : ', blocks);

    logger.info('question parts : ', questionParts);

    // return questionText(poll);
    return {
        type: "rich_text_section",
        elements: blocks as any[]
    };
}

const questionText = (poll: Poll) => {
    return {
        type: "rich_text_section",
        elements: [
            {
                type: "text",
                text: poll.question,
                style: {
                    bold: true
                }
            }
        ] as any[]
    };
}

export const trimToLength = (text: string, maxLength: number) => {
    return text.length >= maxLength ? text.substring(0, 74) : text;
}

export const trimLeadingOrTrailingCharacter = (text: string, character: string) => {
    if (text.startsWith(character)) {
        text = text.substring(1, text.length - 1);
    }
    if (text.endsWith(character)) {
        text = text.substring(0, text.length - 2);
    }

    return text;
}

export const formatDate = (date: Date, timezoneId?: string) => {
    if (timezoneId) {
        return date.toLocaleString('en-gb', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            timeZone: timezoneId,
        }) + ` ${timezoneId}`;
    } else {
        return date.toLocaleString();
    }
}

export const getPollClosedMessage = (poll: Poll, channelType: string) => {
    const showChannelMention = channelType === 'PUBLIC' || channelType === 'PRIVATE';
    const blocks: MainBlock[] = [
        {
            type: 'rich_text',
            elements: [
                {
                    type: 'rich_text_section',
                    elements: [
                        {type: 'text', text: 'Your '},
                        {
                            type: 'link',
                            url: `${PUMBLE_FRONTEND_URL}/workspace/${poll.workspaceId}/${poll.targetChannelId}/?message=${poll.messageId}`,
                            text: 'poll'
                        },
                        ...(showChannelMention ? [{type: 'text', text: ' in '}, {
                                    type: 'channel',
                                    channel_id: poll.targetChannelId
                                } as any, {type: 'text', text: ' has been closed. '}]
                                : [{type: 'text', text: ' has been closed. '}]
                        )
                    ],
                },
            ],
        },
    ];
    return {text: '', blocks};
}

export const getAuthorizationText = () => {
    // let fullText = `Hi there, with the Poll addon you can create questionnaires directly from Pumble.
    // \nTo proceed please authorize the Poll app on the Configure Apps page.
    // \n Click the Add Apps button at the bottom of the left sidebar to open it. `;
    // const blocks: MainBlock[] = [
    //     {
    //         type: 'rich_text',
    //         elements: [
    //             {
    //                 type: 'rich_text_section',
    //                 elements: [
    //                     {type: 'text', text: 'Hi there '},
    //                     {type: 'emoji', name: 'wave'},
    //                     {type: 'text', text: '\nWith '},
    //                     {type: 'text', text: 'Poll', style: {bold: true}},
    //                     {type: 'text', text: ' addon you can create questionnaires directly from Pumble.'},
    //                     {type: 'text', text: '\nTo proceed please authorize the ',},
    //                     {type: 'text', text: 'Poll', style: {bold: true}},
    //                     {type: 'text', text: ' app on the ',},
    //                     {type: 'text', text: 'Configure Apps', style: {bold: true}},
    //                     {type: 'text', text: ' page. Click the '},
    //                     {type: 'text', text: "'Add Apps'", style: {bold: true}},
    //                     {type: 'text', text: ' button at the bottom of the left sidebar to open it.'},
    //                     {type: 'text', text: '\nFor more details visit '},
    //                     {type: 'link', url: 'https://pumble.com/help/poll'},
    //                 ],
    //             },
    //         ],
    //     },
    // ];
    return {
        text: 'In order to use /polls please authorize the Polls app on the Configure Apps page. Click the \'Add Apps\' button at the bottom of the left sidebar to open it.',
        blocks: []
    };
}

export const getHelpMessage = () => {
    const text = `Use Create poll shortcut to create a new questionnaire

For more details visit https://pumble.com/help/integrations/communication-collaboration-tools/polls-integration/
`;

    const blocks: MainBlock[] = [
        {
            type: 'rich_text',
            elements: [
                {
                    type: 'rich_text_section',
                    elements: [
                        {type: 'text', text: 'Use '},
                        {type: 'text', text: 'Create poll', style: {code: true}},
                        {type: 'text', text: ' shortcut to create a new questionnaire\n'},
                        {type: 'text', text: '\nFor more details visit '},
                        {
                            type: 'link',
                            url: 'https://pumble.com/help/integrations/communication-collaboration-tools/polls-integration/'
                        },
                    ],
                },
            ],
        },
    ];
    return {text: text, blocks};
}

export const value = (obj: any): string | undefined => {
    if (!!obj && 'value' in obj) {
        return obj.value;
    }
}