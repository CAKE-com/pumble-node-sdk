// DO NOT CHANGE THIS MANUALLY
// this is part of the PumbleAPI schema (BlocksArray subschema) so it should be compatible with it or exactly the same
export const mainBlocks = {
    type: 'array',
    items: {
        type: 'object',
        oneOf: [
            {
                title: 'RichText',
                required: ['elements', 'type'],
                type: 'object',
                properties: {
                    type: { type: 'string', description: 'Rich Text block', enum: ['rich_text'] },
                    elements: {
                        type: 'array',
                        items: {
                            title: 'RichTextElement',
                            type: 'object',
                            properties: {
                                type: {
                                    type: 'string',
                                    description: 'Rich Text elements',
                                    enum: [
                                        'rich_text_section',
                                        'rich_text_preformatted',
                                        'rich_text_list',
                                        'rich_text_quote',
                                    ],
                                },
                            },
                            anyOf: [
                                {
                                    required: ['elements', 'type'],
                                    type: 'object',
                                    properties: {
                                        type: { type: 'string', enum: ['rich_text_section'] },
                                        elements: {
                                            type: 'array',
                                            items: {
                                                type: 'object',
                                                properties: {
                                                    type: {
                                                        type: 'string',
                                                        description: 'Rich text section',
                                                        enum: [
                                                            'link',
                                                            'emoji',
                                                            'text',
                                                            'broadcast',
                                                            'channel',
                                                            'user',
                                                            'usergroup',
                                                        ],
                                                    },
                                                },
                                                anyOf: [
                                                    {
                                                        required: ['type', 'url'],
                                                        type: 'object',
                                                        properties: {
                                                            type: { type: 'string', enum: ['link'] },
                                                            url: { type: 'string', description: 'Link url' },
                                                            text: { type: 'string' },
                                                        },
                                                    },
                                                    {
                                                        required: ['name', 'type'],
                                                        type: 'object',
                                                        properties: {
                                                            type: { type: 'string', enum: ['emoji'] },
                                                            format: {
                                                                type: 'object',
                                                                properties: {
                                                                    inline: {
                                                                        type: 'boolean',
                                                                        description: 'Is text inline',
                                                                    },
                                                                    bold: {
                                                                        type: 'boolean',
                                                                        description: 'Is text bold',
                                                                    },
                                                                    strike: {
                                                                        type: 'boolean',
                                                                        description: 'Is text crossed',
                                                                    },
                                                                    italic: {
                                                                        type: 'boolean',
                                                                        description: 'Is text italic',
                                                                    },
                                                                },
                                                                description: 'Link format',
                                                            },
                                                            name: { type: 'string', description: 'Emoji name' },
                                                        },
                                                    },
                                                    {
                                                        required: ['text', 'type'],
                                                        type: 'object',
                                                        properties: {
                                                            type: { type: 'string', enum: ['text'] },
                                                            format: {
                                                                type: 'object',
                                                                properties: {
                                                                    inline: {
                                                                        type: 'boolean',
                                                                        description: 'Is text inline',
                                                                    },
                                                                    bold: {
                                                                        type: 'boolean',
                                                                        description: 'Is text bold',
                                                                    },
                                                                    strike: {
                                                                        type: 'boolean',
                                                                        description: 'Is text crossed',
                                                                    },
                                                                    italic: {
                                                                        type: 'boolean',
                                                                        description: 'Is text italic',
                                                                    },
                                                                },
                                                                description: 'Text format',
                                                            },
                                                            text: { type: 'string', description: 'Text' },
                                                        },
                                                    },
                                                    {
                                                        required: ['type', 'user_id'],
                                                        type: 'object',
                                                        properties: {
                                                            type: { type: 'string', enum: ['user'] },
                                                            user_id: { type: 'string', description: 'User ID' },
                                                        },
                                                    },
                                                    {
                                                        required: ['channel_id', 'type'],
                                                        type: 'object',
                                                        properties: {
                                                            type: { type: 'string', enum: ['channel'] },
                                                            channel_id: { type: 'string', description: 'Channel ID' },
                                                        },
                                                    },
                                                    {
                                                        required: ['type', 'usergroup_id'],
                                                        type: 'object',
                                                        properties: {
                                                            type: { type: 'string', enum: ['usergroup'] },
                                                            usergroup_id: {
                                                                type: 'string',
                                                                description: 'User Group ID',
                                                            },
                                                        },
                                                    },
                                                    {
                                                        required: ['range', 'type'],
                                                        type: 'object',
                                                        properties: {
                                                            type: { type: 'string', enum: ['broadcast'] },
                                                            range: {
                                                                type: 'string',
                                                                description: 'Broadcast range',
                                                                enum: ['here', 'channel'],
                                                            },
                                                        },
                                                    },
                                                ],
                                            },
                                        },
                                    },
                                },
                                {
                                    required: ['elements', 'type'],
                                    type: 'object',
                                    properties: {
                                        type: { type: 'string', enum: ['rich_text_quote'] },
                                        elements: {
                                            type: 'array',
                                            items: {
                                                type: 'object',
                                                properties: {
                                                    type: {
                                                        type: 'string',
                                                        description: 'Rich text section',
                                                        enum: [
                                                            'link',
                                                            'emoji',
                                                            'text',
                                                            'broadcast',
                                                            'channel',
                                                            'user',
                                                            'usergroup',
                                                        ],
                                                    },
                                                },
                                                anyOf: [
                                                    {
                                                        required: ['type', 'url'],
                                                        type: 'object',
                                                        properties: {
                                                            type: { type: 'string', enum: ['link'] },
                                                            url: { type: 'string', description: 'Link url' },
                                                            text: { type: 'string' },
                                                        },
                                                    },
                                                    {
                                                        required: ['name', 'type'],
                                                        type: 'object',
                                                        properties: {
                                                            type: { type: 'string', enum: ['emoji'] },
                                                            format: {
                                                                type: 'object',
                                                                properties: {
                                                                    inline: {
                                                                        type: 'boolean',
                                                                        description: 'Is text inline',
                                                                    },
                                                                    bold: {
                                                                        type: 'boolean',
                                                                        description: 'Is text bold',
                                                                    },
                                                                    strike: {
                                                                        type: 'boolean',
                                                                        description: 'Is text crossed',
                                                                    },
                                                                    italic: {
                                                                        type: 'boolean',
                                                                        description: 'Is text italic',
                                                                    },
                                                                },
                                                                description: 'Link format',
                                                            },
                                                            name: { type: 'string', description: 'Emoji name' },
                                                        },
                                                    },
                                                    {
                                                        required: ['text', 'type'],
                                                        type: 'object',
                                                        properties: {
                                                            type: { type: 'string', enum: ['text'] },
                                                            format: {
                                                                type: 'object',
                                                                properties: {
                                                                    inline: {
                                                                        type: 'boolean',
                                                                        description: 'Is text inline',
                                                                    },
                                                                    bold: {
                                                                        type: 'boolean',
                                                                        description: 'Is text bold',
                                                                    },
                                                                    strike: {
                                                                        type: 'boolean',
                                                                        description: 'Is text crossed',
                                                                    },
                                                                    italic: {
                                                                        type: 'boolean',
                                                                        description: 'Is text italic',
                                                                    },
                                                                },
                                                                description: 'Text format',
                                                            },
                                                            text: { type: 'string', description: 'Text' },
                                                        },
                                                    },
                                                    {
                                                        required: ['type', 'user_id'],
                                                        type: 'object',
                                                        properties: {
                                                            type: { type: 'string', enum: ['user'] },
                                                            user_id: { type: 'string', description: 'User ID' },
                                                        },
                                                    },
                                                    {
                                                        required: ['channel_id', 'type'],
                                                        type: 'object',
                                                        properties: {
                                                            type: { type: 'string', enum: ['channel'] },
                                                            channel_id: { type: 'string', description: 'Channel ID' },
                                                        },
                                                    },
                                                    {
                                                        required: ['type', 'usergroup_id'],
                                                        type: 'object',
                                                        properties: {
                                                            type: { type: 'string', enum: ['usergroup'] },
                                                            usergroup_id: {
                                                                type: 'string',
                                                                description: 'User Group ID',
                                                            },
                                                        },
                                                    },
                                                    {
                                                        required: ['range', 'type'],
                                                        type: 'object',
                                                        properties: {
                                                            type: { type: 'string', enum: ['broadcast'] },
                                                            range: {
                                                                type: 'string',
                                                                description: 'Broadcast range',
                                                                enum: ['here', 'channel'],
                                                            },
                                                        },
                                                    },
                                                ],
                                            },
                                        },
                                    },
                                },
                                {
                                    required: ['elements', 'type'],
                                    type: 'object',
                                    properties: {
                                        type: { type: 'string', enum: ['rich_text_preformatted'] },
                                        elements: {
                                            type: 'array',
                                            items: {
                                                required: ['text', 'type'],
                                                type: 'object',
                                                properties: {
                                                    text: { type: 'string', description: 'Text' },
                                                    type: {
                                                        type: 'string',
                                                        description: 'Text section',
                                                        enum: ['text'],
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                                {
                                    required: ['elements', 'style', 'type'],
                                    type: 'object',
                                    properties: {
                                        type: { type: 'string', enum: ['rich_text_list'] },
                                        border: { maximum: 1, minimum: 0, type: 'number', description: 'Has border' },
                                        offset: { minimum: 0, type: 'number', description: 'Has offset' },
                                        indent: { maximum: 4, minimum: 0, type: 'number', description: 'Is indent' },
                                        style: {
                                            type: 'string',
                                            description: 'List style',
                                            enum: ['ordered', 'bullet'],
                                        },
                                        elements: {
                                            type: 'array',
                                            items: {
                                                required: ['elements', 'type'],
                                                type: 'object',
                                                properties: {
                                                    type: { type: 'string', enum: ['rich_text_section'] },
                                                    elements: {
                                                        type: 'array',
                                                        items: {
                                                            type: 'object',
                                                            properties: {
                                                                type: {
                                                                    type: 'string',
                                                                    description: 'Rich text section',
                                                                    enum: [
                                                                        'link',
                                                                        'emoji',
                                                                        'text',
                                                                        'broadcast',
                                                                        'channel',
                                                                        'user',
                                                                        'usergroup',
                                                                    ],
                                                                },
                                                            },
                                                            anyOf: [
                                                                {
                                                                    required: ['type', 'url'],
                                                                    type: 'object',
                                                                    properties: {
                                                                        type: { type: 'string', enum: ['link'] },
                                                                        url: {
                                                                            type: 'string',
                                                                            description: 'Link url',
                                                                        },
                                                                        text: { type: 'string' },
                                                                    },
                                                                },
                                                                {
                                                                    required: ['name', 'type'],
                                                                    type: 'object',
                                                                    properties: {
                                                                        type: { type: 'string', enum: ['emoji'] },
                                                                        format: {
                                                                            type: 'object',
                                                                            properties: {
                                                                                inline: {
                                                                                    type: 'boolean',
                                                                                    description: 'Is text inline',
                                                                                },
                                                                                bold: {
                                                                                    type: 'boolean',
                                                                                    description: 'Is text bold',
                                                                                },
                                                                                strike: {
                                                                                    type: 'boolean',
                                                                                    description: 'Is text crossed',
                                                                                },
                                                                                italic: {
                                                                                    type: 'boolean',
                                                                                    description: 'Is text italic',
                                                                                },
                                                                            },
                                                                            description: 'Link format',
                                                                        },
                                                                        name: {
                                                                            type: 'string',
                                                                            description: 'Emoji name',
                                                                        },
                                                                    },
                                                                },
                                                                {
                                                                    required: ['text', 'type'],
                                                                    type: 'object',
                                                                    properties: {
                                                                        type: { type: 'string', enum: ['text'] },
                                                                        format: {
                                                                            type: 'object',
                                                                            properties: {
                                                                                inline: {
                                                                                    type: 'boolean',
                                                                                    description: 'Is text inline',
                                                                                },
                                                                                bold: {
                                                                                    type: 'boolean',
                                                                                    description: 'Is text bold',
                                                                                },
                                                                                strike: {
                                                                                    type: 'boolean',
                                                                                    description: 'Is text crossed',
                                                                                },
                                                                                italic: {
                                                                                    type: 'boolean',
                                                                                    description: 'Is text italic',
                                                                                },
                                                                            },
                                                                            description: 'Text format',
                                                                        },
                                                                        text: { type: 'string', description: 'Text' },
                                                                    },
                                                                },
                                                                {
                                                                    required: ['type', 'user_id'],
                                                                    type: 'object',
                                                                    properties: {
                                                                        type: { type: 'string', enum: ['user'] },
                                                                        user_id: {
                                                                            type: 'string',
                                                                            description: 'User ID',
                                                                        },
                                                                    },
                                                                },
                                                                {
                                                                    required: ['channel_id', 'type'],
                                                                    type: 'object',
                                                                    properties: {
                                                                        type: { type: 'string', enum: ['channel'] },
                                                                        channel_id: {
                                                                            type: 'string',
                                                                            description: 'Channel ID',
                                                                        },
                                                                    },
                                                                },
                                                                {
                                                                    required: ['type', 'usergroup_id'],
                                                                    type: 'object',
                                                                    properties: {
                                                                        type: { type: 'string', enum: ['usergroup'] },
                                                                        usergroup_id: {
                                                                            type: 'string',
                                                                            description: 'User Group ID',
                                                                        },
                                                                    },
                                                                },
                                                                {
                                                                    required: ['range', 'type'],
                                                                    type: 'object',
                                                                    properties: {
                                                                        type: { type: 'string', enum: ['broadcast'] },
                                                                        range: {
                                                                            type: 'string',
                                                                            description: 'Broadcast range',
                                                                            enum: ['here', 'channel'],
                                                                        },
                                                                    },
                                                                },
                                                            ],
                                                        },
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                            ],
                        },
                    },
                },
            },
            {
                title: 'BlockInput',
                required: ['element', 'label', 'type'],
                type: 'object',
                properties: {
                    type: { type: 'string', description: 'Input block', enum: ['input'] },
                    label: {
                        title: 'BlockTextElement75',
                        required: ['text', 'type'],
                        type: 'object',
                        properties: {
                            type: { type: 'string', enum: ['plain_text'] },
                            text: { maxLength: 75, type: 'string' },
                            emoji: { type: 'boolean' },
                        },
                    },
                    dispatchAction: { type: 'boolean' },
                    optional: { type: 'boolean' },
                    element: {
                        oneOf: [
                            {
                                title: 'BlockButton',
                                required: ['text', 'type'],
                                type: 'object',
                                properties: {
                                    type: { type: 'string', enum: ['button'] },
                                    text: {
                                        title: 'BlockTextElement75',
                                        required: ['text', 'type'],
                                        type: 'object',
                                        properties: {
                                            type: { type: 'string', enum: ['plain_text'] },
                                            text: { maxLength: 75, type: 'string' },
                                            emoji: { type: 'boolean' },
                                        },
                                    },
                                    value: { maxLength: 300, type: 'string' },
                                    url: { type: 'string' },
                                    style: { type: 'string' },
                                    onAction: { type: 'string' },
                                    confirm: {
                                        title: 'Confirm',
                                        type: 'object',
                                        properties: {
                                            title: {
                                                title: 'BlockTextElement75',
                                                required: ['text', 'type'],
                                                type: 'object',
                                                properties: {
                                                    type: { type: 'string', enum: ['plain_text'] },
                                                    text: { maxLength: 75, type: 'string' },
                                                    emoji: { type: 'boolean' },
                                                },
                                            },
                                            text: {
                                                title: 'BlockTextElement300',
                                                required: ['text', 'type'],
                                                type: 'object',
                                                properties: {
                                                    type: { type: 'string', enum: ['plain_text'] },
                                                    text: { maxLength: 300, type: 'string' },
                                                    emoji: { type: 'boolean' },
                                                },
                                            },
                                            accept: {
                                                title: 'BlockTextElement75',
                                                required: ['text', 'type'],
                                                type: 'object',
                                                properties: {
                                                    type: { type: 'string', enum: ['plain_text'] },
                                                    text: { maxLength: 75, type: 'string' },
                                                    emoji: { type: 'boolean' },
                                                },
                                            },
                                            deny: {
                                                title: 'BlockTextElement75',
                                                required: ['text', 'type'],
                                                type: 'object',
                                                properties: {
                                                    type: { type: 'string', enum: ['plain_text'] },
                                                    text: { maxLength: 75, type: 'string' },
                                                    emoji: { type: 'boolean' },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                            {
                                title: 'BlockStaticSelectMenu',
                                required: ['options', 'placeholder', 'type'],
                                type: 'object',
                                properties: {
                                    type: { type: 'string', enum: ['static_select_menu'] },
                                    placeholder: {
                                        title: 'BlockTextElement75',
                                        required: ['text', 'type'],
                                        type: 'object',
                                        properties: {
                                            type: { type: 'string', enum: ['plain_text'] },
                                            text: { maxLength: 75, type: 'string' },
                                            emoji: { type: 'boolean' },
                                        },
                                    },
                                    onAction: { type: 'string' },
                                    options: {
                                        maxItems: 100,
                                        type: 'array',
                                        items: {
                                            title: 'Option',
                                            required: ['text', 'value'],
                                            type: 'object',
                                            properties: {
                                                text: {
                                                    title: 'BlockTextElement75',
                                                    required: ['text', 'type'],
                                                    type: 'object',
                                                    properties: {
                                                        type: { type: 'string', enum: ['plain_text'] },
                                                        text: { maxLength: 75, type: 'string' },
                                                        emoji: { type: 'boolean' },
                                                    },
                                                },
                                                value: { maxLength: 100, type: 'string' },
                                                description: {
                                                    title: 'BlockTextElement75',
                                                    required: ['text', 'type'],
                                                    type: 'object',
                                                    properties: {
                                                        type: { type: 'string', enum: ['plain_text'] },
                                                        text: { maxLength: 75, type: 'string' },
                                                        emoji: { type: 'boolean' },
                                                    },
                                                },
                                            },
                                        },
                                    },
                                    option_groups: {
                                        maxItems: 100,
                                        type: 'array',
                                        items: {
                                            title: 'OptionGroup',
                                            required: ['label', 'options'],
                                            type: 'object',
                                            properties: {
                                                label: {
                                                    title: 'BlockTextElement75',
                                                    required: ['text', 'type'],
                                                    type: 'object',
                                                    properties: {
                                                        type: { type: 'string', enum: ['plain_text'] },
                                                        text: { maxLength: 75, type: 'string' },
                                                        emoji: { type: 'boolean' },
                                                    },
                                                },
                                                options: {
                                                    maxItems: 100,
                                                    type: 'array',
                                                    items: {
                                                        title: 'Option',
                                                        required: ['text', 'value'],
                                                        type: 'object',
                                                        properties: {
                                                            text: {
                                                                title: 'BlockTextElement75',
                                                                required: ['text', 'type'],
                                                                type: 'object',
                                                                properties: {
                                                                    type: { type: 'string', enum: ['plain_text'] },
                                                                    text: { maxLength: 75, type: 'string' },
                                                                    emoji: { type: 'boolean' },
                                                                },
                                                            },
                                                            value: { maxLength: 100, type: 'string' },
                                                            description: {
                                                                title: 'BlockTextElement75',
                                                                required: ['text', 'type'],
                                                                type: 'object',
                                                                properties: {
                                                                    type: { type: 'string', enum: ['plain_text'] },
                                                                    text: { maxLength: 75, type: 'string' },
                                                                    emoji: { type: 'boolean' },
                                                                },
                                                            },
                                                        },
                                                    },
                                                },
                                            },
                                        },
                                    },
                                    initial_option: {
                                        oneOf: [
                                            {
                                                title: 'Option',
                                                required: ['text', 'value'],
                                                type: 'object',
                                                properties: {
                                                    text: {
                                                        title: 'BlockTextElement75',
                                                        required: ['text', 'type'],
                                                        type: 'object',
                                                        properties: {
                                                            type: { type: 'string', enum: ['plain_text'] },
                                                            text: { maxLength: 75, type: 'string' },
                                                            emoji: { type: 'boolean' },
                                                        },
                                                    },
                                                    value: { maxLength: 100, type: 'string' },
                                                    description: {
                                                        title: 'BlockTextElement75',
                                                        required: ['text', 'type'],
                                                        type: 'object',
                                                        properties: {
                                                            type: { type: 'string', enum: ['plain_text'] },
                                                            text: { maxLength: 75, type: 'string' },
                                                            emoji: { type: 'boolean' },
                                                        },
                                                    },
                                                },
                                            },
                                            {
                                                title: 'OptionGroup',
                                                required: ['label', 'options'],
                                                type: 'object',
                                                properties: {
                                                    label: {
                                                        title: 'BlockTextElement75',
                                                        required: ['text', 'type'],
                                                        type: 'object',
                                                        properties: {
                                                            type: { type: 'string', enum: ['plain_text'] },
                                                            text: { maxLength: 75, type: 'string' },
                                                            emoji: { type: 'boolean' },
                                                        },
                                                    },
                                                    options: {
                                                        maxItems: 100,
                                                        type: 'array',
                                                        items: {
                                                            title: 'Option',
                                                            required: ['text', 'value'],
                                                            type: 'object',
                                                            properties: {
                                                                text: {
                                                                    title: 'BlockTextElement75',
                                                                    required: ['text', 'type'],
                                                                    type: 'object',
                                                                    properties: {
                                                                        type: { type: 'string', enum: ['plain_text'] },
                                                                        text: { maxLength: 75, type: 'string' },
                                                                        emoji: { type: 'boolean' },
                                                                    },
                                                                },
                                                                value: { maxLength: 100, type: 'string' },
                                                                description: {
                                                                    title: 'BlockTextElement75',
                                                                    required: ['text', 'type'],
                                                                    type: 'object',
                                                                    properties: {
                                                                        type: { type: 'string', enum: ['plain_text'] },
                                                                        text: { maxLength: 75, type: 'string' },
                                                                        emoji: { type: 'boolean' },
                                                                    },
                                                                },
                                                            },
                                                        },
                                                    },
                                                },
                                            },
                                        ],
                                    },
                                    confirm: {
                                        title: 'Confirm',
                                        type: 'object',
                                        properties: {
                                            title: {
                                                title: 'BlockTextElement75',
                                                required: ['text', 'type'],
                                                type: 'object',
                                                properties: {
                                                    type: { type: 'string', enum: ['plain_text'] },
                                                    text: { maxLength: 75, type: 'string' },
                                                    emoji: { type: 'boolean' },
                                                },
                                            },
                                            text: {
                                                title: 'BlockTextElement300',
                                                required: ['text', 'type'],
                                                type: 'object',
                                                properties: {
                                                    type: { type: 'string', enum: ['plain_text'] },
                                                    text: { maxLength: 300, type: 'string' },
                                                    emoji: { type: 'boolean' },
                                                },
                                            },
                                            accept: {
                                                title: 'BlockTextElement75',
                                                required: ['text', 'type'],
                                                type: 'object',
                                                properties: {
                                                    type: { type: 'string', enum: ['plain_text'] },
                                                    text: { maxLength: 75, type: 'string' },
                                                    emoji: { type: 'boolean' },
                                                },
                                            },
                                            deny: {
                                                title: 'BlockTextElement75',
                                                required: ['text', 'type'],
                                                type: 'object',
                                                properties: {
                                                    type: { type: 'string', enum: ['plain_text'] },
                                                    text: { maxLength: 75, type: 'string' },
                                                    emoji: { type: 'boolean' },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        ],
                    },
                },
            },
            {
                title: 'BlockActions',
                required: ['elements', 'type'],
                type: 'object',
                properties: {
                    type: { type: 'string', description: 'Actions block', enum: ['actions'] },
                    elements: {
                        type: 'array',
                        items: {
                            oneOf: [
                                {
                                    title: 'BlockButton',
                                    required: ['text', 'type'],
                                    type: 'object',
                                    properties: {
                                        type: { type: 'string', enum: ['button'] },
                                        text: {
                                            title: 'BlockTextElement75',
                                            required: ['text', 'type'],
                                            type: 'object',
                                            properties: {
                                                type: { type: 'string', enum: ['plain_text'] },
                                                text: { maxLength: 75, type: 'string' },
                                                emoji: { type: 'boolean' },
                                            },
                                        },
                                        value: { maxLength: 300, type: 'string' },
                                        url: { type: 'string' },
                                        style: { type: 'string' },
                                        onAction: { type: 'string' },
                                        confirm: {
                                            title: 'Confirm',
                                            type: 'object',
                                            properties: {
                                                title: {
                                                    title: 'BlockTextElement75',
                                                    required: ['text', 'type'],
                                                    type: 'object',
                                                    properties: {
                                                        type: { type: 'string', enum: ['plain_text'] },
                                                        text: { maxLength: 75, type: 'string' },
                                                        emoji: { type: 'boolean' },
                                                    },
                                                },
                                                text: {
                                                    title: 'BlockTextElement300',
                                                    required: ['text', 'type'],
                                                    type: 'object',
                                                    properties: {
                                                        type: { type: 'string', enum: ['plain_text'] },
                                                        text: { maxLength: 300, type: 'string' },
                                                        emoji: { type: 'boolean' },
                                                    },
                                                },
                                                accept: {
                                                    title: 'BlockTextElement75',
                                                    required: ['text', 'type'],
                                                    type: 'object',
                                                    properties: {
                                                        type: { type: 'string', enum: ['plain_text'] },
                                                        text: { maxLength: 75, type: 'string' },
                                                        emoji: { type: 'boolean' },
                                                    },
                                                },
                                                deny: {
                                                    title: 'BlockTextElement75',
                                                    required: ['text', 'type'],
                                                    type: 'object',
                                                    properties: {
                                                        type: { type: 'string', enum: ['plain_text'] },
                                                        text: { maxLength: 75, type: 'string' },
                                                        emoji: { type: 'boolean' },
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                                {
                                    title: 'BlockStaticSelectMenu',
                                    required: ['options', 'placeholder', 'type'],
                                    type: 'object',
                                    properties: {
                                        type: { type: 'string', enum: ['static_select_menu'] },
                                        placeholder: {
                                            title: 'BlockTextElement75',
                                            required: ['text', 'type'],
                                            type: 'object',
                                            properties: {
                                                type: { type: 'string', enum: ['plain_text'] },
                                                text: { maxLength: 75, type: 'string' },
                                                emoji: { type: 'boolean' },
                                            },
                                        },
                                        onAction: { type: 'string' },
                                        options: {
                                            maxItems: 100,
                                            type: 'array',
                                            items: {
                                                title: 'Option',
                                                required: ['text', 'value'],
                                                type: 'object',
                                                properties: {
                                                    text: {
                                                        title: 'BlockTextElement75',
                                                        required: ['text', 'type'],
                                                        type: 'object',
                                                        properties: {
                                                            type: { type: 'string', enum: ['plain_text'] },
                                                            text: { maxLength: 75, type: 'string' },
                                                            emoji: { type: 'boolean' },
                                                        },
                                                    },
                                                    value: { maxLength: 100, type: 'string' },
                                                    description: {
                                                        title: 'BlockTextElement75',
                                                        required: ['text', 'type'],
                                                        type: 'object',
                                                        properties: {
                                                            type: { type: 'string', enum: ['plain_text'] },
                                                            text: { maxLength: 75, type: 'string' },
                                                            emoji: { type: 'boolean' },
                                                        },
                                                    },
                                                },
                                            },
                                        },
                                        option_groups: {
                                            maxItems: 100,
                                            type: 'array',
                                            items: {
                                                title: 'OptionGroup',
                                                required: ['label', 'options'],
                                                type: 'object',
                                                properties: {
                                                    label: {
                                                        title: 'BlockTextElement75',
                                                        required: ['text', 'type'],
                                                        type: 'object',
                                                        properties: {
                                                            type: { type: 'string', enum: ['plain_text'] },
                                                            text: { maxLength: 75, type: 'string' },
                                                            emoji: { type: 'boolean' },
                                                        },
                                                    },
                                                    options: {
                                                        maxItems: 100,
                                                        type: 'array',
                                                        items: {
                                                            title: 'Option',
                                                            required: ['text', 'value'],
                                                            type: 'object',
                                                            properties: {
                                                                text: {
                                                                    title: 'BlockTextElement75',
                                                                    required: ['text', 'type'],
                                                                    type: 'object',
                                                                    properties: {
                                                                        type: { type: 'string', enum: ['plain_text'] },
                                                                        text: { maxLength: 75, type: 'string' },
                                                                        emoji: { type: 'boolean' },
                                                                    },
                                                                },
                                                                value: { maxLength: 100, type: 'string' },
                                                                description: {
                                                                    title: 'BlockTextElement75',
                                                                    required: ['text', 'type'],
                                                                    type: 'object',
                                                                    properties: {
                                                                        type: { type: 'string', enum: ['plain_text'] },
                                                                        text: { maxLength: 75, type: 'string' },
                                                                        emoji: { type: 'boolean' },
                                                                    },
                                                                },
                                                            },
                                                        },
                                                    },
                                                },
                                            },
                                        },
                                        initial_option: {
                                            oneOf: [
                                                {
                                                    title: 'Option',
                                                    required: ['text', 'value'],
                                                    type: 'object',
                                                    properties: {
                                                        text: {
                                                            title: 'BlockTextElement75',
                                                            required: ['text', 'type'],
                                                            type: 'object',
                                                            properties: {
                                                                type: { type: 'string', enum: ['plain_text'] },
                                                                text: { maxLength: 75, type: 'string' },
                                                                emoji: { type: 'boolean' },
                                                            },
                                                        },
                                                        value: { maxLength: 100, type: 'string' },
                                                        description: {
                                                            title: 'BlockTextElement75',
                                                            required: ['text', 'type'],
                                                            type: 'object',
                                                            properties: {
                                                                type: { type: 'string', enum: ['plain_text'] },
                                                                text: { maxLength: 75, type: 'string' },
                                                                emoji: { type: 'boolean' },
                                                            },
                                                        },
                                                    },
                                                },
                                                {
                                                    title: 'OptionGroup',
                                                    required: ['label', 'options'],
                                                    type: 'object',
                                                    properties: {
                                                        label: {
                                                            title: 'BlockTextElement75',
                                                            required: ['text', 'type'],
                                                            type: 'object',
                                                            properties: {
                                                                type: { type: 'string', enum: ['plain_text'] },
                                                                text: { maxLength: 75, type: 'string' },
                                                                emoji: { type: 'boolean' },
                                                            },
                                                        },
                                                        options: {
                                                            maxItems: 100,
                                                            type: 'array',
                                                            items: {
                                                                title: 'Option',
                                                                required: ['text', 'value'],
                                                                type: 'object',
                                                                properties: {
                                                                    text: {
                                                                        title: 'BlockTextElement75',
                                                                        required: ['text', 'type'],
                                                                        type: 'object',
                                                                        properties: {
                                                                            type: {
                                                                                type: 'string',
                                                                                enum: ['plain_text'],
                                                                            },
                                                                            text: { maxLength: 75, type: 'string' },
                                                                            emoji: { type: 'boolean' },
                                                                        },
                                                                    },
                                                                    value: { maxLength: 100, type: 'string' },
                                                                    description: {
                                                                        title: 'BlockTextElement75',
                                                                        required: ['text', 'type'],
                                                                        type: 'object',
                                                                        properties: {
                                                                            type: {
                                                                                type: 'string',
                                                                                enum: ['plain_text'],
                                                                            },
                                                                            text: { maxLength: 75, type: 'string' },
                                                                            emoji: { type: 'boolean' },
                                                                        },
                                                                    },
                                                                },
                                                            },
                                                        },
                                                    },
                                                },
                                            ],
                                        },
                                        confirm: {
                                            title: 'Confirm',
                                            type: 'object',
                                            properties: {
                                                title: {
                                                    title: 'BlockTextElement75',
                                                    required: ['text', 'type'],
                                                    type: 'object',
                                                    properties: {
                                                        type: { type: 'string', enum: ['plain_text'] },
                                                        text: { maxLength: 75, type: 'string' },
                                                        emoji: { type: 'boolean' },
                                                    },
                                                },
                                                text: {
                                                    title: 'BlockTextElement300',
                                                    required: ['text', 'type'],
                                                    type: 'object',
                                                    properties: {
                                                        type: { type: 'string', enum: ['plain_text'] },
                                                        text: { maxLength: 300, type: 'string' },
                                                        emoji: { type: 'boolean' },
                                                    },
                                                },
                                                accept: {
                                                    title: 'BlockTextElement75',
                                                    required: ['text', 'type'],
                                                    type: 'object',
                                                    properties: {
                                                        type: { type: 'string', enum: ['plain_text'] },
                                                        text: { maxLength: 75, type: 'string' },
                                                        emoji: { type: 'boolean' },
                                                    },
                                                },
                                                deny: {
                                                    title: 'BlockTextElement75',
                                                    required: ['text', 'type'],
                                                    type: 'object',
                                                    properties: {
                                                        type: { type: 'string', enum: ['plain_text'] },
                                                        text: { maxLength: 75, type: 'string' },
                                                        emoji: { type: 'boolean' },
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                            ],
                        },
                    },
                },
            },
        ],
    },
};
