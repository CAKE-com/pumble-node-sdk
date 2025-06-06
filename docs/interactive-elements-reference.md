## Button

| name     | type          | description                                                                                                                     |
|:---------|:--------------|:--------------------------------------------------------------------------------------------------------------------------------|
| type     | String        | The type of element. In this case type is always `button`.                                                                      |
| text     | TextElement   | A text object that defines the button's text. Max length for the text field in this object is 75 characters.                    |
| value    | String        | Any metadata defined by the app that will be included in the interaction payload object.                                        |
| url      | String        | URL that will open in the user's browser. The block interaction event will also be triggered.                                   |
| style    | String        | Decorates buttons with alternative visual color schemes. Options include: `primary`, `secondary`, `warning`, `danger`.          |
| onAction | String        | Action identifier defined by the app (controlled and used on the app's side).                                                   |
| confirm  | ConfirmDialog | A confirmation modal that will be shown just before triggering the block interaction, prompting the user to confirm the action. |

## Plain text input

| name                 | type                             | description                                                                                                       |
|:---------------------|:---------------------------------|:------------------------------------------------------------------------------------------------------------------|
| type                 | String                           | The type of element. In this case type is always `plain_text_input`.                                              |
| initial_value        | String                           | Text that will be displayed initially.                                                                            |
| placeholder          | TextElement                      | A text object that defines input placeholder text. Max length for the text field in this object is 75 characters. |
| multiline            | Boolean                          | Indicates if input field can contain multiple lines.                                                              |
| min_length           | Integer                          | Min text length.                                                                                                  |
| max_length           | Integer                          | Max text length.                                                                                                  |
| interaction_triggers | ['on_enter_pressed', 'on_input'] | Determines which user action(s) will dispatch block interaction event.                                            |

## Select menu (static)

| name           | type                      | description                                                                                                                                          |
|:---------------|:--------------------------|:-----------------------------------------------------------------------------------------------------------------------------------------------------|
| type           | String                    | The type of element. In this case type is always `static_select_menu`.                                                                               |
| placeholder    | TextElement               | A text object that defines the select menu's placeholder text. Max length for the text field in this object is 75 characters.                        |
| options        | Option[]                  | An array of option objects. Maximum number of options is 100. If `option_groups` is specified, this field should not be.                             |
| option_groups  | OptionGroup[]             | An array of option group objects. Maximum number of option groups is 100. If `options` is specified, this field should not be.                       |
| initial_option | Option[] or OptionGroup[] | A single option that exactly matches one of the options within options or option_groups. This option will be selected when the menu initially loads. |
| onAction       | String                    | Action identifier defined by the app (controlled and used on the app's side).                                                                        |
| confirm        | ConfirmDialog             | A confirmation modal that will be shown just before triggering the block interaction, prompting the user to confirm the action.                      |

## Select menu (dynamic)

| name             | type                      | description                                                                                                                                                                                                          |
|:-----------------|:--------------------------|:---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| type             | String                    | The type of element. In this case type is always `dynamic_select_menu`.                                                                                                                                              |
| placeholder      | TextElement               | A text object that defines the select menu's placeholder text. Max length for the text field in this object is 75 characters.                                                                                        |
| min_query_length | Integer                   | If this field is not defined, a request will be sent on every character change. To reduce the number of requests sent, use this field to specify the minimum number of typed characters required before dispatching. |
| initial_option   | Option[] or OptionGroup[] | This option will be selected when the menu initially loads.                                                                                                                                                          |
| onAction         | String                    | Action identifier defined by the app (controlled and used on the app's side).                                                                                                                                        |
| confirm          | ConfirmDialog             | A confirmation modal that will be shown just before triggering the block interaction, prompting the user to confirm the action.                                                                                      |

## ConfirmDialog

| name    | type        | description                                                                                                                 |
|:--------|:------------|:----------------------------------------------------------------------------------------------------------------------------|
| title   | TextElement | A text object that defines the dialog's title. Max length for the text field in this object is 75 characters.               |
| text    | TextElement | A text object that defines the dialog's text. Max length for the text field in this object is 300 characters.               |
| confirm | TextElement | A text object that defines the confirm button text. Max length for the text field in this object is 75 characters.          |
| deny    | TextElement | A text object that defines the deny button text. Max length for the text field in this object is 75 characters.             |
| style   | String      | Defines the color scheme applied to the `confirm` button. Options include: `primary`, `secondary`, `warning`, `danger`.     |

## Option

| name        | type        | description                                                                                                            |
|:------------|:------------|:-----------------------------------------------------------------------------------------------------------------------|
| text        | TextElement | A text object that defines the option's text. Max length for the text field in this object is 75 characters.           |
| value       | String      | A unique string value that will be passed to the app when this option is chosen. The maximum length is 100 characters. |
| description | TextElement | A text object that defines option's description. Max length for the text field in this object is 75 characters.        |

### Option group

| name    | type        | description                                                                                                        |
|:--------|:------------|:-------------------------------------------------------------------------------------------------------------------|
| label   | TextElement | A text object that defines the options group label. Max length for the text field in this object is 75 characters. |
| options | Option[]    | An array of option objects. Maximum number of options is 100.                                                      |

## Text element

| name  | type    | description                                                                             |
|:------|:--------|:----------------------------------------------------------------------------------------|
| type  | String  | The type of element. In this case type is always `plain_text`.                          |
| text  | String  | Text that will be displayed.                                                            |
| emoji | Boolean | Indicates whether emojis in a text field should be escaped into the colon emoji format. |