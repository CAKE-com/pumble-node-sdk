# Blocks

### Quick message overview

Pumble messages comprise both `text` and `blocks`. The `blocks` array contains JSON data, which is rendered according to predefined parsing rules.
When valid blocks are provided, Pumble uses them to render the message.
If block parsing fails or if no blocks are present, Pumble displays the fallback text defined in the `text` field.

### Quick modals overview

Content and UI layout of Pumble modals is defined using `blocks`. 
Just like messages, modals can contain rich text and actionable elements (buttons, select menus, etc.). 
However, modals can also contain input fields, that gather data from users, so that it can become a part of the modal state.

## Block types

Each block contains a `type` field that determines the block's type and, consequently, how the block will be parsed.
Here is the overview of top-level Pumble blocks:

| name                          | description                                     | available in                 |
|:------------------------------|:------------------------------------------------|:-----------------------------|
| [Rich Text](#rich-text-block) | cjsdckjsncjds cskjdncjskdnc                     | Messages, Modals, Home views |
| [Actions](#actions-block)     | block that contains actionable elements         | Messages, Modals, Home views |
| [Input](#input-block)         | block that allows user input                    | Modals, Home views           |
| [Section](#section-block)     | block that contains text and actionable element | Modals, Home views           |
| [Divider](#divider-block)     | Visual separator for other top-level blocks     | Messages, Modals, Home views |


## Rich Text Block

Rich text represents one or more lines of text, depending on its content. Each new section must start in a new line, regardless of what the section before it was.
Text can be formatted using the `rich_text` block type, which includes an array of `elements` containing various sections and components of rich text.
Rich Text Blocks are available in messages, modals and home views.

| name     | type     | required | description                                                                                                                                                                                                 |
|:---------|:---------|:---------|:------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| type     | String   | true     | Block type. In this case, it is always `rich_text`.                                                                                                                                                         |
| elements | Object[] | true     | An array of section blocks, which can be the following: [Rich Text Section](#rich-text-section), [Code Block Section](#code-block-section), [Quote Section](#quote-section), [List Section](#list-section). |

<details>
<summary>Basic Rich Text Block example</summary>

```json
[
    {
        "type": "rich_text",
        "elements": [
            {
                "type": "rich_text_section",
                "elements": [
                    {
                        "type": "text",
                        "text": "Simple text"
                    }
                ]
            }
        ]
    }
]
```
</details>

### Rich Text Section

| name     | type     | required | description                                                                                                                                                                                                                                                                                                                                            |
|:---------|:---------|:---------|:-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| type     | String   | true     | Block type. In this case, it is always `rich_text_section`.                                                                                                                                                                                                                                                                                            |
| elements | Object[] | true     | An array of rich text elements, which can be the following: [Text Block](#text-block), [User Mention Block](#user-mention-block), [Channel Mention Block](#channel-mention-block), [User Group Mention Block](#user-group-mention-block), [Broadcast Mention Block](#broadcast-mention-block), [Link Block](#link-block), [Emoji Block](#emoji-block). |

#### Text Block

| name     | type                     | required | description                                                                                                                              |
|:---------|:-------------------------|:---------|:-----------------------------------------------------------------------------------------------------------------------------------------|
| type     | String                   | true     | Block type. In this case, it is always `text`.                                                                                           |
| text     | String                   | true     | Text content.                                                                                                                            |
| size     | Integer                  | false    | Text size. Possible values are: `1`, `2`, `3` (where `1` is the smallest and `3` is the largest).                                        |
| style    | [TextStyle](#text-style) | false    | Object that defines how the text will be styled. Allows text to be formatted as **bold**, *italic*, ~~strikethrough~~ and `inline code`. |
| unlinked | Boolean                  | false    | Indicates that a link inside the text block should be displayed as plain text.                                                           |

<details>
<summary>Text Block example</summary>

```json
{
    "type": "text",
    "text": "Hello World!",
    "style": {
        "bold": "true"
    }
}
```
</details>

#### User Mention Block

| name    | type   | required | description                                    |
|:--------|:-------|:---------|:-----------------------------------------------|
| type    | String | true     | Block type. In this case, it is always `user`. |
| user_id | String | true     | ID of the mentioned user.                      |

<details>
<summary>User Mention Block example</summary>

```json
{
    "type": "user",
    "user_id": "6965ed9a6790becb7e38675b"
}
```

Results in: `@John Doe`
</details>

#### Channel Mention Block

| name       | type   | required | description                                       |
|:-----------|:-------|:---------|:--------------------------------------------------|
| type       | String | true     | Block type. In this case, it is always `channel`. |
| channel_id | String | true     | ID of the mentioned channel.                      |

<details>
<summary>Channel Mention Block example</summary>

```json
{
    "type": "channel",
    "user_id": "6965ed9a6790becb7e38675c"
}
```

Results in: `#general`
</details>

#### User Group Mention Block

| name         | type   | required | description                                         |
|:-------------|:-------|:---------|:----------------------------------------------------|
| type         | String | true     | Block type. In this case, it is always `usergroup`. |
| usergroup_id | String | true     | ID of the mentioned user group.                     |

<details>
<summary>User Group Mention Block example</summary>

```json
{
    "type": "user",
    "usergroup_id": "6965ed9a6790becb7e38675e"
}
```

Results in: `@backend-engineers`
</details>

#### Broadcast Mention Block

| name  | type   | required | description                                                                                   |
|:------|:-------|:---------|:----------------------------------------------------------------------------------------------|
| type  | String | true     | Block type. In this case, it is always `broadcast`.                                           |
| range | String | true     | Corresponds to `@here` and `@channel` Pumble mentions. Possible values are `here`, `channel`. |

<details>
<summary>Broadcast Mention Block example</summary>

```json
{
    "type": "broadcast",
    "range": "here"
}
```

Results in: `@here`
</details>

#### Link Block

| name  | type                     | required | default | description                                                                                |
|:------|:-------------------------|:---------|:--------|:-------------------------------------------------------------------------------------------|
| type  | String                   | true     | -       | Block type. In this case, it is always `link`.                                             |
| url   | String                   | true     | -       | Link URL. If link is an email, it should be prefixed with `mailto: `.                      |
| text  | String                   | false    | -       | Link text. If present, link will be displayed as a hyperlink.                              |
| raw   | Boolean                  | false    | -       | If true, indicates that the link is not a hyperlink.                                       |
| size  | Integer                  | false    | 1       | Text size of the link. Possible values are: `1`, `2`, `3` (smallest to largest text size). |
| style | [TextStyle](#text-style) | false    | -       | Style of the link text.                                                                    |

<details>
<summary>Link Block example - Raw link</summary>

```json
{
    "type": "link",
    "url": "https://github.com/CAKE-com/pumble-node-sdk",
    "style": {
        "italic": true
    }
}
```

Results in: *https://github.com/CAKE-com/pumble-node-sdk*
</details>

<details>
<summary>Link Block example - Hyperlink</summary>

```json
{
    "type": "link",
    "url": "https://github.com/CAKE-com/pumble-node-sdk",
    "text": "Pumble Node SDK",
    "style": {
        "bold": true,
        "code": true
    }
}
```

Results in: [**`Pumble Node SDK`**](https://github.com/CAKE-com/pumble-node-sdk)
</details>

<details>
<summary>Link Block example - Email</summary>

```json
{
    "type": "link",
    "url": "mailto:support@pumble.com"
}
```

Results in: [support@pumble.com](mailto:support@pumble.com)
</details>

<details>
<summary>Link Block inside Rich Text Block example</summary>

```json
[
    {
        "type": "rich_text",
        "elements": [
            {
                "type": "rich_text_section",
                "elements": [
                    {
                        "type": "text",
                        "text": "For more info visit our "
                    },
                    {
                        "type": "link",
                        "text": "website",
                        "url": "https://pumble.com"
                    }
                ]
            }
        ]
    }
]
```

Results in: For more info visit our [website](https://pumble.com)
</details>

#### Emoji Block

| name      | type    | required | default | description                                                           |
|:----------|:--------|:---------|:--------|:----------------------------------------------------------------------|
| type      | String  | true     | -       | Block type. In this case, it is always `emoji`.                       |
| name      | String  | true     | -       | Alias for the emoji.                                                  |
| skin_tone | Integer | false    | -       | Value in range [1, 6] that represents emoji skin tone, if applicable. |

<details>
<summary>Emoji Block example</summary>

```json
{
    "type": "emoji",
    "name": "rocket"
}
```

Results in: :rocket:
</details>

<details>
<summary>Emoji Block inside Rich Text Block example</summary>

```json
{
    "type": "rich_text",
    "elements": [
        {
            "type": "rich_text_section",
            "elements": [
                {
                    "type": "emoji",
                    "name": "beers"
                }
            ]
        }
    ]
}
```

Results in: 🍻
</details>

##### Text Style

| name   | type    | description                                                       |
|:-------|:--------|:------------------------------------------------------------------|
| bold   | Boolean | Specifies if the displayed text should be **bolded**.             |
| italic | Boolean | Specifies if the displayed text should be *italic*.               |
| strike | Boolean | Specifies if the text should be displayed with ~strikethrough~.   |
| code   | Boolean | Specifies if the text should be displayed as `inline code block`. |


<details>
<summary>Rich Text Block with styled text example</summary>

```json
[
    {
        "type": "rich_text",
        "elements": [
            {
                "type": "rich_text_section",
                "elements": [
                    {
                        "type": "text",
                        "text": "bold",
                        "style": {
                            "bold": true
                        }
                    },
                    {
                        "type": "text",
                        "text": " "
                    },
                    {
                        "type": "text",
                        "text": "italic",
                        "style": {
                            "italic": true
                        }
                    },
                    {
                        "type": "text",
                        "text": " "
                    },
                    {
                        "type": "text",
                        "text": "strike",
                        "style": {
                            "strike": true
                        }
                    },
                    {
                        "type": "text",
                        "text": " "
                    },
                    {
                        "type": "text",
                        "text": "code",
                        "style": {
                            "code": true
                        }
                    },
                    {
                        "type": "text",
                        "text": " "
                    },
                    {
                        "type": "text",
                        "text": "all four",
                        "style": {
                            "bold": true,
                            "italic": true,
                            "strike": true,
                            "code": true
                        }
                    }
                ]
            }
        ]
    }
]
```

Results in: **bold** *italic* ~~strike~~ `code` ***~~all four~~***.
</details>

### Quote Section

Quote Section displays rich text elements as a quoted content, and it is an equivalent of Markdown blockquotes.
It can consist of the same rich text elements as [Rich Text Section](#rich-text-section). 
All styling options (**bold**, *italic*, ~~strikethrough~~ and `code block`) are also available within Quote Section.

| name     | type     | required | description                                                                                                                                                                                                                                                                                                                                           |
|:---------|:---------|:---------|:------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| type     | String   | true     | Block type. In this case, it is always `rich_text_quote`                                                                                                                                                                                                                                                                                              |
| elements | Object[] | true     | An array of rich text elements, which can be the following: [Text Block](#text-block), [User Mention Block](#user-mention-block), [Channel Mention Block](#channel-mention-block), [User Group Mention Block](#user-group-mention-block), [Broadcast Mention Block](#broadcast-mention-block), [Link Block](#link-block), [Emoji Block](#emoji-block) |

<details>
<summary>Quote Section example</summary>

```json
{
    "type": "rich_text_quote",
    "elements": [
        {
            "type": "text",
            "text": "Quote",
            "style": {
                "bold": true,
                "italic": true
            }
        },
        {
            "type": "text",
            "text": " with "
        },
        {
            "type": "broadcast",
            "range": "here"
        },
        {
            "type": "text",
            "text": " mention, and an emoji: "
        },
        {
            "type": "emoji",
            "name": "wave",
            "skin_tone": 1
        }
    ]
}
```

Results in: 
> ***Quote*** with @here mention, and an emoji: :wave:
</details>

### Code Block Section

Code Block Section allows display of text as a code block, without additional formatting.

It is available in messages, modals and home views.

| name     | type                        | required | description                                                      |
|:---------|:----------------------------|:---------|:-----------------------------------------------------------------|
| type     | String                      | true     | Block type. In this case, it is always `rich_text_preformatted`. |
| elements | [Text Block](#text-block)[] | true     | An array of                                                      |

The code block section (`type: "rich_text_preformatted"`) also has the `elements` array which consists of only one `text` object without any formatting.

<details>
<summary>Code Block Section example</summary>

```json
{
    "type": "rich_text_preformatted",
    "elements": [
        {
            "type": "text",
            "text": "Code Block content, no formatting"
        }
    ]
}
```
</details>

<details>
<summary>Code Block Section inside Rich Text example</summary>

```typescript
[
    {
        "type": "rich_text",
        "elements": [
            {
                "type": "rich_text_preformatted",
                "border": 0,
                "elements": [
                    {
                        "type": "text",
                        "text": "public static void main(String[] args) {\n    System.out.println(\"Hello Pumble!\");\n}"
                    }
                ]
            }
        ]
    }
]
```

Results in:
```java
public static void main(String[] args) {
    System.out.println("Hello Pumble!");
}
```
</details>

### List Section

Allows display of ordered or bulleted lists, with support for indentation and continuation across sections.
List items can consist of all available rich text elements, and all styling options (**bold**, *italic*, ~~strikethrough~~ and `code block`) are available within them.

| name     | type                                    | required | description                                                                                                                                                                                                                                          |
|:---------|:----------------------------------------|:---------|:-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| type     | String                                  | true     | Block type. In this case, it is always `rich_text_section`                                                                                                                                                                                           |
| elements | [RichTextSection](#rich-text-section)[] | true     | Each of those text sections represents one item in the list visually and can hold all the items a regular text section can.                                                                                                                          |
| style    | String                                  | true     | Determines the type of the list, with `ordered` and `bullet` as possible values.                                                                                                                                                                     |
| indent   | Integer                                 | true     | Determines the indentation level of the list. It accepts a value in the range from 0 to 4, inclusive.                                                                                                                                                |
| border   | Integer                                 | false    | Determines if the list has a border on the leftmost side, similar to the quote section. Possible values are 0 for no border and 1 for a border to be displayed.                                                                                      |
| offset   | Integer                                 | false    | Indicates that the list is a continuation of a previous list section of the same indent. Denotes how many items were in a previous list section(s), so that the UI can know where to continue counting the indices. Appears only in `ordered` lists. |

The largest continuous run of list items with the same indent level will be formatted under the same list section. For an item with a different indent level, a new list section will be created.

Ordered lists are enumerated based on their indent level. Lists indented with 0 and 3 use Arabic numerals as indexes, lists indented with 1 and 4 use alphabetical indexes, and lists indented with 2 use Roman numeral indexes.
<pre>
1. indent 0  
    a. indent 1  
        i. indent 2  
            1. indent 3  
                a. indent 4
</pre>

Unordered lists have three different bullet types: a filled circle '●' for indents 0 and 3, an empty circle '○' for indents 1 and 4, and a filled square '■' for indent 2.
<pre>
● indent 0  
    ○ indent 1  
        ■ indent 2  
            ● indent 3  
                ○ indent 4
</pre>

<details>
<summary>Ordered List example</summary>

```json
{
    "type": "rich_text",
    "elements": [
        {
            "type": "rich_text_list",
            "style": "ordered",
            "indent": 0,
            "border": 0,
            "elements": [
                {
                    "type": "rich_text_section",
                    "elements": [
                        {
                            "type": "text",
                            "text": "first item"
                        }
                    ]
                }
            ]
        },
        {
            "type": "rich_text_list",
            "style": "ordered",
            "indent": 1,
            "border": 0,
            "elements": [
                {
                    "type": "rich_text_section",
                    "elements": [
                        {
                            "type": "text",
                            "text": "first sub item"
                        }
                    ]
                }
            ]
        },
        {
            "type": "rich_text_list",
            "style": "ordered",
            "indent": 2,
            "border": 0,
            "elements": [
                {
                    "type": "rich_text_section",
                    "elements": [
                        {
                            "type": "text",
                            "text": "first sub sub item"
                        }
                    ]
                },
                {
                    "type": "rich_text_section",
                    "elements": [
                        {
                            "type": "text",
                            "text": "second sub sub item"
                        }
                    ]
                }
            ]
        },
        {
            "type": "rich_text_list",
            "style": "ordered",
            "indent": 0,
            "border": 0,
            "offset": 1,
            "elements": [
                {
                    "type": "rich_text_section",
                    "elements": [
                        {
                            "type": "text",
                            "text": "second item"
                        }
                    ]
                },
                {
                    "type": "rich_text_section",
                    "elements": [
                        {
                            "type": "text",
                            "text": "third item"
                        }
                    ]
                }
            ]
        }
    ]
}
```

Results in:
<pre>
1. first item
    a. first sub item
        i. first sub sub item
        ii. second sub sub item
2. second item
3. third item
</pre>

In this example, there are four list sections, all with `style: "ordered"`.
- The first section has an indentation of 0 and one item, which is a text section with one text item.
- The second section has an indentation of 1 and one item, similar to the first.
- The third section has an indentation of 2 and two items, each of which is a text section with one text item.
- The fourth section is a continuation of the first list section. It has an indentation of 0 and offset of 1 to indicate that the indices in it are offset by the count of the items in the first list.

</details>

<details>
<summary>Unordered List example</summary>

```json
{
    "type": "rich_text",
    "elements": [
        {
            "type": "rich_text_list",
            "style": "bullet",
            "indent": 0,
            "border": 0,
            "elements": [
                {
                    "type": "rich_text_section",
                    "elements": [
                        {
                            "type": "text",
                            "text": "first item"
                        }
                    ]
                }
            ]
        },
        {
            "type": "rich_text_list",
            "style": "bullet",
            "indent": 1,
            "border": 0,
            "elements": [
                {
                    "type": "rich_text_section",
                    "elements": [
                        {
                            "type": "text",
                            "text": "first sub item"
                        }
                    ]
                }
            ]
        },
        {
            "type": "rich_text_list",
            "style": "bullet",
            "indent": 0,
            "border": 0,
            "elements": [
                {
                    "type": "rich_text_section",
                    "elements": [
                        {
                            "type": "text",
                            "text": "second item"
                        }
                    ]
                }
            ]
        }
    ]
}
```

Results in:
<pre>
● first item
    ○ first sub item
● second item
</pre>

</details>

## Actions Block

Action Block holds interactive elements (buttons, select menus, checkboxes, date pickers, plain text input fields), thus allowing users to trigger actions from Pumble messages and views.

It is available for messages, modals and home views.

| name     | type     | description                                                                                                                                                                                                                                                                         |
|:---------|:---------|:------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| type     | String   | Block type. In this case, it is always `actions`.                                                                                                                                                                                                                                   |
| elements | Object[] | An array of interactive element blocks, which can be the following: [Button](#button), [Plain Text Input](#plain-text-input), [Dynamic Select Menu](#dynamic-select-menu), [Checkbox Group](#checkbox-group), [Date Picker](#date-picker), [Date Range Picker](#date-range-picker). |

### Button

| name           | type                             | description                                                                                                                                                          |
|:---------------|:---------------------------------|:---------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| type           | String                           | The type of element. In this case type is always `button`.                                                                                                           |
| text           | [TextElement](#text-element)     | A text object that defines the button's text. Maximum length for the text field in this object is 75 characters.                                                     |
| value          | String                           | Any metadata defined by the app that will be included in the interaction payload object.                                                                             |
| url            | String                           | URL that will open in the user's browser. The block interaction event will also be triggered.                                                                        |
| style          | String                           | Decorates buttons with alternative visual color schemes. Options include: `primary`, `secondary`, `warning`, `danger`.                                               |
| onAction       | String                           | Action identifier defined by the app (controlled and used on the app's side).                                                                                        |
| confirm        | [ConfirmDialog](#confirm-dialog) | A confirmation modal that will be shown just before triggering the block interaction, prompting the user to confirm the action.                                      |
| loadingTimeout | Integer                          | If greater than zero, a loading state is activated upon click and will last for a maximum of the given value (in seconds). Loading will stop upon action completion. |

<details>
<summary>Button example</summary>

```json
{
    "type": "button",
    "text": {
        "type": "plain_text",
        "text": "Click here!"
    },
    "onAction": "on_button_clicked",
    "value": "1",
    "confirm": {
        "title": {
            "type": "plain_text",
            "text": "Confirmation needed"
        },
        "text": {
            "type": "plain_text",
            "text": "Are you sure you want to perform this action?"
        },
        "confirm": {
            "type": "plain_text",
            "text": "Yes"
        },
        "deny": {
            "type": "plain_text",
            "text": "No"
        }
    },
    "loadingTimeout": 5
}
```
</details>

### Plain Text Input

| name                 | type                         | description                                                                                                                   |
|:---------------------|:-----------------------------|:------------------------------------------------------------------------------------------------------------------------------|
| type                 | String                       | The type of element. In this case type is always `plain_text_input`.                                                          |
| initial_value        | String                       | Text that will be displayed initially.                                                                                        |
| placeholder          | [TextElement](#text-element) | A text object that defines input placeholder text. Maximum length for the text field in this object is 75 characters.         |
| line_mode            | String                       | Indicates if the text can be broken into multiple lines using newline characters. Options include: `singleline`, `multiline`. |
| min_length           | Integer                      | Minimim text length.                                                                                                          |
| max_length           | Integer                      | Maximum text length.                                                                                                          |
| interaction_triggers | String[]                     | Determines which user action(s) will dispatch block interaction event. Options include: `on_enter_pressed`, `on_input`.       |
| onAction             | String                       | Action identifier defined by the app (controlled and used on the app's side).                                                 |
| autofocused          | Boolean                      | Indicates if the text input field will be automatically focused, when a modal is opened.                                      |


<details>
<summary>Plain Text Input example</summary>

```json
{
    "type": "plain_text_input",
    "placeholder": {
        "type": "plain_text",
        "text": "Enter something here"
    },
    "onAction": "on_plain_text_input",
    "line_mode": "multiline",
    "max_length": 15,
    "interaction_triggers": ["on_input"]
}
```
</details>

### Static Select Menu

| name           | type                                              | description                                                                                                                                                           |
|:---------------|:--------------------------------------------------|:----------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| type           | String                                            | The type of element. In this case type is always `static_select_menu`.                                                                                                |
| placeholder    | [TextElement](#text-element)                      | A text object that defines the select menu's placeholder text. Maximum length for the text field in this object is 75 characters.                                     |
| options        | [Option](#option)[]                               | An array of option objects. Maximum number of options is 100. If `option_groups` is specified, this field should not be.                                              |
| option_groups  | [OptionGroup](#option-group)[]                    | An array of option group objects. Maximum number of option groups is 100. If `options` is specified, this field should not be.                                        |
| initial_option | [Option](#option) or [OptionGroup](#option-group) | A single option that exactly matches one of the options within `options` or `option_groups`. This option will be selected when the menu initially loads.              |
| onAction       | String                                            | Action identifier defined by the app (controlled and used on the app's side).                                                                                         |
| confirm        | [ConfirmDialog](#confirm-dialog)                  | A confirmation modal that will be shown just before triggering the block interaction, prompting the user to confirm the action.                                       |
| loadingTimeout | Integer                                           | If greater than zero, a loading state is activated upon select and will last for a maximum of the given value (in seconds). Loading will stop upon action completion. |
| autofocused    | Boolean                                           | Indicates if the select menu input field will be automatically focused, when a modal is opened.                                                                       |

<details>
<summary>Static Select Menu with options example</summary>

```json
{
    "type": "static_select_menu",
    "placeholder": {
        "type": "plain_text",
        "text": "Choose an option"
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
    ],
    "initial_option": {
        "text": {
            "type": "plain_text",
            "text": "Option 1"
        },
        "value": "1"
    }
}
```
</details>


<details>
<summary>Static Select Menu with option groups example</summary>

```json
{
    "type": "static_select_menu",
    "placeholder": {
        "type": "plain_text",
        "text": "Choose an option"
    },
    "onAction": "on_static_select_menu",
    "option_groups": [
        {
            "label": {
                "type": "plain_text",
                "text": "Group 1"
            },
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
        },
        {
            "label": {
                "type": "plain_text",
                "text": "Group 2"
            },
            "options": [
                {
                    "text": {
                        "type": "plain_text",
                        "text": "Option 3"
                    },
                    "value": "3"
                },
                {
                    "text": {
                        "type": "plain_text",
                        "text": "Option 4"
                    },
                    "value": "4"
                }
            ]
        }
    ],
    "options": [],
    "initial_option": {
        "text": {
            "type": "plain_text",
            "text": "Option 2"
        },
        "value": "2"
    }
}
```
</details>

### Dynamic Select Menu

| name             | type                                              | description                                                                                                                                                                                                          |
|:-----------------|:--------------------------------------------------|:---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| type             | String                                            | The type of element. In this case type is always `dynamic_select_menu`.                                                                                                                                              |
| placeholder      | [TextElement](#text-element)                      | A text object that defines the select menu's placeholder text. Maximum length for the text field in this object is 75 characters.                                                                                    |
| min_query_length | Integer                                           | If this field is not defined, a request will be sent on every character change. To reduce the number of requests sent, use this field to specify the minimum number of typed characters required before dispatching. |
| initial_option   | [Option](#option) or [OptionGroup](#option-group) | This option will be selected when the menu initially loads.                                                                                                                                                          |
| onAction         | String                                            | Action identifier defined by the app (controlled and used on the app's side).                                                                                                                                        |
| confirm          | [ConfirmDialog](#confirm-dialog)                  | A confirmation modal that will be shown just before triggering the block interaction, prompting the user to confirm the action.                                                                                      |
| loadingTimeout   | Integer                                           | If greater than zero, a loading state is activated upon select and will last for a maximum of the given value (in seconds). Loading will stop upon action completion.                                                |
| autofocused      | Boolean                                           | Indicates if the select menu input field will be automatically focused, when a modal is opened.                                                                                                                      |

### Checkbox Group

| name            | type                             | description                                                                                                                                                                    |
|:----------------|:---------------------------------|:-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| type            | String                           | The type of element. In this case type is always `checkboxes`                                                                                                                  |
| options         | [Option](#option)[]              | An array of option objects. Maximum number of options is 100.                                                                                                                  |
| initial_options | [Option](#option)[]              | An array of option objects, representing intially checked options. They must be contained in `options`.                                                                        |
| onAction        | String                           | Action identifier defined by the app (controlled and used on the app's side).                                                                                                  |
| confirm         | [ConfirmDialog](#confirm-dialog) | A confirmation modal that will be shown just before triggering the block interaction, prompting the user to confirm the action.                                                |
| loadingTimeout  | Integer                          | If greater than zero, a loading state is activated upon checkbox select and will last for a maximum of the given value (in seconds). Loading will stop upon action completion. |
| autofocused     | Boolean                          | Indicates if the checkboxes input field will be automatically focused, when a modal is opened.                                                                                 |

### Date Picker

| name           | type                             | description                                                                                                                                                                |
|:---------------|:---------------------------------|:---------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| type           | String                           | The type of element. In this case type is always `date_picker`                                                                                                             |
| placeholder    | [TextElement](#text-element)     | A text object that defines the date picker's placeholder text. Maximum length for the text field in this object is 75 characters.                                          |
| initial_date   | String                           | Initially selected date. Should be specified in format `yyyy-MM-dd`                                                                                                        |
| onAction       | String                           | Action identifier defined by the app (controlled and used on the app's side).                                                                                              |
| confirm        | [ConfirmDialog](#confirm-dialog) | A confirmation modal that will be shown just before triggering the block interaction, prompting the user to confirm the action.                                            |
| loadingTimeout | Integer                          | If greater than zero, a loading state is activated upon date select and will last for a maximum of the given value (in seconds). Loading will stop upon action completion. |
| autofocused    | Boolean                          | Indicates if the date input field will be automatically focused, when a modal is opened.                                                                                   |

<details>
<summary>Date Picker example</summary>

```json
{
    "type": "date_picker",
    "placeholder": {
        "type": "plain_text",
        "text": "Enter a date"
    },
    "onAction": "on_date_picked",
    "initial_date": "2026-01-01",
    "loadingTimeout": 5
}
```
</details>

### Date Range Picker

| name               | type                             | description                                                                                                                                                                |
|:-------------------|:---------------------------------|:---------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| type               | String                           | The type of element. In this case type is always `date_range_picker`                                                                                                       |
| placeholder        | [TextElement](#text-element)     | A text object that defines the date range picker's placeholder text.                                                                                                       |
| initial_date_range | [DateRange](#date-range)         | Initially selecteed date range.                                                                                                                                            |
| onAction           | String                           | Action identifier defined by the app (controlled and used on the app's side).                                                                                              |
| confirm            | [ConfirmDialog](#confirm-dialog) | A confirmation modal that will be shown just before triggering the block interaction, prompting the user to confirm the action.                                            |
| loadingTimeout     | Integer                          | If greater than zero, a loading state is activated upon date select and will last for a maximum of the given value (in seconds). Loading will stop upon action completion. |
| autofocused        | Boolean                          | Indicates if the date range input field will be automatically focused, when a modal is opened.                                                                             |

<details>
<summary>Date Range Picker example</summary>

```json
{
    "type": "date_range_picker",
    "onAction": "on_date_range_picked",
    "initial_date_range": {
        "start": "2026-01-01",
        "end": "2026-01-20"
    }
}
```
</details>

#### Confirm Dialog

| name    | type                         | description                                                                                                             |
|:--------|:-----------------------------|:------------------------------------------------------------------------------------------------------------------------|
| title   | [TextElement](#text-element) | A text object that defines the dialog's title. Maximum length for the text field in this object is 75 characters.       |
| text    | [TextElement](#text-element) | A text object that defines the dialog's text. Maximum length for the text field in this object is 300 characters.       |
| confirm | [TextElement](#text-element) | A text object that defines the confirm button text. Maximum length for the text field in this object is 75 characters.  |
| deny    | [TextElement](#text-element) | A text object that defines the deny button text. Maximum length for the text field in this object is 75 characters.     |
| style   | String                       | Defines the color scheme applied to the `confirm` button. Options include: `primary`, `secondary`, `warning`, `danger`. |

#### Option

| name        | type                         | description                                                                                                            |
|:------------|:-----------------------------|:-----------------------------------------------------------------------------------------------------------------------|
| text        | [TextElement](#text-element) | A text object that defines the option's text. Maximum length for the text field in this object is 75 characters.       |
| value       | String                       | A unique string value that will be passed to the app when this option is chosen. The maximum length is 100 characters. |
| description | [TextElement](#text-element) | A text object that defines option's description. Maximum length for the text field in this object is 75 characters.    |

#### Option Group

| name    | type                         | description                                                                                                            |
|:--------|:-----------------------------|:-----------------------------------------------------------------------------------------------------------------------|
| label   | [TextElement](#text-element) | A text object that defines the options group label. Maximum length for the text field in this object is 75 characters. |
| options | [Option](#option)[]          | An array of option objects. Maximum number of options is 100.                                                          |

#### Text Element

| name  | type    | description                                                                             |
|:------|:--------|:----------------------------------------------------------------------------------------|
| type  | String  | The type of element. In this case type is always `plain_text`.                          |
| text  | String  | Text that will be displayed.                                                            |
| emoji | Boolean | Indicates whether emojis in a text field should be escaped into the colon emoji format. |

#### Date Range

| name  | type   | description                                                                    |
|:------|:-------|:-------------------------------------------------------------------------------|
| start | String | Start date of a range (inclusive). Should be specified in format `yyyy-MM-dd`. |
| end   | String | End date of a range (inclusive). Should be specified in format `yyyy-MM-dd`.   |

For more information and examples, visit the [interactivity guide](/interactivity).

## Input Block

Input Block is a container block that wraps a single Action Block with a label.
Input Block is primarily used in modals to create form fields, and it is not available in messages.
It ensures that the wrapped element's value is included in the modal's state via input block's `blockId` and wrapped element's `onAction`.

| name             | type                         | required | description                                                                                                                                                                                                                                                               |
|:-----------------|:-----------------------------|:---------|:--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| type             | String                       | true     | Block type. In this case, it is always `input`                                                                                                                                                                                                                            |
| element          | Object                       | true     | Wrapped interactive element. Can be one of the following: [Button](#button), [Plain Text Input](#plain-text-input), [Dynamic Select Menu](#dynamic-select-menu), [Checkbox Group](#checkbox-group), [Date Picker](#date-picker), [Date Range Picker](#date-range-picker). |
| blockId          | String                       | true     | Unique identifier of an input block within the modal. It is necessary for keeping the input element's value in the modal's state.                                                                                                                                         |
| label            | [TextElement](#text-element) | true     | Label of the input field.                                                                                                                                                                                                                                                 |
| optional         | Boolean                      | false    | Specifies if it is necessary to enter the value in this field before modal submition.                                                                                                                                                                                     |
| dispatchAction   | Boolean                      | false    | Specifies if the wrapped element's `onAction` interaction handler will be triggered on value input.                                                                                                                                                                       |
| validationErrror | String                       | false    | Error message that will be shown below the input field. Maximum length for this field is 75 characters.                                                                                                                                                                   |

Examples and some further details

<details>
<summary>Input Block examples</summary>

```json
{
    "type": "input",
    "blockId": "input_1",
    "label": {
        "text": "Input field",
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
    },
    "dispatchAction": true
}
```
Results in a Static Select Menu that is wrapped in an input field, and can be a part of modal's state.

```json
{
    "state": {
        "values": {
            "input_1": {
                "on_static_select_menu": {
                    "type": "static_select_menu",
                    "value": "2"
                }
            }
        }
    }
}
```

Results in Static Select Menu's option with value `2` being selected in the modal's state.

```json
{
    "type": "input",
    "blockId": "input_2",
    "label": {
        "type": "plain_text",
        "text": "Date range input field"
    },
    "element": {
        "type": "date_range_picker",
        "onAction": "on_data_range_picked"
    },
    "optional": true
}
```
Results in a Date Range Picker that is wrapped in an input field, and can be a part of modal's state.

```json
{
    "state": {
        "values": {
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
Results in a date range between `2026-01-01` and `2026-01-01` being picked in the modal's stage.
</details>

For more information about interactive blocks, visit [Actions Block guide](#actions-block) and [interactivity guide](/interactivity).

For more information about modals, visit [Modals & Views guide](/modals-views) and reference.

## Section Block

Section Block is a container block that wraps text content with an optional Input Block accessory, positioned beside it.
It was introduced to make it possible to display text and an interactive element next to each other, as that is not achievable by using Rich Text Blocks and Action Blocks or Input Blocks.
Section Block is available for modals and home views, and it is not available for messages.

Section Block accessory can be a part of view state, just like a regular input block.

| name         | type        | required | default | description                                                                                                 |
|:-------------|:------------|:---------|:--------|:------------------------------------------------------------------------------------------------------------|
| type         | String      | true     | -       | Block type. In this case, it is always `section`                                                            |
| text         | TextElement | true     | -       | Text content of the section. Maximum length for the text field in this case is 1500 characters.             |
| accessory    | Input Block | false    | -       | Input Block element which will be displayed next to the text content.                                       |
| textPosition | String      | false    | `left`  | Indicates how the text content will be positioned in relation to the accessory. Options are `left`, `right` |

<details>
<summary>Section Block example</summary>

```json
{
    "type": "section",
    "text": {
        "type": "plain_text",
        "text": "This is the text part of the section."
    },
    "accessory": {
        "type": "input",
        "blockId": "accessory_input_plan_text",
        "label": {
            "type": "plain_text",
            "text": "Label text"
        },
        "element": {
            "type": "plain_text_input",
            "onAction": "plain_text_input_action",
            "placeholder": {
                "type": "plain_text",
                "text": "Placeholder"
            }
        }
    },
    "text_position": "left"
}
```

Results in the text being displayed on the left side of a modal, while a plain text input field with a label is next to it.

To set the initial value for the accessory in view state, specify its `blockId` and nested element's `onAction`:

```json
{
    "values": {
        "accessory_input_plan_text": {
            "plain_text_input_action": {
                "value": "Initial input"
            }
        }
    }
}
```
</details>

For more information about input blocks, visit the [Input Block](#input-block) guide or take a look the additional examples.

## Divider Block

Divider blocks can be used to visually separate top-level blocks with a horizontal line, to make the content more organized.
It is available in messages, modals and home views.

| name | type   | description                                      |
|:-----|:-------|:-------------------------------------------------|
| type | String | Block type. In this case, it is always `divider` |

<details>
<summary>Divider Block example</summary>

```json
{
    "type": "divider"
}
```
</details>
