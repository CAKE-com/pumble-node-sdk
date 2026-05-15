import {Poll} from "../domain/Poll";
import {ApiClient, V1} from "pumble-sdk";
import {
    CUSTOM,
    PREDEFINED_ANSWERS_MODAL,
    PredefinedPollAnswer
} from "../domain/PredefinedPollAnswer";
import {pumbleCredentialsRepositoryMongo} from "../persistence/PumbleCredentialsRepositoryMongo";
import {getQuestionBlocks, trimToLength, value} from "./utils";
import SendMessagePayload = V1.SendMessagePayload;
import Option = V1.Option;
import BlockButton = V1.BlockButton;
import MainBlock = V1.MainBlock;
import BlockInput = V1.BlockInput;
import State = V1.State;
import BlockActions = V1.BlockActions;
import BlockBasic = V1.BlockBasic;
import {APP_DOMAIN} from "../config";
import {encrypt} from "./EncryptionService";
import {simpleExpiringSet} from "./SimpleExpiringSet";
import {ADD_OPTION_BUTTON, DEFAULT_BLOCK_ANSWERS, REMOVE_OPTION_BUTTON} from "../domain/PollBlocks";
import {BlockInteractionContext} from "pumble-sdk/lib/core/types/contexts";
import WorkspaceUser = V1.WorkspaceUser;

export async function renderPoll(poll: Poll) {
    const pollIsClosed = poll.closed;
    const botUserId = await pumbleCredentialsRepositoryMongo.getBotUserId(poll.workspaceId);

    let questionElement = getQuestionBlocks(poll);

    if (poll.isMultiVote) {
        questionElement.elements.push(
            {
                type: "text",
                text: "\nYou may vote for multiple options\n",
            });
    }

    let answerElements: any[] = [];
    let answerButtonElements: any[] = [];

    let maxAnswerLength = 50;

    try {
        maxAnswerLength = poll.answers[0].length;
        poll.answers.forEach(answer => {
            if (answer.length > maxAnswerLength) {
                maxAnswerLength = answer.length;
            }
        });
    } catch (e) {
    }

    if (maxAnswerLength > 75) {
        maxAnswerLength = 75;
    }

    const answerToCountMap = new Map<string, number>;
    poll.answers.forEach(answer => {
        answerToCountMap.set(answer, 0);
    })

    poll.voters.forEach(voter => {
        voter.selections.forEach(selection => {
            let count = answerToCountMap.get(selection)!;
            count = count + 1;
            answerToCountMap.set(selection, count);

        })
    })

    const addOptionBtn: BlockButton = {
        type: "button",
        style: "secondary",
        text: { type: "plain_text", text: "Add option"},
        onAction: "poll_add_answer_btn"
    }

    answerToCountMap.forEach((count, answer: string) => {
            let votesCountText;
            if (count == 1) {
                votesCountText = "   1 vote";
            } else if (count > 1) {
                votesCountText = `   ${count} votes`;
            } else {
                votesCountText = "   0 votes";
            }


            let text = answer.length == maxAnswerLength ? answer : `${answer}`.padEnd(maxAnswerLength, " ");

            let elements: any[] = [
                {
                    type: "text",
                    text: `${text} `,
                    style: {
                        code: true
                    }
                },
                {
                    type: "text",
                    text: votesCountText
                }
            ];

            answerElements.push({
                type: "rich_text_section",
                elements
            });

            if (!pollIsClosed) {
                answerButtonElements.push({
                    type: "button",
                    onAction: "poll_button",
                    value: answer,
                    text: {
                        text: answer.slice(0, 75),
                        type: "plain_text",
                    }
                });
            }
        }
    )

    if (poll.newAnswerAllowed && poll.answers.length < 10 && !pollIsClosed) {
        answerButtonElements.push(addOptionBtn);
    }

    const pollResultsBtn: BlockButton = {
        type: "button",
        style: "secondary",
        text: {type: "plain_text", text: "View all"},
        onAction: "poll_results_btn"
    }

    const buttons = [];
    if (!poll.isAnonymous) {
        buttons.push(pollResultsBtn);
    }

    let buttonsBlocks: MainBlock = {
        type: "actions",
        elements: buttons
    }

    let messagePayload: SendMessagePayload = {
        text: "",
        blocks: [
            {
                type: "rich_text",
                elements: [
                    questionElement,
                    ...answerElements,
                ]
            },
            buttonsBlocks.elements.length > 0 ? buttonsBlocks : undefined,
            answerButtonElements.length > 0 ? {
                type: "actions",
                elements: [
                    ...answerButtonElements
                ]
            } : undefined,
            {
                type: "rich_text",
                elements: [
                    {
                        type: "rich_text_section",
                        elements: [
                            {
                                type: "text",
                                text: poll.sentAsUser ? "Using " : "By ",

                            },
                            ...(poll.sentAsUser ? [{
                                "type": "user",
                                "user_id": botUserId!
                            }] : [{"type": "user", "user_id": poll.userId}]),
                            {
                                "type": "text",
                                "text": " | "
                            },
                            {
                                "type": "text",
                                "text": poll.isAnonymous ? "Anonymous " : "Non-Anonymous "
                            },
                            {
                                "type": "text",
                                "text": " | "
                            },
                            {
                                type: "text",
                                text: `${pollIsClosed ? "Closed" : "Closes"} on ${poll.endsAtString}`,

                            },
                        ]
                    }
                ]
            },
        ].filter(b => !!b) as MainBlock[]
    };

    return messagePayload;
}

