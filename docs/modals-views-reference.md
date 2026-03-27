# Modals & Views

Pumble's modals and views allow apps to create rich, interactive user interfaces beyond simple messages.

## Modal

| name          | type                                | optional | description                                                                                                                                                                     |
|:--------------|:------------------------------------|----------|:--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| id            | String                              | true     | Modal ID, output only.                                                                                                                                                          |
| type          | String                              | false    | The type on modal. In this case it is always `MODAL`.                                                                                                                           |
| blocks        | [MainBlock](/blocks)[]              | false    | Definition of modal's content and layout. Can include `rich_text`, `input`, `actions`, `section` and `divider` blocks.                                                          |
| title         | [TextElement](/blocks#text-element) | false    | A text object that defines the modal's title. Max length for the text field in this object is 75 characters.                                                                    |
| state         | [State](#state)                     | true     | Object containing values of modal input fields (only `input` blocks contribute to state).                                                                                       |
| callbackId    | String                              | false    | Modal unique identifier that is used for routing submit and close events to the correct handlers. Handler names must match this value.                                          |
| submit        | [TextElement](/blocks#text-element) | true     | A text object that defines the text of modal's submit button. Max length for the text field in this object is 75 characters. If omitted, a default submit button will be shown. |
| close         | [TextElement](/blocks#text-element) | true     | A text object that defines the text of modal's close button. Max length for the text field in this object is 75 characters. If omitted, a default close button will be shown.   |
| notifyOnClose | Boolean                             | false    | Specifies if the `onClose` handler should be triggered, when the modal is dismissed without submission.                                                                         |
| parentViewId  | String                              | true     | ID of the parent modal in a modal stack, from which the current modal is spawned.                                                                                               |

<details>
<summary>Modal example</summary>

```json
{
    "type": "MODAL",
    "title": {
        "type": "plain_text",
        "text": "My First Modal"
    },
    "callbackId": "modal_callback",
    "submit": {
        "type": "text",
        "text": "Submit!"
    },
    "close": {
        "type": "text",
        "text": "Cancel"
    },
    "notifyOnClose": true,
    "blocks": [
        {
            "type": "rich_text",
            "elements": [
                {
                    "type": "rich_text_section",
                    "elements": [
                        {
                            "type": "text",
                            "text": "Welcome to this modal!"
                        }
                    ]
                }
            ]
        },
        {
            "type": "input",
            "blockId": "input_1",
            "label": {
                "text": "Select Menu Input field",
                "type": "plain_text"
            },
            "element": {
                "type": "static_select_menu",
                "placeholder": {
                    "text": "Select an option",
                    "type": "plain_text"
                },
                "onAction": "on_static_select_menu",
                "options": [
                    {
                        "text": {
                            "type": "plain_text",
                            "text": "Option 1"
                        },
                        "value": "1"
                    },
                    {
                        "text": {
                            "type": "plain_text",
                            "text": "Option 2"
                        },
                        "value": "2"
                    }
                ]
            }
        },
        {
            "type": "input",
            "blockId": "input_2",
            "label": {
                "text": "Date Range Input field",
                "type": "plain_text"
            },
            "element": {
                "type": "date_range_picker",
                "onAction": "on_date_range_picked"
            }
        }
    ],
    "state": {
        "values": {
            "input_1": {
                "on_static_select_menu": {
                    "type": "static_select_menu",
                    "value": "2"
                }
            },
            "input_2": {
                "on_date_range_picked": {
                    "type": "date_range_picker",
                    "values": ["2026-01-01", "2026-01-01"]
                }
            }
        }
    }
}
```

</details>

## Home view

| name   | type                                | optional | description                                                                                                                |
|:-------|:------------------------------------|----------|:---------------------------------------------------------------------------------------------------------------------------|
| id     | String                              | true     | Home view ID, output only.                                                                                                 |
| type   | String                              | false    | The type of modal. In this case it is always `HOME`                                                                        |
| blocks | [MainBlock](/blocks)[]              | false    | Definition of home view's content and layout. Can include `rich_text`, `input`, `actions`, `section` and `divider` blocks. |
| title  | [TextElement](/blocks#text-element) | false    | A text object that defines the home view's title. Max length for the text field in this object is 75 characters.           |
| state  | [State](#state)                     | true     | Object containing values of home view input fields (only `input` blocks contribute to state).                              |

<details>
<summary>Home View example</summary>

```json

{
    "title": {
        "type": "plain_text",
        "text": "My Home View"
    },
    "blocks": [
        {
            "type": "rich_text",
            "elements": [
                {
                    "type": "rich_text_section",
                    "elements": [
                        {
                            "type": "text",
                            "text": "Hello there "
                        },
                        {
                            "type": "emoji",
                            "name": "wave",
                            "skin_tone": 1
                        }
                    ]
                }
            ]
        },
        {
            "type": "actions",
            "elements": [
                {
                    "type": "button",
                    "onAction": "on_button_clicked",
                    "value": "test metadata",
                    "text": {
                        "type": "plain_text",
                        "text": "Click here!"
                    },
                    "style": "secondary"
                }
            ]
        }
    ]
}
```

</details>

## Storage Integration

Storage integration modals are special modals that allow users to select externally stored files and send them in a Pumble channel.
Currently, opening a Google Drive file picker modal in Pumble is supported. It will allow users to select a file from Google Drive, and send its link to a Pumble channel.

### Google Drive integration modal

| name              | type   | optional | description                 |
|:------------------|:-------|----------|:----------------------------|
| googleAccessToken | String | fasle    | User's Google access token  |
| googleAppId       | String | false    | Google Cloud Project number |
| googleApiKey      | String | false    | Google API Key              |
| googleClientId    | String | false    | Google OAuth 2.0 Client ID  |

### State

Modal state is a nested object that maps input block's `blockId` and its element's `onAction` to the specified value(s):

```typescript
values: {
    [key: string]: {  // input element's blockId value
        [key: string]: {  // actionable element's onAction value
            type: "button" | "static_select_menu" | "dynamic_select_menu" | "plain_text_input" | "date_picker";
            value: string;
        } | {
            type: "checkboxes" | "date_range_picker";
            values: string[];
        }
    }
}
```

## ViewBuilder

ViewBuilder is a utility class, that helps with modification of View objects (modals and home views).

BlockInteractionContext and ViewActionContext contain a method that creates a ViewBuilder instance, from a given view.
Then, it is possible to call methods on the ViewBuilder instance to modify view properties (blocks, state, title...), and to build the final view object.

ViewBuilder contains the following methods:

| name                | type                                                           | description                                                                                            |
|:--------------------|:---------------------------------------------------------------|:-------------------------------------------------------------------------------------------------------|
| updateBlocks        | (blocks: [MainBlock](/blocks)[]) => ViewBuilder                | Replaces the existing view blocks with the new ones.                                                   |
| appendBlocks        | (blocks: [MainBlock](/blocks)[]) => ViewBuilder                | Appends the new blocks to the existing view blocks.                                                    |
| prependBlocks       | (blocks: [MainBlock](/blocks)[]) => ViewBuilder                | Prepends the new blocks to the existing view blocks.                                                   |
| insertBlocksAt      | (index: Number, blocks: [MainBlock](/blocks)[]) => ViewBuilder | Inserts the new blocks starting from the specified index into the existing blocks.                     |
| removeBlockAt       | (index: Number) => ViewBuilder                                 | Removes a block at the specified index from the existing view blocks.                                  |
| removeBlocksAt      | (index: Number, deleteCount: Number) => ViewBuilder            | Removes the specified number of blocks, starting at the specified index from the existing view blocks. |
| updateState         | (state: [State](#state)) => ViewBuilder                        | Replaces the existing view state with the new one.                                                     |
| updateTitle         | (title: [TextElement](/blocks#text-element)) => ViewBuilder    | Replaces the existing view title with the new one.                                                     |
| updateCallbackId    | (callbackId: String) => ViewBuilder                            | Changes the value of view's callback ID.                                                               |
| updateNotifyOnClose | (notifyOnClose: Boolean) => ViewBuilder                        | Changes the value that indicates if an action should be displatched when the view is closed.           |
| updateSubmit        | (submit: [TextElement](/blocks#text-element)) => ViewBuilder   | Changes the content of view's submit button.                                                           |
| removeSubmit        | () => ViewBuilder                                              | Removes submit button from the view.                                                                   |
| updateClose         | (close: [TextElement](/blocks#text-element)) => ViewBuilder    | Changes the content of view's close button.                                                            |
| removeClose         | () => ViewBuilder                                              | Removes submit close from the view.                                                                    |
| build               | () => [Modal](#modal) \| [HomeView](#home-view)                | Returns the final view object.                                                                         |

For more information about modals and views, visit [Modals & Views guide](/modals-views) and take a look at [interactivity-examples](https://github.com/CAKE-com/pumble-node-sdk/tree/master/examples/interactivity).