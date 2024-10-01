// DO NOT CHANGE THIS MANUALLY
// this is part of the PumbleAPI schema (BlockActions subschema) so it should be compatible with it or exactly the same
export const attachmentActionsBlock = {
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
        "blockId": {
            "maxLength": 100,
            "type": "string"
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
                            "blockId": {
                                "maxLength": 100,
                                "type": "string"
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
                                },
                                "additionalProperties": false
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
                                "description": "'primary' | 'secondary' | 'warning' | 'danger'",
                                "enum": [
                                    "primary",
                                    "secondary",
                                    "warning",
                                    "danger"
                                ]
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
                                        },
                                        "additionalProperties": false
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
                                        },
                                        "additionalProperties": false
                                    },
                                    "confirm": {
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
                                        },
                                        "additionalProperties": false
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
                                        },
                                        "additionalProperties": false
                                    },
                                    "style": {
                                        "type": "string",
                                        "description": "'primary' | 'secondary' | 'warning' | 'danger'",
                                        "enum": [
                                            "primary",
                                            "secondary",
                                            "warning",
                                            "danger"
                                        ]
                                    }
                                },
                                "additionalProperties": false,
                                "description": "Confirm modal that will be shown just before triggering block interaction. User will be prompted to confirm the action."
                            }
                        },
                        "additionalProperties": false
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
                            "blockId": {
                                "maxLength": 100,
                                "type": "string"
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
                                },
                                "additionalProperties": false
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
                                            },
                                            "additionalProperties": false
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
                                            },
                                            "additionalProperties": false
                                        }
                                    },
                                    "additionalProperties": false
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
                                            },
                                            "additionalProperties": false
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
                                                        },
                                                        "additionalProperties": false
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
                                                        },
                                                        "additionalProperties": false
                                                    }
                                                },
                                                "additionalProperties": false
                                            }
                                        }
                                    },
                                    "additionalProperties": false
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
                                                },
                                                "additionalProperties": false
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
                                                },
                                                "additionalProperties": false
                                            }
                                        },
                                        "additionalProperties": false
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
                                                },
                                                "additionalProperties": false
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
                                                            },
                                                            "additionalProperties": false
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
                                                            },
                                                            "additionalProperties": false
                                                        }
                                                    },
                                                    "additionalProperties": false
                                                }
                                            }
                                        },
                                        "additionalProperties": false
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
                                        },
                                        "additionalProperties": false
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
                                        },
                                        "additionalProperties": false
                                    },
                                    "confirm": {
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
                                        },
                                        "additionalProperties": false
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
                                        },
                                        "additionalProperties": false
                                    },
                                    "style": {
                                        "type": "string",
                                        "description": "'primary' | 'secondary' | 'warning' | 'danger'",
                                        "enum": [
                                            "primary",
                                            "secondary",
                                            "warning",
                                            "danger"
                                        ]
                                    }
                                },
                                "additionalProperties": false,
                                "description": "Confirm modal that will be shown just before triggering block interaction. User will be prompted to confirm the action."
                            }
                        },
                        "additionalProperties": false
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
                            "blockId": {
                                "maxLength": 100,
                                "type": "string"
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
                                },
                                "additionalProperties": false
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
                                                },
                                                "additionalProperties": false
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
                                                },
                                                "additionalProperties": false
                                            }
                                        },
                                        "additionalProperties": false
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
                                                },
                                                "additionalProperties": false
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
                                                            },
                                                            "additionalProperties": false
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
                                                            },
                                                            "additionalProperties": false
                                                        }
                                                    },
                                                    "additionalProperties": false
                                                }
                                            }
                                        },
                                        "additionalProperties": false
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
                                        },
                                        "additionalProperties": false
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
                                        },
                                        "additionalProperties": false
                                    },
                                    "confirm": {
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
                                        },
                                        "additionalProperties": false
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
                                        },
                                        "additionalProperties": false
                                    },
                                    "style": {
                                        "type": "string",
                                        "description": "'primary' | 'secondary' | 'warning' | 'danger'",
                                        "enum": [
                                            "primary",
                                            "secondary",
                                            "warning",
                                            "danger"
                                        ]
                                    }
                                },
                                "additionalProperties": false,
                                "description": "Confirm modal that will be shown just before triggering block interaction. User will be prompted to confirm the action."
                            }
                        },
                        "additionalProperties": false
                    }
                ]
            }
        }
    },
    "additionalProperties": false
};