export async function renderModalPollSettings(userClient: ApiClient, currentChannelId: string, initialState?: State) {

    const channels = await userClient!.v1.channels.listChannels();
    const currentChannel = channels.filter(ch => ch.channel.id === currentChannelId)[0];
    const showChannelSelector = currentChannel.channel.channelType === "PUBLIC" || currentChannel.channel.channelType === "PRIVATE";

    const defaultSelectedChannelValue = currentChannelId;
    const defaultSelectedChannelName = trimToLength(currentChannel.channel.name!, 75);

    let elements: BlockInput[] = [];

    elements.push({
        type: "input",
        blockId: "input_setting_selector",
        label: {type: "plain_text", text: "Vote type"},
        element: {
            type: "static_select_menu",
            onAction: "setting_selector",
            autofocused: true,
            placeholder: {
                type: "plain_text",
                text: "Vote type"
            },
            options: [
                {
                    text: {
                        type: "plain_text",
                        text: "Multiple Votes"
                    },
                    value: `voteType-multi`
                },
                {
                    text: {
                        type: "plain_text",
                        text: "Single Vote"
                    },
                    value: `voteType-single`
                },
            ]
        }
    });
    elements.push({
            type: "input",
            blockId: "input_visibility_selector",
            label: {type: "plain_text", text: "Response type"},
            element: {
                type: "static_select_menu",
                onAction: "visibility_selector",
                placeholder: {
                    type: "plain_text",
                    text: "Response type"
                },
                options: [
                    {
                        text: {
                            type: "plain_text",
                            text: "Anonymous"
                        },
                        value: `responseType-anonymous`
                    },
                    {
                        text: {
                            type: "plain_text",
                            text: "Non Anonymous"
                        },
                        value: `responseType-nonAnonymous`
                    },
                ],
            }
        },
        {
            type: "input",
            blockId: "input_allowed_new_answer_selector",
            label: {type: "plain_text", text: "Allow users to add options"},
            element: {
                type: "static_select_menu",
                onAction: "allowed_new_answer_selector",
                placeholder: {
                    type: "plain_text",
                    text: "Allow users to add options"
                },
                options: [
                    {
                        text: {
                            type: "plain_text",
                            text: "Allow"
                        },
                        value: `newAnswer-allow`
                    },
                    {
                        text: {
                            type: "plain_text",
                            text: "Don't allow"
                        },
                        value: `newAnswer-dontAllow`
                    },
                ],
            }
        },
        {
            type: "input",
            blockId: "input_duration_selector",
            label: {type: "plain_text", text: "Close in"},
            element: {
                type: "static_select_menu",
                onAction: "duration_selector",
                placeholder: {
                    type: "plain_text",
                    text: "Close in"
                },
                options: [
                    {
                        text: {
                            type: "plain_text",
                            text: "30m"
                        },
                        value: `0.5h`
                    },
                    {
                        text: {
                            type: "plain_text",
                            text: "1h"
                        },
                        value: `1h`
                    },
                    {
                        text: {
                            type: "plain_text",
                            text: "3h"
                        },
                        value: `3h`
                    },
                    {
                        text: {
                            type: "plain_text",
                            text: "6h"
                        },
                        value: `6h`
                    },
                    {
                        text: {
                            type: "plain_text",
                            text: "1d"
                        },
                        value: `24h`
                    },
                    {
                        text: {
                            type: "plain_text",
                            text: "3d"
                        },
                        value: `72h`
                    },
                    {
                        text: {
                            type: "plain_text",
                            text: "7d"
                        },
                        value: `168h`
                    },
                    {
                        text: {
                            type: "plain_text",
                            text: "30d"
                        },
                        value: `720h`
                    },
                ]
            }
        });

    if (showChannelSelector) {
        elements.push({
            type: "input",
            blockId: "input_channel_selector",
            label: {type: "plain_text", text: "Send in channel"},
            element: {
                type: "dynamic_select_menu",
                onAction: "channel_selector",
                placeholder: {
                    type: "plain_text",
                    text: "Send in channel"
                },
                initial_option: {
                    text: {
                        type: "plain_text",
                        text: `${defaultSelectedChannelName}`
                    },
                    value: `${defaultSelectedChannelValue}`
                }
            }
        });
    }

    return {
        state: initialState ?? {
            values: {
                input_default_channel_selector: {
                    default_channel_selector: {
                        type: "static_select_menu",
                        value: `${defaultSelectedChannelValue}`
                    }
                },
                input_channel_selector: {
                    channel_selector: {
                        type: "dynamic_select_menu",
                        value: `${defaultSelectedChannelValue}`,
                    }
                },
                input_duration_selector: {
                    duration_selector: {
                        type: "static_select_menu",
                        value: "1h",
                    }
                },
                input_visibility_selector: {
                    visibility_selector: {
                        type: "static_select_menu",
                        value: "responseType-nonAnonymous",
                    }
                },
                input_setting_selector: {
                    setting_selector: {
                        type: "static_select_menu",
                        value: "voteType-single",
                    }
                },
                input_allowed_new_answer_selector: {
                    allowed_new_answer_selector: {
                        type: "static_select_menu",
                        value: "newAnswer-dontAllow"
                    }
                }
            }
        } as State, blocks: [
            {
                type: "rich_text",
                elements: [
                    {
                        type: "rich_text_section",
                        elements: [
                            {
                                type: "text",
                                text: "Please configure the settings for your poll",
                                style: {
                                    bold: true
                                }
                            }
                        ]
                    }
                ]
            },
            ...elements
        ] as MainBlock[]
    };
}

