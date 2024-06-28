// DO NOT CHANGE THIS MANUALLY
// this is part of the PumbleAPI schema (BlocksArray subschema) so it should be compatible with it or exactly the same
export const mainBlocks = {
    "type": "array",
    "items": {
        "type": "object",
        "oneOf": [
            {
                "title": "RichText",
                "required": [
                    "elements",
                    "type"
                ],
                "type": "object",
                "properties": {
                    "type": {
                        "type": "string",
                        "description": "Rich Text block",
                        "enum": [
                            "rich_text"
                        ]
                    },
                    "elements": {
                        "type": "array",
                        "items": {
                            "title": "RichTextElement",
                            "type": "object",
                            "properties": {
                                "type": {
                                    "type": "string",
                                    "description": "Rich Text elements",
                                    "enum": [
                                        "rich_text_section",
                                        "rich_text_preformatted",
                                        "rich_text_list",
                                        "rich_text_quote"
                                    ]
                                }
                            },
                            "anyOf": [
                                {
                                    "required": [
                                        "elements",
                                        "type"
                                    ],
                                    "type": "object",
                                    "properties": {
                                        "type": {
                                            "type": "string",
                                            "enum": [
                                                "rich_text_section"
                                            ]
                                        },
                                        "elements": {
                                            "type": "array",
                                            "items": {
                                                "type": "object",
                                                "properties": {
                                                    "type": {
                                                        "type": "string",
                                                        "description": "Rich text section",
                                                        "enum": [
                                                            "link",
                                                            "emoji",
                                                            "text",
                                                            "broadcast",
                                                            "channel",
                                                            "user",
                                                            "usergroup"
                                                        ]
                                                    }
                                                },
                                                "anyOf": [
                                                    {
                                                        "required": [
                                                            "type",
                                                            "url"
                                                        ],
                                                        "type": "object",
                                                        "properties": {
                                                            "type": {
                                                                "type": "string",
                                                                "enum": [
                                                                    "link"
                                                                ]
                                                            },
                                                            "url": {
                                                                "type": "string",
                                                                "description": "Link url"
                                                            },
                                                            "text": {
                                                                "type": "string"
                                                            }
                                                        }
                                                    },
                                                    {
                                                        "required": [
                                                            "name",
                                                            "type"
                                                        ],
                                                        "type": "object",
                                                        "properties": {
                                                            "type": {
                                                                "type": "string",
                                                                "enum": [
                                                                    "emoji"
                                                                ]
                                                            },
                                                            "style": {
                                                                "type": "object",
                                                                "properties": {
                                                                    "inline": {
                                                                        "type": "boolean",
                                                                        "description": "Is text inline"
                                                                    },
                                                                    "bold": {
                                                                        "type": "boolean",
                                                                        "description": "Is text bold"
                                                                    },
                                                                    "strike": {
                                                                        "type": "boolean",
                                                                        "description": "Is text crossed"
                                                                    },
                                                                    "italic": {
                                                                        "type": "boolean",
                                                                        "description": "Is text italic"
                                                                    }
                                                                },
                                                                "description": "Link format"
                                                            },
                                                            "name": {
                                                                "type": "string",
                                                                "description": "Emoji name"
                                                            }
                                                        }
                                                    },
                                                    {
                                                        "required": [
                                                            "text",
                                                            "type"
                                                        ],
                                                        "type": "object",
                                                        "properties": {
                                                            "type": {
                                                                "type": "string",
                                                                "enum": [
                                                                    "text"
                                                                ]
                                                            },
                                                            "style": {
                                                                "type": "object",
                                                                "properties": {
                                                                    "inline": {
                                                                        "type": "boolean",
                                                                        "description": "Is text inline"
                                                                    },
                                                                    "bold": {
                                                                        "type": "boolean",
                                                                        "description": "Is text bold"
                                                                    },
                                                                    "strike": {
                                                                        "type": "boolean",
                                                                        "description": "Is text crossed"
                                                                    },
                                                                    "italic": {
                                                                        "type": "boolean",
                                                                        "description": "Is text italic"
                                                                    }
                                                                },
                                                                "description": "Text format"
                                                            },
                                                            "text": {
                                                                "type": "string",
                                                                "description": "Text"
                                                            }
                                                        }
                                                    },
                                                    {
                                                        "required": [
                                                            "type",
                                                            "user_id"
                                                        ],
                                                        "type": "object",
                                                        "properties": {
                                                            "type": {
                                                                "type": "string",
                                                                "enum": [
                                                                    "user"
                                                                ]
                                                            },
                                                            "user_id": {
                                                                "type": "string",
                                                                "description": "User ID"
                                                            }
                                                        }
                                                    },
                                                    {
                                                        "required": [
                                                            "channel_id",
                                                            "type"
                                                        ],
                                                        "type": "object",
                                                        "properties": {
                                                            "type": {
                                                                "type": "string",
                                                                "enum": [
                                                                    "channel"
                                                                ]
                                                            },
                                                            "channel_id": {
                                                                "type": "string",
                                                                "description": "Channel ID"
                                                            }
                                                        }
                                                    },
                                                    {
                                                        "required": [
                                                            "type",
                                                            "usergroup_id"
                                                        ],
                                                        "type": "object",
                                                        "properties": {
                                                            "type": {
                                                                "type": "string",
                                                                "enum": [
                                                                    "usergroup"
                                                                ]
                                                            },
                                                            "usergroup_id": {
                                                                "type": "string",
                                                                "description": "User Group ID"
                                                            }
                                                        }
                                                    },
                                                    {
                                                        "required": [
                                                            "range",
                                                            "type"
                                                        ],
                                                        "type": "object",
                                                        "properties": {
                                                            "type": {
                                                                "type": "string",
                                                                "enum": [
                                                                    "broadcast"
                                                                ]
                                                            },
                                                            "range": {
                                                                "type": "string",
                                                                "description": "Broadcast range",
                                                                "enum": [
                                                                    "here",
                                                                    "channel"
                                                                ]
                                                            }
                                                        }
                                                    }
                                                ]
                                            }
                                        }
                                    }
                                },
                                {
                                    "required": [
                                        "elements",
                                        "type"
                                    ],
                                    "type": "object",
                                    "properties": {
                                        "type": {
                                            "type": "string",
                                            "enum": [
                                                "rich_text_quote"
                                            ]
                                        },
                                        "elements": {
                                            "type": "array",
                                            "items": {
                                                "type": "object",
                                                "properties": {
                                                    "type": {
                                                        "type": "string",
                                                        "description": "Rich text section",
                                                        "enum": [
                                                            "link",
                                                            "emoji",
                                                            "text",
                                                            "broadcast",
                                                            "channel",
                                                            "user",
                                                            "usergroup"
                                                        ]
                                                    }
                                                },
                                                "anyOf": [
                                                    {
                                                        "required": [
                                                            "type",
                                                            "url"
                                                        ],
                                                        "type": "object",
                                                        "properties": {
                                                            "type": {
                                                                "type": "string",
                                                                "enum": [
                                                                    "link"
                                                                ]
                                                            },
                                                            "url": {
                                                                "type": "string",
                                                                "description": "Link url"
                                                            },
                                                            "text": {
                                                                "type": "string"
                                                            }
                                                        }
                                                    },
                                                    {
                                                        "required": [
                                                            "name",
                                                            "type"
                                                        ],
                                                        "type": "object",
                                                        "properties": {
                                                            "type": {
                                                                "type": "string",
                                                                "enum": [
                                                                    "emoji"
                                                                ]
                                                            },
                                                            "style": {
                                                                "type": "object",
                                                                "properties": {
                                                                    "inline": {
                                                                        "type": "boolean",
                                                                        "description": "Is text inline"
                                                                    },
                                                                    "bold": {
                                                                        "type": "boolean",
                                                                        "description": "Is text bold"
                                                                    },
                                                                    "strike": {
                                                                        "type": "boolean",
                                                                        "description": "Is text crossed"
                                                                    },
                                                                    "italic": {
                                                                        "type": "boolean",
                                                                        "description": "Is text italic"
                                                                    }
                                                                },
                                                                "description": "Link format"
                                                            },
                                                            "name": {
                                                                "type": "string",
                                                                "description": "Emoji name"
                                                            }
                                                        }
                                                    },
                                                    {
                                                        "required": [
                                                            "text",
                                                            "type"
                                                        ],
                                                        "type": "object",
                                                        "properties": {
                                                            "type": {
                                                                "type": "string",
                                                                "enum": [
                                                                    "text"
                                                                ]
                                                            },
                                                            "style": {
                                                                "type": "object",
                                                                "properties": {
                                                                    "inline": {
                                                                        "type": "boolean",
                                                                        "description": "Is text inline"
                                                                    },
                                                                    "bold": {
                                                                        "type": "boolean",
                                                                        "description": "Is text bold"
                                                                    },
                                                                    "strike": {
                                                                        "type": "boolean",
                                                                        "description": "Is text crossed"
                                                                    },
                                                                    "italic": {
                                                                        "type": "boolean",
                                                                        "description": "Is text italic"
                                                                    }
                                                                },
                                                                "description": "Text format"
                                                            },
                                                            "text": {
                                                                "type": "string",
                                                                "description": "Text"
                                                            }
                                                        }
                                                    },
                                                    {
                                                        "required": [
                                                            "type",
                                                            "user_id"
                                                        ],
                                                        "type": "object",
                                                        "properties": {
                                                            "type": {
                                                                "type": "string",
                                                                "enum": [
                                                                    "user"
                                                                ]
                                                            },
                                                            "user_id": {
                                                                "type": "string",
                                                                "description": "User ID"
                                                            }
                                                        }
                                                    },
                                                    {
                                                        "required": [
                                                            "channel_id",
                                                            "type"
                                                        ],
                                                        "type": "object",
                                                        "properties": {
                                                            "type": {
                                                                "type": "string",
                                                                "enum": [
                                                                    "channel"
                                                                ]
                                                            },
                                                            "channel_id": {
                                                                "type": "string",
                                                                "description": "Channel ID"
                                                            }
                                                        }
                                                    },
                                                    {
                                                        "required": [
                                                            "type",
                                                            "usergroup_id"
                                                        ],
                                                        "type": "object",
                                                        "properties": {
                                                            "type": {
                                                                "type": "string",
                                                                "enum": [
                                                                    "usergroup"
                                                                ]
                                                            },
                                                            "usergroup_id": {
                                                                "type": "string",
                                                                "description": "User Group ID"
                                                            }
                                                        }
                                                    },
                                                    {
                                                        "required": [
                                                            "range",
                                                            "type"
                                                        ],
                                                        "type": "object",
                                                        "properties": {
                                                            "type": {
                                                                "type": "string",
                                                                "enum": [
                                                                    "broadcast"
                                                                ]
                                                            },
                                                            "range": {
                                                                "type": "string",
                                                                "description": "Broadcast range",
                                                                "enum": [
                                                                    "here",
                                                                    "channel"
                                                                ]
                                                            }
                                                        }
                                                    }
                                                ]
                                            }
                                        }
                                    }
                                },
                                {
                                    "required": [
                                        "elements",
                                        "type"
                                    ],
                                    "type": "object",
                                    "properties": {
                                        "type": {
                                            "type": "string",
                                            "enum": [
                                                "rich_text_preformatted"
                                            ]
                                        },
                                        "elements": {
                                            "type": "array",
                                            "items": {
                                                "required": [
                                                    "text",
                                                    "type"
                                                ],
                                                "type": "object",
                                                "properties": {
                                                    "text": {
                                                        "type": "string",
                                                        "description": "Text"
                                                    },
                                                    "type": {
                                                        "type": "string",
                                                        "description": "Text section",
                                                        "enum": [
                                                            "text"
                                                        ]
                                                    }
                                                }
                                            }
                                        }
                                    }
                                },
                                {
                                    "required": [
                                        "elements",
                                        "style",
                                        "type"
                                    ],
                                    "type": "object",
                                    "properties": {
                                        "type": {
                                            "type": "string",
                                            "enum": [
                                                "rich_text_list"
                                            ]
                                        },
                                        "border": {
                                            "maximum": 1,
                                            "minimum": 0,
                                            "type": "number",
                                            "description": "Has border"
                                        },
                                        "offset": {
                                            "minimum": 0,
                                            "type": "number",
                                            "description": "Has offset"
                                        },
                                        "indent": {
                                            "maximum": 4,
                                            "minimum": 0,
                                            "type": "number",
                                            "description": "Is indent"
                                        },
                                        "style": {
                                            "type": "string",
                                            "description": "List style",
                                            "enum": [
                                                "ordered",
                                                "bullet"
                                            ]
                                        },
                                        "elements": {
                                            "type": "array",
                                            "items": {
                                                "required": [
                                                    "elements",
                                                    "type"
                                                ],
                                                "type": "object",
                                                "properties": {
                                                    "type": {
                                                        "type": "string",
                                                        "enum": [
                                                            "rich_text_section"
                                                        ]
                                                    },
                                                    "elements": {
                                                        "type": "array",
                                                        "items": {
                                                            "type": "object",
                                                            "properties": {
                                                                "type": {
                                                                    "type": "string",
                                                                    "description": "Rich text section",
                                                                    "enum": [
                                                                        "link",
                                                                        "emoji",
                                                                        "text",
                                                                        "broadcast",
                                                                        "channel",
                                                                        "user",
                                                                        "usergroup"
                                                                    ]
                                                                }
                                                            },
                                                            "anyOf": [
                                                                {
                                                                    "required": [
                                                                        "type",
                                                                        "url"
                                                                    ],
                                                                    "type": "object",
                                                                    "properties": {
                                                                        "type": {
                                                                            "type": "string",
                                                                            "enum": [
                                                                                "link"
                                                                            ]
                                                                        },
                                                                        "url": {
                                                                            "type": "string",
                                                                            "description": "Link url"
                                                                        },
                                                                        "text": {
                                                                            "type": "string"
                                                                        }
                                                                    }
                                                                },
                                                                {
                                                                    "required": [
                                                                        "name",
                                                                        "type"
                                                                    ],
                                                                    "type": "object",
                                                                    "properties": {
                                                                        "type": {
                                                                            "type": "string",
                                                                            "enum": [
                                                                                "emoji"
                                                                            ]
                                                                        },
                                                                        "style": {
                                                                            "type": "object",
                                                                            "properties": {
                                                                                "inline": {
                                                                                    "type": "boolean",
                                                                                    "description": "Is text inline"
                                                                                },
                                                                                "bold": {
                                                                                    "type": "boolean",
                                                                                    "description": "Is text bold"
                                                                                },
                                                                                "strike": {
                                                                                    "type": "boolean",
                                                                                    "description": "Is text crossed"
                                                                                },
                                                                                "italic": {
                                                                                    "type": "boolean",
                                                                                    "description": "Is text italic"
                                                                                }
                                                                            },
                                                                            "description": "Link format"
                                                                        },
                                                                        "name": {
                                                                            "type": "string",
                                                                            "description": "Emoji name"
                                                                        }
                                                                    }
                                                                },
                                                                {
                                                                    "required": [
                                                                        "text",
                                                                        "type"
                                                                    ],
                                                                    "type": "object",
                                                                    "properties": {
                                                                        "type": {
                                                                            "type": "string",
                                                                            "enum": [
                                                                                "text"
                                                                            ]
                                                                        },
                                                                        "style": {
                                                                            "type": "object",
                                                                            "properties": {
                                                                                "inline": {
                                                                                    "type": "boolean",
                                                                                    "description": "Is text inline"
                                                                                },
                                                                                "bold": {
                                                                                    "type": "boolean",
                                                                                    "description": "Is text bold"
                                                                                },
                                                                                "strike": {
                                                                                    "type": "boolean",
                                                                                    "description": "Is text crossed"
                                                                                },
                                                                                "italic": {
                                                                                    "type": "boolean",
                                                                                    "description": "Is text italic"
                                                                                }
                                                                            },
                                                                            "description": "Text format"
                                                                        },
                                                                        "text": {
                                                                            "type": "string",
                                                                            "description": "Text"
                                                                        }
                                                                    }
                                                                },
                                                                {
                                                                    "required": [
                                                                        "type",
                                                                        "user_id"
                                                                    ],
                                                                    "type": "object",
                                                                    "properties": {
                                                                        "type": {
                                                                            "type": "string",
                                                                            "enum": [
                                                                                "user"
                                                                            ]
                                                                        },
                                                                        "user_id": {
                                                                            "type": "string",
                                                                            "description": "User ID"
                                                                        }
                                                                    }
                                                                },
                                                                {
                                                                    "required": [
                                                                        "channel_id",
                                                                        "type"
                                                                    ],
                                                                    "type": "object",
                                                                    "properties": {
                                                                        "type": {
                                                                            "type": "string",
                                                                            "enum": [
                                                                                "channel"
                                                                            ]
                                                                        },
                                                                        "channel_id": {
                                                                            "type": "string",
                                                                            "description": "Channel ID"
                                                                        }
                                                                    }
                                                                },
                                                                {
                                                                    "required": [
                                                                        "type",
                                                                        "usergroup_id"
                                                                    ],
                                                                    "type": "object",
                                                                    "properties": {
                                                                        "type": {
                                                                            "type": "string",
                                                                            "enum": [
                                                                                "usergroup"
                                                                            ]
                                                                        },
                                                                        "usergroup_id": {
                                                                            "type": "string",
                                                                            "description": "User Group ID"
                                                                        }
                                                                    }
                                                                },
                                                                {
                                                                    "required": [
                                                                        "range",
                                                                        "type"
                                                                    ],
                                                                    "type": "object",
                                                                    "properties": {
                                                                        "type": {
                                                                            "type": "string",
                                                                            "enum": [
                                                                                "broadcast"
                                                                            ]
                                                                        },
                                                                        "range": {
                                                                            "type": "string",
                                                                            "description": "Broadcast range",
                                                                            "enum": [
                                                                                "here",
                                                                                "channel"
                                                                            ]
                                                                        }
                                                                    }
                                                                }
                                                            ]
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            ]
                        }
                    }
                }
            },
            {
                "title": "BlockInput",
                "required": [
                    "element",
                    "label",
                    "type"
                ],
                "type": "object",
                "properties": {
                    "type": {
                        "type": "string",
                        "description": "Input block",
                        "enum": [
                            "input"
                        ]
                    },
                    "label": {
                        "title": "BlockTextElement75",
                        "required": [
                            "text",
                            "type"
                        ],
                        "type": "object",
                        "properties": {
                            "type": {
                                "type": "string",
                                "enum": [
                                    "plain_text"
                                ]
                            },
                            "text": {
                                "maxLength": 75,
                                "type": "string"
                            },
                            "emoji": {
                                "type": "boolean",
                                "description": "Indicates whether emojis in a text field should be escaped into the colon emoji format."
                            }
                        }
                    },
                    "dispatchAction": {
                        "type": "boolean",
                        "description": "Determines whether block interaction should be dispatched by the specified element. Defaults to false."
                    },
                    "optional": {
                        "type": "boolean",
                        "description": "A boolean that indicates whether the input element may be empty when a user submits the modal. Defaults to false."
                    },
                    "element": {
                        "oneOf": [
                            {
                                "title": "BlockButton",
                                "required": [
                                    "text",
                                    "type"
                                ],
                                "type": "object",
                                "properties": {
                                    "type": {
                                        "type": "string",
                                        "enum": [
                                            "button"
                                        ]
                                    },
                                    "text": {
                                        "title": "BlockTextElement75",
                                        "required": [
                                            "text",
                                            "type"
                                        ],
                                        "type": "object",
                                        "properties": {
                                            "type": {
                                                "type": "string",
                                                "enum": [
                                                    "plain_text"
                                                ]
                                            },
                                            "text": {
                                                "maxLength": 75,
                                                "type": "string"
                                            },
                                            "emoji": {
                                                "type": "boolean",
                                                "description": "Indicates whether emojis in a text field should be escaped into the colon emoji format."
                                            }
                                        }
                                    },
                                    "value": {
                                        "maxLength": 300,
                                        "type": "string",
                                        "description": "Any metadata defined by addon, will be part of payload object in request client -\u003E api -\u003E addon."
                                    },
                                    "url": {
                                        "type": "string",
                                        "description": "Url that will be opened in user's browser. Block interaction event will be triggered also."
                                    },
                                    "style": {
                                        "type": "string",
                                        "description": "'primary' | 'secondary' | 'warning' | 'danger'"
                                    },
                                    "onAction": {
                                        "type": "string",
                                        "description": "Action identifier defined by addon (controlled and used on addon side)."
                                    },
                                    "confirm": {
                                        "title": "Confirm",
                                        "type": "object",
                                        "properties": {
                                            "title": {
                                                "title": "BlockTextElement75",
                                                "required": [
                                                    "text",
                                                    "type"
                                                ],
                                                "type": "object",
                                                "properties": {
                                                    "type": {
                                                        "type": "string",
                                                        "enum": [
                                                            "plain_text"
                                                        ]
                                                    },
                                                    "text": {
                                                        "maxLength": 75,
                                                        "type": "string"
                                                    },
                                                    "emoji": {
                                                        "type": "boolean",
                                                        "description": "Indicates whether emojis in a text field should be escaped into the colon emoji format."
                                                    }
                                                }
                                            },
                                            "text": {
                                                "title": "BlockTextElement300",
                                                "required": [
                                                    "text",
                                                    "type"
                                                ],
                                                "type": "object",
                                                "properties": {
                                                    "type": {
                                                        "type": "string",
                                                        "enum": [
                                                            "plain_text"
                                                        ]
                                                    },
                                                    "text": {
                                                        "maxLength": 300,
                                                        "type": "string"
                                                    },
                                                    "emoji": {
                                                        "type": "boolean",
                                                        "description": "Indicates whether emojis in a text field should be escaped into the colon emoji format."
                                                    }
                                                }
                                            },
                                            "accept": {
                                                "title": "BlockTextElement75",
                                                "required": [
                                                    "text",
                                                    "type"
                                                ],
                                                "type": "object",
                                                "properties": {
                                                    "type": {
                                                        "type": "string",
                                                        "enum": [
                                                            "plain_text"
                                                        ]
                                                    },
                                                    "text": {
                                                        "maxLength": 75,
                                                        "type": "string"
                                                    },
                                                    "emoji": {
                                                        "type": "boolean",
                                                        "description": "Indicates whether emojis in a text field should be escaped into the colon emoji format."
                                                    }
                                                }
                                            },
                                            "deny": {
                                                "title": "BlockTextElement75",
                                                "required": [
                                                    "text",
                                                    "type"
                                                ],
                                                "type": "object",
                                                "properties": {
                                                    "type": {
                                                        "type": "string",
                                                        "enum": [
                                                            "plain_text"
                                                        ]
                                                    },
                                                    "text": {
                                                        "maxLength": 75,
                                                        "type": "string"
                                                    },
                                                    "emoji": {
                                                        "type": "boolean",
                                                        "description": "Indicates whether emojis in a text field should be escaped into the colon emoji format."
                                                    }
                                                }
                                            }
                                        },
                                        "description": "Confirm modal that will be shown just before triggering block interaction. User will be prompted to confirm the action."
                                    }
                                }
                            },
                            {
                                "title": "BlockStaticSelectMenu",
                                "required": [
                                    "options",
                                    "placeholder",
                                    "type"
                                ],
                                "type": "object",
                                "properties": {
                                    "type": {
                                        "type": "string",
                                        "enum": [
                                            "static_select_menu"
                                        ]
                                    },
                                    "placeholder": {
                                        "title": "BlockTextElement75",
                                        "required": [
                                            "text",
                                            "type"
                                        ],
                                        "type": "object",
                                        "properties": {
                                            "type": {
                                                "type": "string",
                                                "enum": [
                                                    "plain_text"
                                                ]
                                            },
                                            "text": {
                                                "maxLength": 75,
                                                "type": "string"
                                            },
                                            "emoji": {
                                                "type": "boolean",
                                                "description": "Indicates whether emojis in a text field should be escaped into the colon emoji format."
                                            }
                                        }
                                    },
                                    "onAction": {
                                        "type": "string",
                                        "description": "Action identifier defined by addon (controlled and used on addon side)."
                                    },
                                    "options": {
                                        "maxItems": 100,
                                        "type": "array",
                                        "description": "Simple options list.",
                                        "items": {
                                            "title": "Option",
                                            "required": [
                                                "text",
                                                "value"
                                            ],
                                            "type": "object",
                                            "properties": {
                                                "text": {
                                                    "title": "BlockTextElement75",
                                                    "required": [
                                                        "text",
                                                        "type"
                                                    ],
                                                    "type": "object",
                                                    "properties": {
                                                        "type": {
                                                            "type": "string",
                                                            "enum": [
                                                                "plain_text"
                                                            ]
                                                        },
                                                        "text": {
                                                            "maxLength": 75,
                                                            "type": "string"
                                                        },
                                                        "emoji": {
                                                            "type": "boolean",
                                                            "description": "Indicates whether emojis in a text field should be escaped into the colon emoji format."
                                                        }
                                                    }
                                                },
                                                "value": {
                                                    "maxLength": 100,
                                                    "type": "string",
                                                    "description": "A unique string value that will be passed to addon when this option is chosen."
                                                },
                                                "description": {
                                                    "title": "BlockTextElement75",
                                                    "required": [
                                                        "text",
                                                        "type"
                                                    ],
                                                    "type": "object",
                                                    "properties": {
                                                        "type": {
                                                            "type": "string",
                                                            "enum": [
                                                                "plain_text"
                                                            ]
                                                        },
                                                        "text": {
                                                            "maxLength": 75,
                                                            "type": "string"
                                                        },
                                                        "emoji": {
                                                            "type": "boolean",
                                                            "description": "Indicates whether emojis in a text field should be escaped into the colon emoji format."
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    },
                                    "option_groups": {
                                        "maxItems": 100,
                                        "type": "array",
                                        "description": "Nested options list where each option group is basically list of simple options. If defined, it takes precedence over the 'options' field.",
                                        "items": {
                                            "title": "OptionGroup",
                                            "required": [
                                                "label",
                                                "options"
                                            ],
                                            "type": "object",
                                            "properties": {
                                                "label": {
                                                    "title": "BlockTextElement75",
                                                    "required": [
                                                        "text",
                                                        "type"
                                                    ],
                                                    "type": "object",
                                                    "properties": {
                                                        "type": {
                                                            "type": "string",
                                                            "enum": [
                                                                "plain_text"
                                                            ]
                                                        },
                                                        "text": {
                                                            "maxLength": 75,
                                                            "type": "string"
                                                        },
                                                        "emoji": {
                                                            "type": "boolean",
                                                            "description": "Indicates whether emojis in a text field should be escaped into the colon emoji format."
                                                        }
                                                    }
                                                },
                                                "options": {
                                                    "maxItems": 100,
                                                    "type": "array",
                                                    "items": {
                                                        "title": "Option",
                                                        "required": [
                                                            "text",
                                                            "value"
                                                        ],
                                                        "type": "object",
                                                        "properties": {
                                                            "text": {
                                                                "title": "BlockTextElement75",
                                                                "required": [
                                                                    "text",
                                                                    "type"
                                                                ],
                                                                "type": "object",
                                                                "properties": {
                                                                    "type": {
                                                                        "type": "string",
                                                                        "enum": [
                                                                            "plain_text"
                                                                        ]
                                                                    },
                                                                    "text": {
                                                                        "maxLength": 75,
                                                                        "type": "string"
                                                                    },
                                                                    "emoji": {
                                                                        "type": "boolean",
                                                                        "description": "Indicates whether emojis in a text field should be escaped into the colon emoji format."
                                                                    }
                                                                }
                                                            },
                                                            "value": {
                                                                "maxLength": 100,
                                                                "type": "string",
                                                                "description": "A unique string value that will be passed to addon when this option is chosen."
                                                            },
                                                            "description": {
                                                                "title": "BlockTextElement75",
                                                                "required": [
                                                                    "text",
                                                                    "type"
                                                                ],
                                                                "type": "object",
                                                                "properties": {
                                                                    "type": {
                                                                        "type": "string",
                                                                        "enum": [
                                                                            "plain_text"
                                                                        ]
                                                                    },
                                                                    "text": {
                                                                        "maxLength": 75,
                                                                        "type": "string"
                                                                    },
                                                                    "emoji": {
                                                                        "type": "boolean",
                                                                        "description": "Indicates whether emojis in a text field should be escaped into the colon emoji format."
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    },
                                    "initial_option": {
                                        "description": "Initial option that will be shown in select menu. Type depends on 'options' and 'options_groups'.",
                                        "oneOf": [
                                            {
                                                "title": "Option",
                                                "required": [
                                                    "text",
                                                    "value"
                                                ],
                                                "type": "object",
                                                "properties": {
                                                    "text": {
                                                        "title": "BlockTextElement75",
                                                        "required": [
                                                            "text",
                                                            "type"
                                                        ],
                                                        "type": "object",
                                                        "properties": {
                                                            "type": {
                                                                "type": "string",
                                                                "enum": [
                                                                    "plain_text"
                                                                ]
                                                            },
                                                            "text": {
                                                                "maxLength": 75,
                                                                "type": "string"
                                                            },
                                                            "emoji": {
                                                                "type": "boolean",
                                                                "description": "Indicates whether emojis in a text field should be escaped into the colon emoji format."
                                                            }
                                                        }
                                                    },
                                                    "value": {
                                                        "maxLength": 100,
                                                        "type": "string",
                                                        "description": "A unique string value that will be passed to addon when this option is chosen."
                                                    },
                                                    "description": {
                                                        "title": "BlockTextElement75",
                                                        "required": [
                                                            "text",
                                                            "type"
                                                        ],
                                                        "type": "object",
                                                        "properties": {
                                                            "type": {
                                                                "type": "string",
                                                                "enum": [
                                                                    "plain_text"
                                                                ]
                                                            },
                                                            "text": {
                                                                "maxLength": 75,
                                                                "type": "string"
                                                            },
                                                            "emoji": {
                                                                "type": "boolean",
                                                                "description": "Indicates whether emojis in a text field should be escaped into the colon emoji format."
                                                            }
                                                        }
                                                    }
                                                }
                                            },
                                            {
                                                "title": "OptionGroup",
                                                "required": [
                                                    "label",
                                                    "options"
                                                ],
                                                "type": "object",
                                                "properties": {
                                                    "label": {
                                                        "title": "BlockTextElement75",
                                                        "required": [
                                                            "text",
                                                            "type"
                                                        ],
                                                        "type": "object",
                                                        "properties": {
                                                            "type": {
                                                                "type": "string",
                                                                "enum": [
                                                                    "plain_text"
                                                                ]
                                                            },
                                                            "text": {
                                                                "maxLength": 75,
                                                                "type": "string"
                                                            },
                                                            "emoji": {
                                                                "type": "boolean",
                                                                "description": "Indicates whether emojis in a text field should be escaped into the colon emoji format."
                                                            }
                                                        }
                                                    },
                                                    "options": {
                                                        "maxItems": 100,
                                                        "type": "array",
                                                        "items": {
                                                            "title": "Option",
                                                            "required": [
                                                                "text",
                                                                "value"
                                                            ],
                                                            "type": "object",
                                                            "properties": {
                                                                "text": {
                                                                    "title": "BlockTextElement75",
                                                                    "required": [
                                                                        "text",
                                                                        "type"
                                                                    ],
                                                                    "type": "object",
                                                                    "properties": {
                                                                        "type": {
                                                                            "type": "string",
                                                                            "enum": [
                                                                                "plain_text"
                                                                            ]
                                                                        },
                                                                        "text": {
                                                                            "maxLength": 75,
                                                                            "type": "string"
                                                                        },
                                                                        "emoji": {
                                                                            "type": "boolean",
                                                                            "description": "Indicates whether emojis in a text field should be escaped into the colon emoji format."
                                                                        }
                                                                    }
                                                                },
                                                                "value": {
                                                                    "maxLength": 100,
                                                                    "type": "string",
                                                                    "description": "A unique string value that will be passed to addon when this option is chosen."
                                                                },
                                                                "description": {
                                                                    "title": "BlockTextElement75",
                                                                    "required": [
                                                                        "text",
                                                                        "type"
                                                                    ],
                                                                    "type": "object",
                                                                    "properties": {
                                                                        "type": {
                                                                            "type": "string",
                                                                            "enum": [
                                                                                "plain_text"
                                                                            ]
                                                                        },
                                                                        "text": {
                                                                            "maxLength": 75,
                                                                            "type": "string"
                                                                        },
                                                                        "emoji": {
                                                                            "type": "boolean",
                                                                            "description": "Indicates whether emojis in a text field should be escaped into the colon emoji format."
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        ]
                                    },
                                    "confirm": {
                                        "title": "Confirm",
                                        "type": "object",
                                        "properties": {
                                            "title": {
                                                "title": "BlockTextElement75",
                                                "required": [
                                                    "text",
                                                    "type"
                                                ],
                                                "type": "object",
                                                "properties": {
                                                    "type": {
                                                        "type": "string",
                                                        "enum": [
                                                            "plain_text"
                                                        ]
                                                    },
                                                    "text": {
                                                        "maxLength": 75,
                                                        "type": "string"
                                                    },
                                                    "emoji": {
                                                        "type": "boolean",
                                                        "description": "Indicates whether emojis in a text field should be escaped into the colon emoji format."
                                                    }
                                                }
                                            },
                                            "text": {
                                                "title": "BlockTextElement300",
                                                "required": [
                                                    "text",
                                                    "type"
                                                ],
                                                "type": "object",
                                                "properties": {
                                                    "type": {
                                                        "type": "string",
                                                        "enum": [
                                                            "plain_text"
                                                        ]
                                                    },
                                                    "text": {
                                                        "maxLength": 300,
                                                        "type": "string"
                                                    },
                                                    "emoji": {
                                                        "type": "boolean",
                                                        "description": "Indicates whether emojis in a text field should be escaped into the colon emoji format."
                                                    }
                                                }
                                            },
                                            "accept": {
                                                "title": "BlockTextElement75",
                                                "required": [
                                                    "text",
                                                    "type"
                                                ],
                                                "type": "object",
                                                "properties": {
                                                    "type": {
                                                        "type": "string",
                                                        "enum": [
                                                            "plain_text"
                                                        ]
                                                    },
                                                    "text": {
                                                        "maxLength": 75,
                                                        "type": "string"
                                                    },
                                                    "emoji": {
                                                        "type": "boolean",
                                                        "description": "Indicates whether emojis in a text field should be escaped into the colon emoji format."
                                                    }
                                                }
                                            },
                                            "deny": {
                                                "title": "BlockTextElement75",
                                                "required": [
                                                    "text",
                                                    "type"
                                                ],
                                                "type": "object",
                                                "properties": {
                                                    "type": {
                                                        "type": "string",
                                                        "enum": [
                                                            "plain_text"
                                                        ]
                                                    },
                                                    "text": {
                                                        "maxLength": 75,
                                                        "type": "string"
                                                    },
                                                    "emoji": {
                                                        "type": "boolean",
                                                        "description": "Indicates whether emojis in a text field should be escaped into the colon emoji format."
                                                    }
                                                }
                                            }
                                        },
                                        "description": "Confirm modal that will be shown just before triggering block interaction. User will be prompted to confirm the action."
                                    }
                                }
                            },
                            {
                                "title": "BlockDynamicSelectMenu",
                                "required": [
                                    "placeholder",
                                    "type"
                                ],
                                "type": "object",
                                "properties": {
                                    "type": {
                                        "type": "string",
                                        "enum": [
                                            "dynamic_select_menu"
                                        ]
                                    },
                                    "placeholder": {
                                        "title": "BlockTextElement75",
                                        "required": [
                                            "text",
                                            "type"
                                        ],
                                        "type": "object",
                                        "properties": {
                                            "type": {
                                                "type": "string",
                                                "enum": [
                                                    "plain_text"
                                                ]
                                            },
                                            "text": {
                                                "maxLength": 75,
                                                "type": "string"
                                            },
                                            "emoji": {
                                                "type": "boolean",
                                                "description": "Indicates whether emojis in a text field should be escaped into the colon emoji format."
                                            }
                                        }
                                    },
                                    "onAction": {
                                        "type": "string",
                                        "description": "Action identifier defined by addon (controlled and used on addon side)."
                                    },
                                    "min_query_length": {
                                        "minimum": 1,
                                        "type": "number",
                                        "description": "Minimum length of user query term (in select menu bar) that will trigger block interaction."
                                    },
                                    "initial_option": {
                                        "description": "Initial option that will be shown in select menu. Type depends on 'options' and 'options_groups' that will be dynamically provided.",
                                        "oneOf": [
                                            {
                                                "title": "Option",
                                                "required": [
                                                    "text",
                                                    "value"
                                                ],
                                                "type": "object",
                                                "properties": {
                                                    "text": {
                                                        "title": "BlockTextElement75",
                                                        "required": [
                                                            "text",
                                                            "type"
                                                        ],
                                                        "type": "object",
                                                        "properties": {
                                                            "type": {
                                                                "type": "string",
                                                                "enum": [
                                                                    "plain_text"
                                                                ]
                                                            },
                                                            "text": {
                                                                "maxLength": 75,
                                                                "type": "string"
                                                            },
                                                            "emoji": {
                                                                "type": "boolean",
                                                                "description": "Indicates whether emojis in a text field should be escaped into the colon emoji format."
                                                            }
                                                        }
                                                    },
                                                    "value": {
                                                        "maxLength": 100,
                                                        "type": "string",
                                                        "description": "A unique string value that will be passed to addon when this option is chosen."
                                                    },
                                                    "description": {
                                                        "title": "BlockTextElement75",
                                                        "required": [
                                                            "text",
                                                            "type"
                                                        ],
                                                        "type": "object",
                                                        "properties": {
                                                            "type": {
                                                                "type": "string",
                                                                "enum": [
                                                                    "plain_text"
                                                                ]
                                                            },
                                                            "text": {
                                                                "maxLength": 75,
                                                                "type": "string"
                                                            },
                                                            "emoji": {
                                                                "type": "boolean",
                                                                "description": "Indicates whether emojis in a text field should be escaped into the colon emoji format."
                                                            }
                                                        }
                                                    }
                                                }
                                            },
                                            {
                                                "title": "OptionGroup",
                                                "required": [
                                                    "label",
                                                    "options"
                                                ],
                                                "type": "object",
                                                "properties": {
                                                    "label": {
                                                        "title": "BlockTextElement75",
                                                        "required": [
                                                            "text",
                                                            "type"
                                                        ],
                                                        "type": "object",
                                                        "properties": {
                                                            "type": {
                                                                "type": "string",
                                                                "enum": [
                                                                    "plain_text"
                                                                ]
                                                            },
                                                            "text": {
                                                                "maxLength": 75,
                                                                "type": "string"
                                                            },
                                                            "emoji": {
                                                                "type": "boolean",
                                                                "description": "Indicates whether emojis in a text field should be escaped into the colon emoji format."
                                                            }
                                                        }
                                                    },
                                                    "options": {
                                                        "maxItems": 100,
                                                        "type": "array",
                                                        "items": {
                                                            "title": "Option",
                                                            "required": [
                                                                "text",
                                                                "value"
                                                            ],
                                                            "type": "object",
                                                            "properties": {
                                                                "text": {
                                                                    "title": "BlockTextElement75",
                                                                    "required": [
                                                                        "text",
                                                                        "type"
                                                                    ],
                                                                    "type": "object",
                                                                    "properties": {
                                                                        "type": {
                                                                            "type": "string",
                                                                            "enum": [
                                                                                "plain_text"
                                                                            ]
                                                                        },
                                                                        "text": {
                                                                            "maxLength": 75,
                                                                            "type": "string"
                                                                        },
                                                                        "emoji": {
                                                                            "type": "boolean",
                                                                            "description": "Indicates whether emojis in a text field should be escaped into the colon emoji format."
                                                                        }
                                                                    }
                                                                },
                                                                "value": {
                                                                    "maxLength": 100,
                                                                    "type": "string",
                                                                    "description": "A unique string value that will be passed to addon when this option is chosen."
                                                                },
                                                                "description": {
                                                                    "title": "BlockTextElement75",
                                                                    "required": [
                                                                        "text",
                                                                        "type"
                                                                    ],
                                                                    "type": "object",
                                                                    "properties": {
                                                                        "type": {
                                                                            "type": "string",
                                                                            "enum": [
                                                                                "plain_text"
                                                                            ]
                                                                        },
                                                                        "text": {
                                                                            "maxLength": 75,
                                                                            "type": "string"
                                                                        },
                                                                        "emoji": {
                                                                            "type": "boolean",
                                                                            "description": "Indicates whether emojis in a text field should be escaped into the colon emoji format."
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        ]
                                    },
                                    "confirm": {
                                        "title": "Confirm",
                                        "type": "object",
                                        "properties": {
                                            "title": {
                                                "title": "BlockTextElement75",
                                                "required": [
                                                    "text",
                                                    "type"
                                                ],
                                                "type": "object",
                                                "properties": {
                                                    "type": {
                                                        "type": "string",
                                                        "enum": [
                                                            "plain_text"
                                                        ]
                                                    },
                                                    "text": {
                                                        "maxLength": 75,
                                                        "type": "string"
                                                    },
                                                    "emoji": {
                                                        "type": "boolean",
                                                        "description": "Indicates whether emojis in a text field should be escaped into the colon emoji format."
                                                    }
                                                }
                                            },
                                            "text": {
                                                "title": "BlockTextElement300",
                                                "required": [
                                                    "text",
                                                    "type"
                                                ],
                                                "type": "object",
                                                "properties": {
                                                    "type": {
                                                        "type": "string",
                                                        "enum": [
                                                            "plain_text"
                                                        ]
                                                    },
                                                    "text": {
                                                        "maxLength": 300,
                                                        "type": "string"
                                                    },
                                                    "emoji": {
                                                        "type": "boolean",
                                                        "description": "Indicates whether emojis in a text field should be escaped into the colon emoji format."
                                                    }
                                                }
                                            },
                                            "accept": {
                                                "title": "BlockTextElement75",
                                                "required": [
                                                    "text",
                                                    "type"
                                                ],
                                                "type": "object",
                                                "properties": {
                                                    "type": {
                                                        "type": "string",
                                                        "enum": [
                                                            "plain_text"
                                                        ]
                                                    },
                                                    "text": {
                                                        "maxLength": 75,
                                                        "type": "string"
                                                    },
                                                    "emoji": {
                                                        "type": "boolean",
                                                        "description": "Indicates whether emojis in a text field should be escaped into the colon emoji format."
                                                    }
                                                }
                                            },
                                            "deny": {
                                                "title": "BlockTextElement75",
                                                "required": [
                                                    "text",
                                                    "type"
                                                ],
                                                "type": "object",
                                                "properties": {
                                                    "type": {
                                                        "type": "string",
                                                        "enum": [
                                                            "plain_text"
                                                        ]
                                                    },
                                                    "text": {
                                                        "maxLength": 75,
                                                        "type": "string"
                                                    },
                                                    "emoji": {
                                                        "type": "boolean",
                                                        "description": "Indicates whether emojis in a text field should be escaped into the colon emoji format."
                                                    }
                                                }
                                            }
                                        },
                                        "description": "Confirm modal that will be shown just before triggering block interaction. User will be prompted to confirm the action."
                                    }
                                }
                            }
                        ]
                    }
                }
            },
            {
                "title": "BlockActions",
                "required": [
                    "elements",
                    "type"
                ],
                "type": "object",
                "properties": {
                    "type": {
                        "type": "string",
                        "description": "Actions block",
                        "enum": [
                            "actions"
                        ]
                    },
                    "elements": {
                        "type": "array",
                        "items": {
                            "oneOf": [
                                {
                                    "title": "BlockButton",
                                    "required": [
                                        "text",
                                        "type"
                                    ],
                                    "type": "object",
                                    "properties": {
                                        "type": {
                                            "type": "string",
                                            "enum": [
                                                "button"
                                            ]
                                        },
                                        "text": {
                                            "title": "BlockTextElement75",
                                            "required": [
                                                "text",
                                                "type"
                                            ],
                                            "type": "object",
                                            "properties": {
                                                "type": {
                                                    "type": "string",
                                                    "enum": [
                                                        "plain_text"
                                                    ]
                                                },
                                                "text": {
                                                    "maxLength": 75,
                                                    "type": "string"
                                                },
                                                "emoji": {
                                                    "type": "boolean",
                                                    "description": "Indicates whether emojis in a text field should be escaped into the colon emoji format."
                                                }
                                            }
                                        },
                                        "value": {
                                            "maxLength": 300,
                                            "type": "string",
                                            "description": "Any metadata defined by addon, will be part of payload object in request client -\u003E api -\u003E addon."
                                        },
                                        "url": {
                                            "type": "string",
                                            "description": "Url that will be opened in user's browser. Block interaction event will be triggered also."
                                        },
                                        "style": {
                                            "type": "string",
                                            "description": "'primary' | 'secondary' | 'warning' | 'danger'"
                                        },
                                        "onAction": {
                                            "type": "string",
                                            "description": "Action identifier defined by addon (controlled and used on addon side)."
                                        },
                                        "confirm": {
                                            "title": "Confirm",
                                            "type": "object",
                                            "properties": {
                                                "title": {
                                                    "title": "BlockTextElement75",
                                                    "required": [
                                                        "text",
                                                        "type"
                                                    ],
                                                    "type": "object",
                                                    "properties": {
                                                        "type": {
                                                            "type": "string",
                                                            "enum": [
                                                                "plain_text"
                                                            ]
                                                        },
                                                        "text": {
                                                            "maxLength": 75,
                                                            "type": "string"
                                                        },
                                                        "emoji": {
                                                            "type": "boolean",
                                                            "description": "Indicates whether emojis in a text field should be escaped into the colon emoji format."
                                                        }
                                                    }
                                                },
                                                "text": {
                                                    "title": "BlockTextElement300",
                                                    "required": [
                                                        "text",
                                                        "type"
                                                    ],
                                                    "type": "object",
                                                    "properties": {
                                                        "type": {
                                                            "type": "string",
                                                            "enum": [
                                                                "plain_text"
                                                            ]
                                                        },
                                                        "text": {
                                                            "maxLength": 300,
                                                            "type": "string"
                                                        },
                                                        "emoji": {
                                                            "type": "boolean",
                                                            "description": "Indicates whether emojis in a text field should be escaped into the colon emoji format."
                                                        }
                                                    }
                                                },
                                                "accept": {
                                                    "title": "BlockTextElement75",
                                                    "required": [
                                                        "text",
                                                        "type"
                                                    ],
                                                    "type": "object",
                                                    "properties": {
                                                        "type": {
                                                            "type": "string",
                                                            "enum": [
                                                                "plain_text"
                                                            ]
                                                        },
                                                        "text": {
                                                            "maxLength": 75,
                                                            "type": "string"
                                                        },
                                                        "emoji": {
                                                            "type": "boolean",
                                                            "description": "Indicates whether emojis in a text field should be escaped into the colon emoji format."
                                                        }
                                                    }
                                                },
                                                "deny": {
                                                    "title": "BlockTextElement75",
                                                    "required": [
                                                        "text",
                                                        "type"
                                                    ],
                                                    "type": "object",
                                                    "properties": {
                                                        "type": {
                                                            "type": "string",
                                                            "enum": [
                                                                "plain_text"
                                                            ]
                                                        },
                                                        "text": {
                                                            "maxLength": 75,
                                                            "type": "string"
                                                        },
                                                        "emoji": {
                                                            "type": "boolean",
                                                            "description": "Indicates whether emojis in a text field should be escaped into the colon emoji format."
                                                        }
                                                    }
                                                }
                                            },
                                            "description": "Confirm modal that will be shown just before triggering block interaction. User will be prompted to confirm the action."
                                        }
                                    }
                                },
                                {
                                    "title": "BlockStaticSelectMenu",
                                    "required": [
                                        "options",
                                        "placeholder",
                                        "type"
                                    ],
                                    "type": "object",
                                    "properties": {
                                        "type": {
                                            "type": "string",
                                            "enum": [
                                                "static_select_menu"
                                            ]
                                        },
                                        "placeholder": {
                                            "title": "BlockTextElement75",
                                            "required": [
                                                "text",
                                                "type"
                                            ],
                                            "type": "object",
                                            "properties": {
                                                "type": {
                                                    "type": "string",
                                                    "enum": [
                                                        "plain_text"
                                                    ]
                                                },
                                                "text": {
                                                    "maxLength": 75,
                                                    "type": "string"
                                                },
                                                "emoji": {
                                                    "type": "boolean",
                                                    "description": "Indicates whether emojis in a text field should be escaped into the colon emoji format."
                                                }
                                            }
                                        },
                                        "onAction": {
                                            "type": "string",
                                            "description": "Action identifier defined by addon (controlled and used on addon side)."
                                        },
                                        "options": {
                                            "maxItems": 100,
                                            "type": "array",
                                            "description": "Simple options list.",
                                            "items": {
                                                "title": "Option",
                                                "required": [
                                                    "text",
                                                    "value"
                                                ],
                                                "type": "object",
                                                "properties": {
                                                    "text": {
                                                        "title": "BlockTextElement75",
                                                        "required": [
                                                            "text",
                                                            "type"
                                                        ],
                                                        "type": "object",
                                                        "properties": {
                                                            "type": {
                                                                "type": "string",
                                                                "enum": [
                                                                    "plain_text"
                                                                ]
                                                            },
                                                            "text": {
                                                                "maxLength": 75,
                                                                "type": "string"
                                                            },
                                                            "emoji": {
                                                                "type": "boolean",
                                                                "description": "Indicates whether emojis in a text field should be escaped into the colon emoji format."
                                                            }
                                                        }
                                                    },
                                                    "value": {
                                                        "maxLength": 100,
                                                        "type": "string",
                                                        "description": "A unique string value that will be passed to addon when this option is chosen."
                                                    },
                                                    "description": {
                                                        "title": "BlockTextElement75",
                                                        "required": [
                                                            "text",
                                                            "type"
                                                        ],
                                                        "type": "object",
                                                        "properties": {
                                                            "type": {
                                                                "type": "string",
                                                                "enum": [
                                                                    "plain_text"
                                                                ]
                                                            },
                                                            "text": {
                                                                "maxLength": 75,
                                                                "type": "string"
                                                            },
                                                            "emoji": {
                                                                "type": "boolean",
                                                                "description": "Indicates whether emojis in a text field should be escaped into the colon emoji format."
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        },
                                        "option_groups": {
                                            "maxItems": 100,
                                            "type": "array",
                                            "description": "Nested options list where each option group is basically list of simple options. If defined, it takes precedence over the 'options' field.",
                                            "items": {
                                                "title": "OptionGroup",
                                                "required": [
                                                    "label",
                                                    "options"
                                                ],
                                                "type": "object",
                                                "properties": {
                                                    "label": {
                                                        "title": "BlockTextElement75",
                                                        "required": [
                                                            "text",
                                                            "type"
                                                        ],
                                                        "type": "object",
                                                        "properties": {
                                                            "type": {
                                                                "type": "string",
                                                                "enum": [
                                                                    "plain_text"
                                                                ]
                                                            },
                                                            "text": {
                                                                "maxLength": 75,
                                                                "type": "string"
                                                            },
                                                            "emoji": {
                                                                "type": "boolean",
                                                                "description": "Indicates whether emojis in a text field should be escaped into the colon emoji format."
                                                            }
                                                        }
                                                    },
                                                    "options": {
                                                        "maxItems": 100,
                                                        "type": "array",
                                                        "items": {
                                                            "title": "Option",
                                                            "required": [
                                                                "text",
                                                                "value"
                                                            ],
                                                            "type": "object",
                                                            "properties": {
                                                                "text": {
                                                                    "title": "BlockTextElement75",
                                                                    "required": [
                                                                        "text",
                                                                        "type"
                                                                    ],
                                                                    "type": "object",
                                                                    "properties": {
                                                                        "type": {
                                                                            "type": "string",
                                                                            "enum": [
                                                                                "plain_text"
                                                                            ]
                                                                        },
                                                                        "text": {
                                                                            "maxLength": 75,
                                                                            "type": "string"
                                                                        },
                                                                        "emoji": {
                                                                            "type": "boolean",
                                                                            "description": "Indicates whether emojis in a text field should be escaped into the colon emoji format."
                                                                        }
                                                                    }
                                                                },
                                                                "value": {
                                                                    "maxLength": 100,
                                                                    "type": "string",
                                                                    "description": "A unique string value that will be passed to addon when this option is chosen."
                                                                },
                                                                "description": {
                                                                    "title": "BlockTextElement75",
                                                                    "required": [
                                                                        "text",
                                                                        "type"
                                                                    ],
                                                                    "type": "object",
                                                                    "properties": {
                                                                        "type": {
                                                                            "type": "string",
                                                                            "enum": [
                                                                                "plain_text"
                                                                            ]
                                                                        },
                                                                        "text": {
                                                                            "maxLength": 75,
                                                                            "type": "string"
                                                                        },
                                                                        "emoji": {
                                                                            "type": "boolean",
                                                                            "description": "Indicates whether emojis in a text field should be escaped into the colon emoji format."
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        },
                                        "initial_option": {
                                            "description": "Initial option that will be shown in select menu. Type depends on 'options' and 'options_groups'.",
                                            "oneOf": [
                                                {
                                                    "title": "Option",
                                                    "required": [
                                                        "text",
                                                        "value"
                                                    ],
                                                    "type": "object",
                                                    "properties": {
                                                        "text": {
                                                            "title": "BlockTextElement75",
                                                            "required": [
                                                                "text",
                                                                "type"
                                                            ],
                                                            "type": "object",
                                                            "properties": {
                                                                "type": {
                                                                    "type": "string",
                                                                    "enum": [
                                                                        "plain_text"
                                                                    ]
                                                                },
                                                                "text": {
                                                                    "maxLength": 75,
                                                                    "type": "string"
                                                                },
                                                                "emoji": {
                                                                    "type": "boolean",
                                                                    "description": "Indicates whether emojis in a text field should be escaped into the colon emoji format."
                                                                }
                                                            }
                                                        },
                                                        "value": {
                                                            "maxLength": 100,
                                                            "type": "string",
                                                            "description": "A unique string value that will be passed to addon when this option is chosen."
                                                        },
                                                        "description": {
                                                            "title": "BlockTextElement75",
                                                            "required": [
                                                                "text",
                                                                "type"
                                                            ],
                                                            "type": "object",
                                                            "properties": {
                                                                "type": {
                                                                    "type": "string",
                                                                    "enum": [
                                                                        "plain_text"
                                                                    ]
                                                                },
                                                                "text": {
                                                                    "maxLength": 75,
                                                                    "type": "string"
                                                                },
                                                                "emoji": {
                                                                    "type": "boolean",
                                                                    "description": "Indicates whether emojis in a text field should be escaped into the colon emoji format."
                                                                }
                                                            }
                                                        }
                                                    }
                                                },
                                                {
                                                    "title": "OptionGroup",
                                                    "required": [
                                                        "label",
                                                        "options"
                                                    ],
                                                    "type": "object",
                                                    "properties": {
                                                        "label": {
                                                            "title": "BlockTextElement75",
                                                            "required": [
                                                                "text",
                                                                "type"
                                                            ],
                                                            "type": "object",
                                                            "properties": {
                                                                "type": {
                                                                    "type": "string",
                                                                    "enum": [
                                                                        "plain_text"
                                                                    ]
                                                                },
                                                                "text": {
                                                                    "maxLength": 75,
                                                                    "type": "string"
                                                                },
                                                                "emoji": {
                                                                    "type": "boolean",
                                                                    "description": "Indicates whether emojis in a text field should be escaped into the colon emoji format."
                                                                }
                                                            }
                                                        },
                                                        "options": {
                                                            "maxItems": 100,
                                                            "type": "array",
                                                            "items": {
                                                                "title": "Option",
                                                                "required": [
                                                                    "text",
                                                                    "value"
                                                                ],
                                                                "type": "object",
                                                                "properties": {
                                                                    "text": {
                                                                        "title": "BlockTextElement75",
                                                                        "required": [
                                                                            "text",
                                                                            "type"
                                                                        ],
                                                                        "type": "object",
                                                                        "properties": {
                                                                            "type": {
                                                                                "type": "string",
                                                                                "enum": [
                                                                                    "plain_text"
                                                                                ]
                                                                            },
                                                                            "text": {
                                                                                "maxLength": 75,
                                                                                "type": "string"
                                                                            },
                                                                            "emoji": {
                                                                                "type": "boolean",
                                                                                "description": "Indicates whether emojis in a text field should be escaped into the colon emoji format."
                                                                            }
                                                                        }
                                                                    },
                                                                    "value": {
                                                                        "maxLength": 100,
                                                                        "type": "string",
                                                                        "description": "A unique string value that will be passed to addon when this option is chosen."
                                                                    },
                                                                    "description": {
                                                                        "title": "BlockTextElement75",
                                                                        "required": [
                                                                            "text",
                                                                            "type"
                                                                        ],
                                                                        "type": "object",
                                                                        "properties": {
                                                                            "type": {
                                                                                "type": "string",
                                                                                "enum": [
                                                                                    "plain_text"
                                                                                ]
                                                                            },
                                                                            "text": {
                                                                                "maxLength": 75,
                                                                                "type": "string"
                                                                            },
                                                                            "emoji": {
                                                                                "type": "boolean",
                                                                                "description": "Indicates whether emojis in a text field should be escaped into the colon emoji format."
                                                                            }
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            ]
                                        },
                                        "confirm": {
                                            "title": "Confirm",
                                            "type": "object",
                                            "properties": {
                                                "title": {
                                                    "title": "BlockTextElement75",
                                                    "required": [
                                                        "text",
                                                        "type"
                                                    ],
                                                    "type": "object",
                                                    "properties": {
                                                        "type": {
                                                            "type": "string",
                                                            "enum": [
                                                                "plain_text"
                                                            ]
                                                        },
                                                        "text": {
                                                            "maxLength": 75,
                                                            "type": "string"
                                                        },
                                                        "emoji": {
                                                            "type": "boolean",
                                                            "description": "Indicates whether emojis in a text field should be escaped into the colon emoji format."
                                                        }
                                                    }
                                                },
                                                "text": {
                                                    "title": "BlockTextElement300",
                                                    "required": [
                                                        "text",
                                                        "type"
                                                    ],
                                                    "type": "object",
                                                    "properties": {
                                                        "type": {
                                                            "type": "string",
                                                            "enum": [
                                                                "plain_text"
                                                            ]
                                                        },
                                                        "text": {
                                                            "maxLength": 300,
                                                            "type": "string"
                                                        },
                                                        "emoji": {
                                                            "type": "boolean",
                                                            "description": "Indicates whether emojis in a text field should be escaped into the colon emoji format."
                                                        }
                                                    }
                                                },
                                                "accept": {
                                                    "title": "BlockTextElement75",
                                                    "required": [
                                                        "text",
                                                        "type"
                                                    ],
                                                    "type": "object",
                                                    "properties": {
                                                        "type": {
                                                            "type": "string",
                                                            "enum": [
                                                                "plain_text"
                                                            ]
                                                        },
                                                        "text": {
                                                            "maxLength": 75,
                                                            "type": "string"
                                                        },
                                                        "emoji": {
                                                            "type": "boolean",
                                                            "description": "Indicates whether emojis in a text field should be escaped into the colon emoji format."
                                                        }
                                                    }
                                                },
                                                "deny": {
                                                    "title": "BlockTextElement75",
                                                    "required": [
                                                        "text",
                                                        "type"
                                                    ],
                                                    "type": "object",
                                                    "properties": {
                                                        "type": {
                                                            "type": "string",
                                                            "enum": [
                                                                "plain_text"
                                                            ]
                                                        },
                                                        "text": {
                                                            "maxLength": 75,
                                                            "type": "string"
                                                        },
                                                        "emoji": {
                                                            "type": "boolean",
                                                            "description": "Indicates whether emojis in a text field should be escaped into the colon emoji format."
                                                        }
                                                    }
                                                }
                                            },
                                            "description": "Confirm modal that will be shown just before triggering block interaction. User will be prompted to confirm the action."
                                        }
                                    }
                                },
                                {
                                    "title": "BlockDynamicSelectMenu",
                                    "required": [
                                        "placeholder",
                                        "type"
                                    ],
                                    "type": "object",
                                    "properties": {
                                        "type": {
                                            "type": "string",
                                            "enum": [
                                                "dynamic_select_menu"
                                            ]
                                        },
                                        "placeholder": {
                                            "title": "BlockTextElement75",
                                            "required": [
                                                "text",
                                                "type"
                                            ],
                                            "type": "object",
                                            "properties": {
                                                "type": {
                                                    "type": "string",
                                                    "enum": [
                                                        "plain_text"
                                                    ]
                                                },
                                                "text": {
                                                    "maxLength": 75,
                                                    "type": "string"
                                                },
                                                "emoji": {
                                                    "type": "boolean",
                                                    "description": "Indicates whether emojis in a text field should be escaped into the colon emoji format."
                                                }
                                            }
                                        },
                                        "onAction": {
                                            "type": "string",
                                            "description": "Action identifier defined by addon (controlled and used on addon side)."
                                        },
                                        "min_query_length": {
                                            "minimum": 1,
                                            "type": "number",
                                            "description": "Minimum length of user query term (in select menu bar) that will trigger block interaction."
                                        },
                                        "initial_option": {
                                            "description": "Initial option that will be shown in select menu. Type depends on 'options' and 'options_groups' that will be dynamically provided.",
                                            "oneOf": [
                                                {
                                                    "title": "Option",
                                                    "required": [
                                                        "text",
                                                        "value"
                                                    ],
                                                    "type": "object",
                                                    "properties": {
                                                        "text": {
                                                            "title": "BlockTextElement75",
                                                            "required": [
                                                                "text",
                                                                "type"
                                                            ],
                                                            "type": "object",
                                                            "properties": {
                                                                "type": {
                                                                    "type": "string",
                                                                    "enum": [
                                                                        "plain_text"
                                                                    ]
                                                                },
                                                                "text": {
                                                                    "maxLength": 75,
                                                                    "type": "string"
                                                                },
                                                                "emoji": {
                                                                    "type": "boolean",
                                                                    "description": "Indicates whether emojis in a text field should be escaped into the colon emoji format."
                                                                }
                                                            }
                                                        },
                                                        "value": {
                                                            "maxLength": 100,
                                                            "type": "string",
                                                            "description": "A unique string value that will be passed to addon when this option is chosen."
                                                        },
                                                        "description": {
                                                            "title": "BlockTextElement75",
                                                            "required": [
                                                                "text",
                                                                "type"
                                                            ],
                                                            "type": "object",
                                                            "properties": {
                                                                "type": {
                                                                    "type": "string",
                                                                    "enum": [
                                                                        "plain_text"
                                                                    ]
                                                                },
                                                                "text": {
                                                                    "maxLength": 75,
                                                                    "type": "string"
                                                                },
                                                                "emoji": {
                                                                    "type": "boolean",
                                                                    "description": "Indicates whether emojis in a text field should be escaped into the colon emoji format."
                                                                }
                                                            }
                                                        }
                                                    }
                                                },
                                                {
                                                    "title": "OptionGroup",
                                                    "required": [
                                                        "label",
                                                        "options"
                                                    ],
                                                    "type": "object",
                                                    "properties": {
                                                        "label": {
                                                            "title": "BlockTextElement75",
                                                            "required": [
                                                                "text",
                                                                "type"
                                                            ],
                                                            "type": "object",
                                                            "properties": {
                                                                "type": {
                                                                    "type": "string",
                                                                    "enum": [
                                                                        "plain_text"
                                                                    ]
                                                                },
                                                                "text": {
                                                                    "maxLength": 75,
                                                                    "type": "string"
                                                                },
                                                                "emoji": {
                                                                    "type": "boolean",
                                                                    "description": "Indicates whether emojis in a text field should be escaped into the colon emoji format."
                                                                }
                                                            }
                                                        },
                                                        "options": {
                                                            "maxItems": 100,
                                                            "type": "array",
                                                            "items": {
                                                                "title": "Option",
                                                                "required": [
                                                                    "text",
                                                                    "value"
                                                                ],
                                                                "type": "object",
                                                                "properties": {
                                                                    "text": {
                                                                        "title": "BlockTextElement75",
                                                                        "required": [
                                                                            "text",
                                                                            "type"
                                                                        ],
                                                                        "type": "object",
                                                                        "properties": {
                                                                            "type": {
                                                                                "type": "string",
                                                                                "enum": [
                                                                                    "plain_text"
                                                                                ]
                                                                            },
                                                                            "text": {
                                                                                "maxLength": 75,
                                                                                "type": "string"
                                                                            },
                                                                            "emoji": {
                                                                                "type": "boolean",
                                                                                "description": "Indicates whether emojis in a text field should be escaped into the colon emoji format."
                                                                            }
                                                                        }
                                                                    },
                                                                    "value": {
                                                                        "maxLength": 100,
                                                                        "type": "string",
                                                                        "description": "A unique string value that will be passed to addon when this option is chosen."
                                                                    },
                                                                    "description": {
                                                                        "title": "BlockTextElement75",
                                                                        "required": [
                                                                            "text",
                                                                            "type"
                                                                        ],
                                                                        "type": "object",
                                                                        "properties": {
                                                                            "type": {
                                                                                "type": "string",
                                                                                "enum": [
                                                                                    "plain_text"
                                                                                ]
                                                                            },
                                                                            "text": {
                                                                                "maxLength": 75,
                                                                                "type": "string"
                                                                            },
                                                                            "emoji": {
                                                                                "type": "boolean",
                                                                                "description": "Indicates whether emojis in a text field should be escaped into the colon emoji format."
                                                                            }
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            ]
                                        },
                                        "confirm": {
                                            "title": "Confirm",
                                            "type": "object",
                                            "properties": {
                                                "title": {
                                                    "title": "BlockTextElement75",
                                                    "required": [
                                                        "text",
                                                        "type"
                                                    ],
                                                    "type": "object",
                                                    "properties": {
                                                        "type": {
                                                            "type": "string",
                                                            "enum": [
                                                                "plain_text"
                                                            ]
                                                        },
                                                        "text": {
                                                            "maxLength": 75,
                                                            "type": "string"
                                                        },
                                                        "emoji": {
                                                            "type": "boolean",
                                                            "description": "Indicates whether emojis in a text field should be escaped into the colon emoji format."
                                                        }
                                                    }
                                                },
                                                "text": {
                                                    "title": "BlockTextElement300",
                                                    "required": [
                                                        "text",
                                                        "type"
                                                    ],
                                                    "type": "object",
                                                    "properties": {
                                                        "type": {
                                                            "type": "string",
                                                            "enum": [
                                                                "plain_text"
                                                            ]
                                                        },
                                                        "text": {
                                                            "maxLength": 300,
                                                            "type": "string"
                                                        },
                                                        "emoji": {
                                                            "type": "boolean",
                                                            "description": "Indicates whether emojis in a text field should be escaped into the colon emoji format."
                                                        }
                                                    }
                                                },
                                                "accept": {
                                                    "title": "BlockTextElement75",
                                                    "required": [
                                                        "text",
                                                        "type"
                                                    ],
                                                    "type": "object",
                                                    "properties": {
                                                        "type": {
                                                            "type": "string",
                                                            "enum": [
                                                                "plain_text"
                                                            ]
                                                        },
                                                        "text": {
                                                            "maxLength": 75,
                                                            "type": "string"
                                                        },
                                                        "emoji": {
                                                            "type": "boolean",
                                                            "description": "Indicates whether emojis in a text field should be escaped into the colon emoji format."
                                                        }
                                                    }
                                                },
                                                "deny": {
                                                    "title": "BlockTextElement75",
                                                    "required": [
                                                        "text",
                                                        "type"
                                                    ],
                                                    "type": "object",
                                                    "properties": {
                                                        "type": {
                                                            "type": "string",
                                                            "enum": [
                                                                "plain_text"
                                                            ]
                                                        },
                                                        "text": {
                                                            "maxLength": 75,
                                                            "type": "string"
                                                        },
                                                        "emoji": {
                                                            "type": "boolean",
                                                            "description": "Indicates whether emojis in a text field should be escaped into the colon emoji format."
                                                        }
                                                    }
                                                }
                                            },
                                            "description": "Confirm modal that will be shown just before triggering block interaction. User will be prompted to confirm the action."
                                        }
                                    }
                                }
                            ]
                        }
                    }
                }
            }
        ]
    }
};
