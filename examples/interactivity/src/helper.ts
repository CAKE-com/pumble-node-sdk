import {BlockInteractionContext, GlobalShortcutContext, SlashCommandContext} from "pumble-sdk/lib/core/types/contexts";
import {V1} from "pumble-sdk";
import MainBlock = V1.MainBlock;
import BlockButton = V1.BlockButton;

export async function sendMessageWithButtons(ctx: SlashCommandContext) {
    const buttonNames = ['bttn_1', 'bttn_2'];
    const client = await ctx.getBotClient();
    let blocks: MainBlock[] = [
        {
            type: "actions",
            elements: buttonNames.map(btnName => {
                return {
                    type: "button",
                    onAction: btnName + "_action",
                    value: "no metadata",
                    text: {
                        text: btnName,
                        type: "plain_text"
                    },
                    style: "primary"
                } as BlockButton
            })
        }
    ];

    await client?.v1.messages.postMessageToChannel(ctx.payload.channelId, {
        text: "",
        blocks: blocks
    });
}

export async function sendMessageWithSelectMenu(ctx: SlashCommandContext) {
    const client = await ctx.getBotClient();
    let blocks: MainBlock[] = [
        {
            type: "actions",
            elements: [
                {
                    type: "static_select_menu",
                    onAction: "static_select_menu_action",
                    placeholder: {
                        type: "plain_text",
                        text: "Test placeholder"
                    },
                    options: [
                        {
                            text: {
                                type: "plain_text",
                                text: "Option 1"
                            },
                            value: "Option 1"
                        },
                        {
                            text: {
                                type: "plain_text",
                                text: "Option 2"
                            },
                            value: "Option 2"
                        },
                        {
                            text: {
                                type: "plain_text",
                                text: "Option 3"
                            },
                            value: "Option 3"
                        },
                        {
                            text: {
                                type: "plain_text",
                                text: "Option 4"
                            },
                            value: "Option 4"
                        }
                    ],
                }]
        }
    ];

    await client?.v1.messages.postMessageToChannel(ctx.payload.channelId, {
        text: "",
        blocks: blocks
    });
}

export async function sendMessageWithDynamicSelectMenu(ctx: SlashCommandContext) {
    const client = await ctx.getBotClient();
    await client?.v1.messages.postMessageToChannel(ctx.payload.channelId, {
        text: "",
        blocks: [
            {
                type: "rich_text",
                elements: [
                    {
                        type: "rich_text_section",
                        elements: [
                            {
                                type: "text",
                                text: "This is dynamic menu"
                            }
                        ]
                    }
                ]
            },
            {
                type: "actions",
                elements: [
                    {
                        type: "dynamic_select_menu",
                        onAction: "dynamic_select_menu_action",
                        placeholder: {
                            type: "plain_text",
                            text: "Dynamic selector"
                        },
                    }]
            }
        ]
    });
}


