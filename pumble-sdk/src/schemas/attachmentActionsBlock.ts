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
                                        "type": "boolean"
                                    }
                                }
                            },
                            "value": {
                                "maxLength": 300,
                                "type": "string"
                            },
                            "url": {
                                "type": "string"
                            },
                            "style": {
                                "type": "string"
                            },
                            "onAction": {
                                "type": "string"
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
                                                "type": "boolean"
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
                                                "type": "boolean"
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
                                                "type": "boolean"
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
                                                "type": "boolean"
                                            }
                                        }
                                    }
                                }
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
                                        "type": "boolean"
                                    }
                                }
                            },
                            "onAction": {
                                "type": "string"
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
                                                    "type": "boolean"
                                                }
                                            }
                                        },
                                        "value": {
                                            "maxLength": 100,
                                            "type": "string"
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
                                                    "type": "boolean"
                                                }
                                            }
                                        }
                                    }
                                }
                            },
                            "option_groups": {
                                "maxItems": 100,
                                "type": "array",
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
                                                    "type": "boolean"
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
                                                                "type": "boolean"
                                                            }
                                                        }
                                                    },
                                                    "value": {
                                                        "maxLength": 100,
                                                        "type": "string"
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
                                                                "type": "boolean"
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
                                                        "type": "boolean"
                                                    }
                                                }
                                            },
                                            "value": {
                                                "maxLength": 100,
                                                "type": "string"
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
                                                        "type": "boolean"
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
                                                        "type": "boolean"
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
                                                                    "type": "boolean"
                                                                }
                                                            }
                                                        },
                                                        "value": {
                                                            "maxLength": 100,
                                                            "type": "string"
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
                                                                    "type": "boolean"
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
                                                "type": "boolean"
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
                                                "type": "boolean"
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
                                                "type": "boolean"
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
                                                "type": "boolean"
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
}