export async function renderModalPollOptions(state?: State) {
    const selectedAnswersSet = value(state?.values?.input_options_selector?.options_selector);
    let predefinedOption = PREDEFINED_ANSWERS_MODAL.find(pa => pa.id === selectedAnswersSet) ?? CUSTOM;

    let options: Option[] = PREDEFINED_ANSWERS_MODAL.map((answer: PredefinedPollAnswer) => {
        return {
            text: {
                type: "plain_text",
                text: answer.text
            },
            value: answer.id
        } as Option
    });
    const answers = generateAnswers(predefinedOption, state);
    return {
        state: {
            values: {
                ...state?.values,
                input_options_selector: {
                    options_selector: {
                        type: "static_select_menu",
                        value: predefinedOption.id
                    }
                }
            }
        } as State, blocks: [
            {
                type: "input",
                blockId: "input_question_selector",
                label: {type: "plain_text", text: "Question or topic"},
                element: {
                    type: "plain_text_input",
                    onAction: "question_selector",
                    placeholder: {
                        type: "plain_text",
                        text: "Which day works best for the weekly meeting?"
                    },
                    max_length: 300
                }
            },
            {
                type: "input",
                blockId: "input_options_selector",
                label: {type: "plain_text", text: "Predefined answers"},
                dispatchAction: true,
                element: {
                    type: "static_select_menu",
                    onAction: "options_selector",
                    placeholder: {
                        type: "plain_text",
                        text: "Predefined answers"
                    },
                    options: options
                }
            },
            ...answers,
            optionButtons(answers.length)
        ] as MainBlock[]
    };
}