export async function sendAttachmentMessage(ctx: SlashCommandContext) {
    const client = await ctx.getBotClient();

    await client?.v1.messages.postMessageToChannel(ctx.payload.channelId, {
        text: "",
        blocks: [
            {
                type: "rich_text",
                elements: [
                    {
                        type: "rich_text_section",
                        elements: [
                            {
                                type: "text",
                                text: "This is attachment message with additional button."
                            }
                        ]
                    }
                ]
            }
        ],
        attachments: [
            {
                blocks: [
                    {
                        type: "rich_text",
                        elements: [
                            {
                                type: "rich_text_section",
                                elements: [
                                    {
                                        type: "text",
                                        text: "Attachment containing button that opens Youtube"
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        type: "actions",
                        elements: [
                            {
                                type: "button",
                                value: `test metadata`,
                                text: {
                                    text: 'Open Youtube',
                                    type: "plain_text"
                                },
                                url: "https://www.youtube.com",
                                style: "secondary"
                            }
                        ]
                    }
                ]
            }
        ]
    });
}

export async function openModalOnGlobalShortcut(ctx: GlobalShortcutContext): Promise<void> {
    await ctx.spawnModalView({
        callbackId: "modal_callback_id_1",
        type: "MODAL",
        title: {
            type: "plain_text",
            text: "Title"
        },
        submit: {
            type: "plain_text",
            text: "Submit"
        },
        close: {
            type: "plain_text",
            text: "Close"
        },
        notifyOnClose: true,
        state: { // state can be predefined in order to set initial values of input fields
            values: {
                input_static_1: { // input block id
                    static_select_menu_input_action: { // onAction
                        type: 'static_select_menu', // type
                        value: '2' // value that belongs to option that needs to be preselected
                    }
                }
            }
        },
        blocks: [
            {
                type: "rich_text",
                elements: [
                    {
                        type: "rich_text_section",
                        elements: [
                            {
                                type: "text",
                                text: "Modal text"
                            }
                        ]
                    }
                ]
            },
            {
                type: "input",
                blockId: "input_static_1",
                label: {
                    text: "Input with preselected value",
                    type: "plain_text"
                },
                element: {
                    type: "static_select_menu",
                    placeholder: {text: "text", type: "plain_text"},
                    onAction: "static_select_menu_input_action",
                    options: [
                        {text: {type: "plain_text", text: "Option 1"}, value: "1"},
                        {text: {type: "plain_text", text: "Option 2"}, value: "2"} // value that's preselected in modal state
                    ]
                },
                dispatchAction: true
            },
            {
                type: "actions",
                elements: [
                    {
                        type: "static_select_menu",
                        onAction: "second_select_menu_modal",
                        placeholder: {
                            type: "plain_text",
                            text: "Test placeholder"
                        },
                        options: [
                            {
                                text: {
                                    type: "plain_text",
                                    text: "Option 1"
                                },
                                value: "Option 1"
                            },
                            {
                                text: {
                                    type: "plain_text",
                                    text: "Option 2"
                                },
                                value: "Option 2"
                            },
                            {
                                text: {
                                    type: "plain_text",
                                    text: "Option 3"
                                },
                                value: "Option 3"
                            },
                            {
                                text: {
                                    type: "plain_text",
                                    text: "Option 4"
                                },
                                value: "Option 4"
                            }
                        ]
                    },
                    {
                        type: "button",
                        onAction: "info_btn_action",
                        value: `test metadata`,
                        text: {
                            text: 'Read info',
                            type: "plain_text"
                        },
                        style: "danger",
                    }
                ]
            }
        ]
    });
}

export async function updateModal(ctx: BlockInteractionContext<"VIEW">): Promise<void> {
    if (ctx.payload.view) {
        const updatedModal: V1.View<"MODAL" | "HOME"> = {
            ...ctx.payload.view, blocks: [...ctx.payload.view.blocks, {
                type: "input",
                blockId: "input_text_field_1",
                label: {
                    type: "plain_text",
                    text: "Plain text"
                },
                dispatchAction: true, // needs to be enabled in order to dispatch action for interaction_triggers: ["on_input"]
                optional: true,
                element: {
                    type: "plain_text_input",
                    onAction: "input_text_1",
                    placeholder: {
                        type: "plain_text",
                        text: "Type something"
                    },
                    // on each button press an interaction will be triggered that's handled on input_text_1 blockInteraction
                    interaction_triggers: ["on_input"]
                },
            }]
        };
        await ctx.updateView(updatedModal);
    }
}

export async function openInfoModal(ctx: BlockInteractionContext<"VIEW">): Promise<void> {
    await ctx.pushModalView({
        parentViewId: ctx.payload.sourceId,
        callbackId: "",
        type: "MODAL",
        title: {
            type: "plain_text",
            text: "Title"
        },
        close: {
            type: "plain_text",
            text: "Close"
        },
        notifyOnClose: false,
        blocks: [
            {
                type: "rich_text",
                elements: [
                    {
                        type: "rich_text_section",
                        elements: [
                            {
                                type: "text",
                                text: "This is an info modal opened over another modal"
                            }
                        ]
                    }
                ]
            }
        ]
    });
}

export function createBasicHomeView(): V1.PublishHomeViewRequest {
    return {
        callbackId: "",
        title: {
            type: "plain_text",
            text: "Super cool title"
        },
        blocks: [
            {
                type: "rich_text",
                elements: [
                    {
                        type: "rich_text_section",
                        elements: [
                            {
                                type: "text",
                                text: "This is your home view :) Addon can put anything here (for any user in workspace)"
                            }
                        ]
                    }
                ]
            }
        ]
    }
}