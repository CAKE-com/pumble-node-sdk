# Blocks

### Quick message overview

Pumble messages comprise both `text` and `blocks`. The `blocks` array contains JSON data, which is rendered according to predefined parsing rules. 
When valid blocks are provided, Pumble uses them to render the message. 
If block parsing fails or if no blocks are present, Pumble displays the fallback text defined in the `text` field.

## Rich text formatting

Each block contains a `type` field that determines the block's type and, consequently, how the block will be parsed.
Text can be formatted using the `rich_text` block type, which includes an array of `elements` containing various sections and components of rich text.

### Section

A section represents one or more lines of text, depending on its content. Each new section must start in a new line, regardless of what the section before it was.
There are 4 types of sections, with their values for their `type` field:

Text section `type: “rich_text_section”`  
Quote section `type: “rich_text_quote”`  
Code block section `type: “rich_text_preformatted”`  
List section `type: “rich_text_list”`  

#### Text section

Besides the `type` field, the text section also has an `elements` field.
There are 7 different types of items:  
- Text  `type: “text”` which has an additional `text` field.  
- User mention `type: “user”` with an additional field named `user_id`.  
- Channel mention `type: “channel”` with an additional field named `channel_id`.  
- User group mention `type: “usergroup”` with an additional field named `usergroup_id`.  
- Broadcast mention `type: “broadcast”` with an additional field named `range` (with `channel` and `here` as possible values for it).  
- Link `type: “link”` with an additional `url` parameter. Emails will be sent as `mailto: links`. Links have an optional `text` field that, if present, will be displayed and hyperlinked with the provided `url`.  
- Emoji `type: “emoji”` with an additional `name` parameter, that contains the alias for the emoji. It may also have an additional `skin_tone` field with a value in range `[2, 6]`, for emojis that support it. If the default skin tone should be applied, the `skin_tone` parameter will not be present at all.

All items have an optional `style` field. It represents an object consisting of 4 optional boolean fields. Applicable fields will be present in a JSON format with their values being set to `true`. 
Allowed `style` fields are `bold`, `italic`, `strike` (strikethrough) and `code` (inline code blocks, only applicable to `text` items).

Basic example:

```typescript
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

Following example results in:  
**bold** *italic* ~~strike~~ `code` ***~~all four~~***

```typescript
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

User mention (results in `@John Doe`):

```typescript
[
    {
        "type": "rich_text",
        "elements": [
            {
                "type": "rich_text_section",
                "elements": [
                    {
                        "type": "user",
                        "user_id": "12345678987654321"
                    }
                ]
            }
        ]
    }
]
```

Channel mention (results in #general):

```typescript
[
    {
        "type": "rich_text",
        "elements": [
            {
                "type": "rich_text_section",
                "elements": [
                    {
                        "type": "channel",
                        "channel_id": "12345678987654321"
                    }
                ]
            }
        ]
    }
]
```

Emoji (results in 🍻):

```typescript
[
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
]
```

Hyperlink (results in "For more info visit our [website](https://pumble.com)"):

```typescript
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

#### Quote section

Besides the `type` field (`type: "rich_text_quote"`), the quote section also has an `elements` array. Its objects are the same as in the text section.

```typescript
[
    {
        "type": "rich_text",
        "elements": [
            {
                "type": "rich_text_quote",
                "elements": [
                    {
                        "type": "text",
                        "text": "Quote with "
                    },
                    {
                        "type": "broadcast",
                        "range": "here"
                    },
                    {
                        "type": "text",
                        "text": " mention"
                    }
                ]
            }
        ]
    }
]
```
This example results in
> Quote with @here mention

#### Code block section

The code block section (`type: "rich_text_preformatted"`) also has the `elements` array which consists of only one `text` object without any formatting.

For example:

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
This example results in
```java
public static void main(String[] args) {
    System.out.println("Hello Pumble!");
}
```

#### List section

A list section contains 5 attributes:
- `style` - Determines the type of the list, with `ordered` and `bullet` as possible values.
- `indent` - Determines the indentation level of the list. It accepts a value in the range from 0 to 4, inclusive.
- `border` - Determines if the list has a border on the leftmost side, similar to the quote section. Possible values are 0 for no border and 1 for a border to be displayed. 
- `offset` - Indicates that the list is a continuation of a previous list section of the same indent. The value of this parameter is an integer, denoting how many items were in a previous list section(s) so that the UI can know where to continue counting the indices. This field only appears in `ordered` lists. 
- `elements` - Elements in a list section aren’t regular items like in other sections, they are text sections. Each of those text sections represents one item in the list visually and can hold all the items a regular text section can.

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

For example:
<pre>
1. first item
    a. first sub item
        i. first sub sub item
        ii. second sub sub item
2. second item
3. third item
</pre>
In the example above, there are four list sections, all with `style: "ordered"`.
- The first section has an indentation of 0 and one item, which is a text section with one text item.
- The second section has an indentation of 1 and one item, similar to the first.
- The third section has an indentation of 2 and two items, each of which is a text section with one text item.
- The fourth section is a continuation of the first list section. It has an indentation of 0 and offset of 1 to indicate that the indices in it are offset by the count of the items in the first list.
```typescript
[
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
]
```

Unordered list example:
<pre>
● first item
    ○ first sub item
● second item
</pre>
Similarly to the first example, here we actually have 3 list sections.
```typescript
[
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
]
```

## Interactive blocks formatting

Blocks also support interactive elements. For more details, check out [interactivity](/interactivity).