export function generateAnswers(predefinedPollAnswer?: PredefinedPollAnswer, state?: State): MainBlock[] {
    if (state && state?.values["input_answer_0"]) {
        const answers: string[] = [];
        for (const key in state?.values) {
            if (key.startsWith("input_answer")) {
                const answer = value(state?.values[key][key]) ?? '';
                answers.push(answer);
            }
        }
        if (answers.length < 2) {
            answers.push('');
        }
        return answers.map((answer, index) => {
            return {
                type: "input",
                blockId: `input_answer_${index}`,
                label: {type: "plain_text", text: `Option ${index + 1}`},
                element: {
                    type: "plain_text_input",
                    onAction: `input_answer_${index}`,
                    initial_value: answer,
                    max_length: 75,
                    min_length: 1
                },
                optional: index > 1
            } as BlockInput
        });
    }
    if (!predefinedPollAnswer || predefinedPollAnswer == CUSTOM) {
        return DEFAULT_BLOCK_ANSWERS;
    }
    return predefinedPollAnswer.answers.map((answer, index) => {
        return {
            type: "input",
            blockId: `input_answer_${index}`,
            label: {type: "plain_text", text: `Option ${index + 1}`},
            element: {
                type: "plain_text_input",
                onAction: `input_answer_${index}`,
                initial_value: answer,
                max_length: 75,
                min_length: 1
            },
            optional: index > 1
        } as BlockInput
    })
}

export function generateEmptyOption(index: number) {
    return {
        type: "input",
        blockId: `input_answer_${index}`,
        label: {type: "plain_text", text: `Option ${index + 1}`},
        element: {
            type: "plain_text_input",
            onAction: `input_answer_${index}`,
            placeholder: {text: `Option ${index + 1}`, type: "plain_text"},
            max_length: 75,
            min_length: 1
        },
        optional: true
    } as BlockInput
}

export function optionButtons(answersCount: number) {
    const elements = answersCount >= 10 ?
        [REMOVE_OPTION_BUTTON] : answersCount > 2 ?
            [ADD_OPTION_BUTTON, REMOVE_OPTION_BUTTON] : [ADD_OPTION_BUTTON];
    return {
        type: "actions",
        elements
    } as BlockActions;
}

export async function renderResultsModal(ctx: BlockInteractionContext<"MESSAGE">, poll: Poll): Promise<MainBlock[]> {
    let votesMap: { [key: string]: string[] } = {};
    poll.answers.forEach(a => votesMap[a] = []);
    const botClient = await ctx.getBotClient();
    const users = await botClient!.v1.users.listWorkspaceUsers();
    const userMap = new Map<string, WorkspaceUser>();
    for (let user of users) {
        userMap.set(user.id, user);
    }

    if (poll.voters) {
        poll.voters.sort((a, b) => (userMap.get(a.userId)?.name ?? "").localeCompare(userMap.get(b.userId)?.name ?? ""));
        poll.voters.forEach(voter => voter.selections.forEach(selection => votesMap[selection] ? votesMap[selection].push(voter.userId) : (votesMap[selection] = [])));
    }

    const keys = Object.keys(votesMap);
    keys.sort((keyA, keyB) => {
        const lengthA = votesMap[keyA].length;
        const lengthB = votesMap[keyB].length;
        return lengthB - lengthA;
    });
    const mostVotes = keys[0];
    const multipleTopVotes = votesMap[keys[0]].length === votesMap[keys[1]].length;
    const blocks: MainBlock[] = [
        {
            type: "rich_text",
            elements: [
                {
                    type: "rich_text_section", elements: [
                        {
                            type: "text",
                            text: `${poll.question}`,
                            style: {bold: true}
                        }
                    ]
                }
            ]
        },
        { type: 'divider'}
    ];

    for (const answer of poll.answers) {
        blocks.push({
            type: 'rich_text',
            elements: [
                {
                    type: 'rich_text_section',
                    elements: [
                        {type: "emoji", name: answer === mostVotes && !multipleTopVotes && votesMap[answer].length > 0 ? "star" : "white_small_square"},
                        {type: "text", style: {bold: true}, text: ` ${answer} (${votesMap[answer].length})`},
                        {type: "text", text: `${votesMap[answer].length > 0 ? '\n' : ''}`},
                        ...votesMap[answer].map(userId => {
                            return [{
                                type: "user",
                                user_id: userId
                            }, {type: "text", text: " "}]
                        }).flat()
                    ] as BlockBasic[]
                }
            ]
        });
        blocks.push({ type: 'divider' });
    }

    blocks.push({
        type: "rich_text",
        elements: [{
            type: "rich_text_section",
            elements: [
                {type: "text", text: `${poll.closed ? "Closed" : "Closes"} on ${poll.endsAtString}, by `},
                {type: "user", user_id: poll.userId}
            ]
        }]
    });
    blocks.push({
        type: "actions",
        elements: [{
            type: "button",
            text: {type: "plain_text", text: "Open on page :arrow_upper_right:", emoji: true},
            style: "secondary",
            url: `${APP_DOMAIN}/results/${encrypt(poll.pollId!)}?token=${simpleExpiringSet.generateRandomElement()}`
        }]
    });
    return blocks;
}

export async function renderAddAnswerModal(): Promise<MainBlock[]> {
    return [
        {
            type: "input",
            blockId: "modal_add_answer",
            label: {text: "New option", type: "plain_text"},
            element: {
                type: "plain_text_input",
                placeholder: {text: "Your option", type: "plain_text"},
                onAction: "input_add_answer_block",
                max_length: 75,
                autofocused: true
            },
            optional: false
        },
        {
            type: "input",
            blockId: "modal_vote_for_new_answer",
            label: {type: "plain_text", text: "Vote for this option"},
            element: {
                type: "static_select_menu",
                onAction: "vote_selector",
                placeholder: {
                    type: "plain_text",
                    text: "Vote/Don't vote"
                },
                initial_option: {
                    text: {
                        type: "plain_text",
                        text: "Don't vote"
                    },
                    value: `voteForNewAnswer-dontVote`
                },
                options: [
                    {
                        text: {
                            type: "plain_text",
                            text: "Vote"
                        },
                        value: `voteForNewAnswer-vote`
                    },
                    {
                        text: {
                            type: "plain_text",
                            text: "Don't vote"
                        },
                        value: `voteForNewAnswer-dontVote`
                    },
                ]
            }
        }
    ]
}

export async function createChannelOptions(userClient: ApiClient, payloadQuery?: string) {
    const channels = await userClient.v1.channels.listChannels();
    const channelOptions: Option[] = [];
    channels.filter(channelInfo => {
        return (channelInfo.channel.channelType === "PUBLIC" || channelInfo.channel.channelType === "PRIVATE")
            && !channelInfo.channel.isArchived
            && !channelInfo.channel.isAddonBot
            && !channelInfo.channel.isPumbleBot
            && channelInfo.channel.isMember
    })
        .slice(0, 99)
        .forEach(channelInfo => {
            let name = channelInfo.channel.name;
            if (!name) {
                return;
            }
            channelOptions.push({
                text: {
                    type: "plain_text",
                    text: `${trimToLength(name, 75)}`
                },
                value: channelInfo.channel.id
            } as Option);
        });

    return channelOptions.filter(op => !payloadQuery || op.text.text.toLowerCase().includes(payloadQuery.toLowerCase()));
    
}