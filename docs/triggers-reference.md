# Triggers

Pumble apps can subscribe to two types of triggers:

1. App specific triggers ([Slash Commands](#slash-commands), [Global Shortcuts](#global-shortcuts), [Message Shortcuts](#message-shortcuts), [Block Interactions](#block-interactions), [View Action](#view-action))
2. [Pumble Events](#events)

The payloads for each specific trigger exist on every event handler context:

```typescript
slashCommands: [
    {
        command: '/my_slash_command',
        handler: async (ctx) => {
            await ctx.ack();
            const payload = ctx.payload;
        },
    },
]
```

## Slash Commands

To create slash commands, in your `main.ts` App object insert the property `slashCommands`. 

```typescript
const app: App = {
    slashCommands: [
        {
            command: '/my_slash_command',
            description: 'My slash command description',
            usageHint: '[usage hint]',
            handler: async (ctx) => {
                console.log('Received slash command');
            }
        },
    ]
}
```
>[!NOTE]
>If you created an App object using `setup` function, insert the `slashCommands` property within the `AddonManifest` object, 
>and make sure to specify the full `url` for each slash command.

:::warning
You cannot have two slash commands with the same `command`
:::

### Slash Command context

| name              | type                                                                                                                                                      | description                                                                                                                                                                                                |
|:------------------|:----------------------------------------------------------------------------------------------------------------------------------------------------------|:-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| payload           | [SlashCommandPayload](#slash-command-payload)                                                                                                             | The payload for the slash command                                                                                                                                                                          |
| say               | [SayFunction](#say-function)                                                                                                                              | Quickly reply to the trigger using the bot. See [SayFunction](#say-function)                                                                                                                               |
| ack               | () =\> Promise\<void\>                                                                                                                                    | Callback to acknowledge the trigger. This should be invoked within 3 seconds upon receiving the request. It's recommended for this to be the first call in the trigger handler.                            |
| nack              | (message?: String) =\> Promise\<void\>                                                                                                                    | Callback to reject the trigger. If provided with an argument the message will be sent to the user as an ephemeral message.                                                                                 |
| getBotClient      | () =\> Promise\<ApiClient \| undefined\>                                                                                                                  | Get the bot ApiClient for the workspace where the trigger was invoked. If you have set `{bot: false}` in the [manifest](/manifest#manifest-payload) this will return undefined                             |
| getUserClient     | (userId?: String) =\> Promise\<ApiClient \| undefined\>                                                                                                   | Return the user client given a user ID. If userId is not fed in this method it will try to find a the ApiClient of the triggering user. If the user has not authorized your app this will return undefined |
| getManifest       | () =\> [Manifest](/manifest#manifest-payload)                                                                                                             | Return the manifest of your app. This can be used if you need to access some manifest configuration or secret                                                                                              |
| getBotUserId      | () =\> Promise\<String \| undefined\>                                                                                                                     | Get the bot user ID for the workspace where the trigger was invoked. If you have set `{bot: false}` in the [manifest](/manifest#manifest-payload) this will return undefined                               |
| getAuthUrl        | () =\> String                                                                                                                                             | Generate an auth URL that when opened it will show the Pumble Consent screen to authorize your app                                                                                                         |
| getChannelDetails | () =\> Promise\<ChannelInfo\>                                                                                                                             | Get channel information for the channel where the command was invoked, given the `channels:read` scope is granted for the user or bot                                                                      |
| spawnModalView    | ([View<"MODAL">](/modals-views-reference#modal) \| [StorageIntegrationModalCredentials](/modals-views-reference#storage-integration)) =\> Promise\<void\> | Triggers creation of a modal (regular modal or storage integration modal).                                                         |

The slash command payload will contain all the relevant information for the trigger event.

### Slash Command payload

| name         | type   | optional | description                                                      |
|:-------------|:-------|:---------|:-----------------------------------------------------------------|
| slashCommand | String | false    | The slash command that was invoked                               |
| text         | String | false    | The text that user typed after the slash command                 |
| userId       | String | false    | The user who invoked the slash command                           |
| channelId    | String | false    | The channel where the slash command was invoked                  |
| workspaceId  | String | false    | The workspace where the slash command was invoked                |
| threadRootId | String | true     | The thread ID if the slash command is invoked in a thread window |
| triggerId    | String | false    | Internal identifier of the action.                               |


## Global Shortcuts

To create Global Shortcuts in your `main.ts` App object insert the property `globalShortcuts`:

```typescript

// main.ts
const app: App = {
    globalShortcuts: [
        {
            name: 'Global Shortcut',
            description: 'Global shortcut description',
            handler: async (ctx) => {
                console.log('Received global shortcut');
            },
        },
    ]
}
```
>[!NOTE]
>If you created an App object using `setup` function, insert the `globalShortcuts` property within the `AddonManifest` object,
>and make sure to specify the full `url` for each global shortcut.

:::warning
Your app cannot have two global shortcuts with the same `name`.
:::

### Global Shortcut context

| name           | type                                                                                                                                                      | description                                                                                                                                                                                                |
|:---------------|:----------------------------------------------------------------------------------------------------------------------------------------------------------|:-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| payload        | [GlobalShortcutPayload](#global-shortcut-payload)                                                                                                         | The payload for the global shortcut                                                                                                                                                                        |
| say            | [SayFunction](#say-function)                                                                                                                              | Quickly reply to the trigger using the bot. See [SayFunction](#say-function)                                                                                                                               |
| ack            | () =\> Promise\<void\>                                                                                                                                    | Callback to acknowledge the trigger. This should be invoked within 3 seconds upon receiving the request. It's recommended for this to be the first call in the trigger handler.                            |
| nack           | (message?: String) =\> Promise\<void\>                                                                                                                    | Callback to reject the trigger. If provided with an argument the message will be sent to the user as an ephemeral message.                                                                                 |
| getBotClient   | () =\> Promise\<ApiClient \| undefined\>                                                                                                                  | Get the bot ApiClient for the workspace where the trigger was invoked. If you have set `{bot: false}` in the [manifest](/manifest#manifest-payload) this will return undefined                             |
| getUserClient  | (userId?: String) =\> Promise\<ApiClient \| undefined\>                                                                                                   | Return the user client given a user ID. If userId is not fed in this method it will try to find a the ApiClient of the triggering user. If the user has not authorized your app this will return undefined |
| getManifest    | () =\> [Manifest](/manifest#manifest-payload)                                                                                                             | Return the manifest of your app. This can be used if you need to access some manifest configuration or secret                                                                                              |
| getBotUserId   | () =\> Promise\<String \| undefined\>                                                                                                                     | Get the bot user ID for the workspace where the trigger was invoked. If you have set `{bot: false}` in the [manifest](/manifest#manifest-payload) this will return undefined                               |
| getAuthUrl     | ()=\> String                                                                                                                                              | Generate an auth URL that when opened it will show the Pumble Consent screen to authorize your app                                                                                                         |
| spawnModalView | ([View<"MODAL">](/modals-views-reference#modal) \| [StorageIntegrationModalCredentials](/modals-views-reference#storage-integration)) =\> Promise\<void\> | Triggers creation of a modal (regular modal or storage integration modal).                                                                                                                                                                                      |

The global shortcut payload will contain all the relevant information for the trigger event

### Global Shortcut payload

| name        | type   | optional | description                                  |
|:------------|:-------|:---------|:---------------------------------------------|
| shortcut    | String | false    | The shortcut name that was invoked           |
| userId      | String | false    | The user who invoked the shortcut            |
| channelId   | String | false    | The channel where the shortcut was invoked   |
| workspaceId | String | false    | The workspace where the shortcut was invoked |
| triggerId   | String | false    | Internal identifier of the action.           |

## Message Shortcuts

To create Message Shortcuts in your `main.ts` App object, insert the property `messageShortcuts`:

```typescript

// main.ts
const app: App = {
    messageShortcuts: [
        {
            name: 'Message Shortcut',
            description: 'Message shortcut description',
            handler: async (ctx) => {
                console.log('Received message shortcut');
            }
        },
    ]
}
```

>[!NOTE]
>If you created an App object using `setup` function, insert the `messageShortcuts` property within the `AddonManifest` object,
>and make sure to specify the full `url` for each message shortcut.

:::warning
Your app cannot have two message shortcuts with the same `name`. 
:::

### Message Shortcut context

| name           | type                                                                                                                                                      | description                                                                                                                                                                                                                                                                                |
|:---------------|:----------------------------------------------------------------------------------------------------------------------------------------------------------|:-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| payload        | [MessageShortcutPayload](#message-shortcut-payload)                                                                                                       | The payload for the global shortcut                                                                                                                                                                                                                                                        |
| say            | [ReplyFunction](#reply-function)                                                                                                                          | Quickly reply to the trigger using the bot. See [ReplyFunction](#reply-function)                                                                                                                                                                                                           |
| ack            | () =\> Promise\<void\>                                                                                                                                    | Callback to acknowledge the trigger. This should be invoked within 3 seconds upon receiving the request. It's recommended for this to be the first call in the trigger handler.                                                                                                            |
| nack           | (message?: String) =\> Promise\<void\>                                                                                                                    | Callback to reject the trigger. If provided with an argument the message will be sent to the user as an ephemeral message.                                                                                                                                                                 |
| getBotClient   | () =\> Promise\<ApiClient \| undefined\>                                                                                                                  | Get the bot ApiClient for the workspace where the trigger was invoked. If you have set `{bot: false}` in the [manifest](/manifest#manifest-payload), this will return undefined.                                                                                                           |
| getUserClient  | (userId?: String) =\> Promise\<ApiClient \| undefined\>                                                                                                   | Return the user client given a user ID. If `userId` is not fed in this method it will try to find a the ApiClient of the triggering user. If the user has not authorized your app, this will return undefined.                                                                             |
| getManifest    | () =\> [Manifest](/manifest#manifest-payload)                                                                                                             | Return the manifest of your app. This can be used if you need to access some manifest configuration or secret                                                                                                                                                                              |
| getBotUserId   | () =\> Promise\<String \| undefined\>                                                                                                                     | Get the bot user ID for the workspace where the trigger was invoked. If you have set `{bot: false}` in the [manifest](/manifest#manifest-payload), this will return undefined.                                                                                                             |
| getAuthUrl     | ()=\> String                                                                                                                                              | Generate an auth URL that when opened it will show the Pumble Consent screen to authorize your app                                                                                                                                                                                         |
| fetchMessage   | ()=\> Promise\<Message \| undefined\>                                                                                                                     | Fetch the message on which the shortcut was invoked. It will first try to fetch the message using the `ApiClient` of the user that invoked the trigger. If the user has not authorized, it will try to fetch with the bot `ApiClient`. If none of these succeed, it will return undefined. |
| spawnModalView | ([View<"MODAL">](/modals-views-reference#modal) \| [StorageIntegrationModalCredentials](/modals-views-reference#storage-integration)) =\> Promise\<void\> | Triggers creation of a modal (regular modal or storage integration modal).                                                                                                                                                                                                                                                                             |

The message shortcut payload will contain all the relevant information for the trigger event.

### Message Shortcut payload

| name        | type   | optional | description                                       |
|:------------|:-------|:---------|:--------------------------------------------------|
| shortcut    | String | false    | The shortcut name that was invoked                |
| userId      | String | false    | The user who invoked the shortcut                 |
| channelId   | String | false    | The channel where the shortcut was invoked        |
| workspaceId | String | false    | The workspace where the shortcut was invoked      |
| messageId   | String | false    | The message ID on which  the shortcut was invoked |
| triggerId   | String | false    | Internal identifier of the action.                |

## Block Interactions

To create block interaction handlers in your `main.ts` App object, insert the property `blockInteraction`:

```typescript

// main.ts
const app: App = {
    blockInteraction: {
        interactions: [
            {
                sourceType: "MESSAGE",
                handlers: {
                    bttn_1_action: async (ctx) => {
                        await ctx.ack();
                        await ctx.say("Button 1 pressed", "ephemeral");
                    },
                    bttn_2_action: async (ctx) => {
                        await ctx.ack();
                        await ctx.say("Button 2 pressed", "ephemeral");
                    }
                }
            },
            {
                sourceType: "VIEW",
                handlers: {
                    checkboxes_action: async (ctx) => {
                        await ctx.ack();
                        const checkboxesData = JSON.parse(ctx.payload.payload);
                        console.log(`Selected: ${checkboxesData.values}`);
                    }
                }
            },
            {
                sourceType: "EPHEMERAL_MESSAGE",
                handlers: {
                    select_menu_action: async (ctx) => {
                        await ctx.ack();
                        console.log("Item selected!");
                    }
                }
            }
        ]
    }
}
```

>[!NOTE]
>If you created an App object using `setup` function, insert the `blockInteraction` property within the `AddonManifest` object,
>with `handlerMesssage`, `handlerEphemeralMessage` and `handlerView` interaction handlers, and make sure to specify the full `url` for block interactions.

Block interaction context depends on the source type of the interaction (whether it is a message, an ephemeral message, or a view).
Therefore, interaction handlers must be specified along with the appropriate block interaction source type.

### Block interaction context (sourceType: MESSAGE)

| name              | type                                                                                                                                                      | description                                                                                                                                                                                                                                                                                     |
|:------------------|:----------------------------------------------------------------------------------------------------------------------------------------------------------|:------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| payload           | [BlockInteractionPayload\<"MESSAGE"\>](#block-interaction-payload)                                                                                        | The payload for the global shortcut                                                                                                                                                                                                                                                             |
| say               | [ReplyFunction](#reply-function)                                                                                                                          | Quickly reply to the trigger using the bot. See [ReplyFunction](#reply-function)                                                                                                                                                                                                                |
| ack               | () =\> Promise\<void\>                                                                                                                                    | Callback to acknowledge the trigger. This should be invoked within 3 seconds upon receiving the request. It's recommended for this to be the first call in the trigger handler.                                                                                                                 |
| nack              | (message?: String) =\> Promise\<void\>                                                                                                                    | Callback to reject the trigger. If provided with an argument the message will be sent to the user as an ephemeral message.                                                                                                                                                                      |
| getBotClient      | () =\> Promise\<ApiClient \| undefined\>                                                                                                                  | Get the bot ApiClient for the workspace where the trigger was invoked. If you have set `{bot: false}` in the [manifest](/manifest#manifest-payload), this will return undefined.                                                                                                                |
| getUserClient     | (userId?: String) =\> Promise\<ApiClient \| undefined\>                                                                                                   | Return the user client given a user ID. If userId is not fed in this method it will try to find a the ApiClient of the triggering user. If the user has not authorized your app, this will return undefined.                                                                                    |
| getManifest       | () =\> [Manifest](/manifest#manifest-payload)                                                                                                             | Return the manifest of your app. This can be used if you need to access some manifest configuration or secret                                                                                                                                                                                   |
| getBotUserId      | () =\> Promise\<String \| undefined\>                                                                                                                     | Get the bot user ID for the workspace where the trigger was invoked. If you have set `{bot: false}` in the [manifest](/manifest#manifest-payload), this will return undefined.                                                                                                                  |
| getAuthUrl        | ()=\> String                                                                                                                                              | Generate an auth URL that when opened it will show the Pumble Consent screen to authorize your app                                                                                                                                                                                              |
| fetchMessage      | ()=\> Promise\<Message \| undefined\>                                                                                                                     | Fetch the message on which the interaction was triggered. It will first try to fetch the message using the `ApiClient` of the user that invoked the trigger. If the user has not authorized, it will try to fetch with the bot `ApiClient`. If none of these succeed, it will return undefined. |
| getChannelDetails | () =\> Promise\<ChannelInfo\>                                                                                                                             | Get channel information for the channel where the interaction was triggered, given the `channels:read` scope is granted for the user or bot.                                                                                                                                                    |
| spawnModalView    | ([View<"MODAL">](/modals-views-reference#modal) \| [StorageIntegrationModalCredentials](/modals-views-reference#storage-integration)) =\> Promise\<void\> | Triggers creation of a modal (regular modal or storage integration modal).                                                                                                                                                                                                                      |

### Block interaction context (sourceType: EPHEMERAL_MESSAGE)

| name              | type                                                                                                                                                      | description                                                                                                                                                                                                  |
|:------------------|:----------------------------------------------------------------------------------------------------------------------------------------------------------|:-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| payload           | [BlockInteractionPayload \<"EPHEMERAL_MESSAGE"\>](#block-interaction-payload)                                                                             | The payload for the global shortcut                                                                                                                                                                          |
| ack               | () =\> Promise\<void\>                                                                                                                                    | Callback to acknowledge the trigger. This should be invoked within 3 seconds upon receiving the request. It's recommended for this to be the first call in the trigger handler.                              |
| nack              | (message?: String) =\> Promise\<void\>                                                                                                                    | Callback to reject the trigger. If provided with an argument the message will be sent to the user as an ephemeral message.                                                                                   |
| getBotClient      | () =\> Promise\<ApiClient \| undefined\>                                                                                                                  | Get the bot ApiClient for the workspace where the trigger was invoked. If you have set `{bot: false}` in the [manifest](/manifest#manifest-payload), this will return undefined.                             |
| getUserClient     | (userId?: String) =\> Promise\<ApiClient \| undefined\>                                                                                                   | Return the user client given a user ID. If userId is not fed in this method it will try to find a the ApiClient of the triggering user. If the user has not authorized your app, this will return undefined. |
| getManifest       | () =\> [Manifest](/manifest#manifest-payload)                                                                                                             | Return the manifest of your app. This can be used if you need to access some manifest configuration or secret                                                                                                |
| getBotUserId      | () =\> Promise\<String \| undefined\>                                                                                                                     | Get the bot user ID for the workspace where the trigger was invoked. If you have set `{bot: false}` in the [manifest](/manifest#manifest-payload), this will return undefined.                               |
| getAuthUrl        | ()=\> String                                                                                                                                              | Generate an auth URL that when opened it will show the Pumble Consent screen to authorize your app                                                                                                           |
| getChannelDetails | () =\> Promise\<ChannelInfo\>                                                                                                                             | Get channel information for the channel where the interaction was triggered, given the `channels:read` scope is granted for the user or bot.                                                                 |
| spawnModalView    | ([View<"MODAL">](/modals-views-reference#modal) \| [StorageIntegrationModalCredentials](/modals-views-reference#storage-integration)) =\> Promise\<void\> | Triggers creation of a modal (regular modal or storage integration modal).                                                                                                                                   |

### Block interaction context (sourceType: VIEW)

| name              | type                                                                                                       | description                                                                                                                                                                                                   |
|:------------------|:-----------------------------------------------------------------------------------------------------------|:--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| payload           | [BlockInteractionPayload\<"VIEW"\>](#block-interaction-payload)                                            | The payload for the block interacion.                                                                                                                                                                         |
| ack               | () =\> Promise\<void\>                                                                                     | Callback to acknowledge the trigger. This should be invoked within 3 seconds upon receiving the request. It's recommended for this to be the first call in the trigger handler.                               |
| nack              | (message?: String) =\> Promise\<void\>                                                                     | Callback to reject the trigger. If provided with an argument the message will be sent to the user as an ephemeral message.                                                                                    |
| getBotClient      | () =\> Promise\<ApiClient \| undefined\>                                                                   | Returns the bot ApiClient for the workspace where the trigger was invoked. If you have set `{bot: false}` in the [manifest](/manifest#manifest-payload), this will return undefined.                          |
| getUserClient     | (userId?: String) =\> Promise\<ApiClient \| undefined\>                                                    | Returns the user client given a user ID. If userId is not fed in this method it will try to find a the ApiClient of the triggering user. If the user has not authorized your app, this will return undefined. |
| getManifest       | () =\> [Manifest](/manifest#manifest-payload)                                                              | Returns the manifest of your app. This can be used if you need to access some manifest configuration or secret                                                                                                |
| getBotUserId      | () =\> Promise\<String \| undefined\>                                                                      | Returns the bot user ID for the workspace where the trigger was invoked. If you set `{bot: false}` in the [manifest](/manifest#manifest-payload), this will return undefined.                                 |
| getAuthUrl        | ()=\> String                                                                                               | Generate an auth URL that when opened it will show the Pumble Consent screen to authorize your app.                                                                                                           |
| pushModalView     | ([View<"MODAL">](/modals-views-reference#modal)) =\> Promise\<void\>                                       | Triggers creation of a child modal, whose parent if the view from which the interaction was triggered.                                                                                                        |
| updateView        | ([View<"MODAL">](/modals-views-reference#modal)) =\> Promise\<void\>                                       | Updated the view from which the interaction was triggered.                                                                                                                                                    |
| viewId            | String \| undefined                                                                                        | ID of the view, from which the interaction was triggered.                                                                                                                                                     |
| viewType          | String \| undefined                                                                                        | Type of the view, from which the interaction was triggered. Possible values are `MODAL` and `HOME`.                                                                                                           |
| viewTitle         | [TextElement](/blocks#text-element) \| undefined                                                           | Title of the view, from which the interaction was triggered.                                                                                                                                                  |
| viewState         | [State](/modals-views-reference#state) \| undefined                                                        | State object of the view, from which the interaction was triggered.                                                                                                                                           |
| viewBlocks        | [Main Block](/blocks)[] \| undefined                                                                       | Displayed content of the view, from which the interaction was triggered.                                                                                                                                      |
| viewSubmit        | [Text Block](/blocks#text-element) \| undefined                                                            | Content of the `submit` button of the modal, from which the interaction was triggered.                                                                                                                        |
| viewCallbackId    | String \| undefined                                                                                        | Callback ID of the modal, from which the interaction was triggered.                                                                                                                                           |
| viewClose         | [Text Block](/blocks#text-element) \| undefined                                                            | Content of the `close` button of the modal, from which the interaction was triggered.                                                                                                                         |
| viewNotifyOnClose | Boolean \| undefined                                                                                       | Specifies if the `onClose` handler should be triggered, when the modal from which the interaction was triggered is dismissed without submission.                                                              |
| parentViewId      | String \| undefined                                                                                        | In case the modal from which the interaction was triggered was spawned as a child of another modal, this field specifies the ID of the parent modal.                                                          |
| viewBuilder       | (view: [View\<"MODAL" \| "HOME_VIEW"\>](/modals-views-reference)) => ViewBuilder\<"MODAL" \| "HOME_VIEW"\> | Returns a function that takes a view object as an argument, and returns a builder object with helper methods for easier manipulaton of the view object content (append blocks, update state, update title...) |

### Block Interaction payload

| name           | type    | optional | description                                                                                                                                                                                             |
|:---------------|:--------|:---------|:--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| workspaceIs    | String  | false    | ID of the workspace, where the interaction was triggered.                                                                                                                                               |
| userId         | String  | false    | ID of the user who triggered the interaction.                                                                                                                                                           |
| channelId      | String  | true     | ID of the channel, where the interaction was triggered.                                                                                                                                                 |
| sourceType     | String  | false    | Type of the source of the interaction. Possible values are `MESSAGE`, `EPHEMERAL_MESSAGE`, `VIEW`.                                                                                                      |
| sourceId       | String  | false    | ID of the source of the interaction (message ID, ephemeral message ID, or view ID).                                                                                                                     |
| actionType     | String  | false    | Type of the interactive element, from which the interaction was triggered. Possible values are `BUTTON`, `STATIC_SELECT_MENU`, `DYNAMIC_SELECT_MENU`, `CHECKBOXES`, `DATE_PICKER`, `DATE_RANGE_PICKER`. |
| onAction       | String  | false    | Action identifier the interactive element, from which the interaction was triggered.                                                                                                                    |
| payload        | String  | false    | JSON string containing value(s) entered or selected by the interaction.                                                                                                                                 |
| view           | View    | true     | View object, representing the view from which the interaction was triggered. Applicable only when sourceType is `VIEW`.                                                                                 |
| loadingTimeout | Integer | false    | Duration of interactive element's loading state, which is entered after the interaction is triggered. Will be `0` if interactive element does not enter loading state upon interaction.                 |
| triggerId      | String  | false    | Internal identifier of the interaction.                                                                                                                                                                 |

## View Action

To create view action handlers in your `main.ts` App object, insert the property `viewAction`, with `onSubmit` and `onClose` handlers:

```typescript

// main.ts
const app: App = {
    viewAction: {
        onSubmit: {
            modal_callback_id: async (ctx) => {
                await ctx.ack();
                console.log(`Modal submitted with state ${JSON.stringify(ctx.payload.view.state)}.`);
            }
        },
        onClose: {
            modal_callback_id: async (ctx) => {
                await cts.ack();
                console.log('Modal closed.');
            }
        }
    }
}
```

>[!NOTE]
>If you created an App object using `setup` function, insert the `viewAction` property within the `AddonManifest` object,
>with the view action handler, and make sure to specify the full `url` for block interactions.

### View Action context

| name              | type                                                                                                                                                      | description                                                                                                                                                                                                   |
|:------------------|:----------------------------------------------------------------------------------------------------------------------------------------------------------|:--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| payload           | [ViewActionPayload](#view-action-payload)                                                                                                                 | The payload for the block interacion.                                                                                                                                                                         |
| ack               | () =\> Promise\<Void\>                                                                                                                                    | Callback to acknowledge the trigger. This should be invoked within 3 seconds upon receiving the request. It's recommended for this to be the first call in the trigger handler.                               |
| nack              | (message?: String) =\> Promise\<Void\>                                                                                                                    | Callback to reject the trigger. If provided with an argument the message will be sent to the user as an ephemeral message.                                                                                    |
| getBotClient      | () =\> Promise\<ApiClient \| undefined\>                                                                                                                  | Returns the bot ApiClient for the workspace where the trigger was invoked. If you have set `{bot: false}` in the [manifest](/manifest#manifest-payload), this will return undefined.                          |
| getUserClient     | (userId?: String) =\> Promise\<ApiClient \| undefined\>                                                                                                   | Returns the user client given a user ID. If userId is not fed in this method it will try to find a the ApiClient of the triggering user. If the user has not authorized your app, this will return undefined. |
| getManifest       | () =\> [Manifest](/manifest#manifest-payload)                                                                                                             | Returns the manifest of your app. This can be used if you need to access some manifest configuration or secret                                                                                                |
| getBotUserId      | () =\> Promise\<String \| undefined\>                                                                                                                     | Returns the bot user ID for the workspace where the trigger was invoked. If you set `{bot: false}` in the [manifest](/manifest#manifest-payload), this will return undefined.                                 |
| getAuthUrl        | ()=\> String                                                                                                                                              | Generate an auth URL that when opened it will show the Pumble Consent screen to authorize your app.                                                                                                           |
| spawnModalView    | ([View<"MODAL">](/modals-views-reference#modal) \| [StorageIntegrationModalCredentials](/modals-views-reference#storage-integration)) =\> Promise\<void\> | Triggers creation of a modal (regular modal or storage integration modal).                                                                                                                                    |
| viewId            | String \| undefined                                                                                                                                       | ID of the view, from which the interaction was triggered.                                                                                                                                                     |
| viewType          | String \| undefined                                                                                                                                       | Type of the view, from which the interaction was triggered. Possible values are `MODAL` and `HOME`.                                                                                                           |
| viewTitle         | [TextElement](/blocks#text-element) \| undefined                                                                                                          | Title of the view, from which the interaction was triggered.                                                                                                                                                  |
| viewState         | [State](/modals-views-reference#state) \| undefined                                                                                                       | State object of the view, from which the interaction was triggered.                                                                                                                                           |
| viewBlocks        | [Main Block](/blocks)[] \| undefined                                                                                                                      | Displayed content of the view, from which the interaction was triggered.                                                                                                                                      |
| viewSubmit        | [Text Block](/blocks#text-element) \| undefined                                                                                                           | Content of the `submit` button of the modal, from which the interaction was triggered.                                                                                                                        |
| viewCallbackId    | String \| undefined                                                                                                                                       | Callback ID of the modal, from which the interaction was triggered.                                                                                                                                           |
| viewClose         | [Text Block](/blocks#text-element) \| undefined                                                                                                           | Content of the `close` button of the modal, from which the interaction was triggered.                                                                                                                         |
| viewNotifyOnClose | Boolean \| undefined                                                                                                                                      | Specifies if the `onClose` handler should be triggered, when the modal from which the interaction was triggered is dismissed without submission.                                                              |
| parentViewId      | String \| undefined                                                                                                                                       | In case the modal from which the interaction was triggered was spawned as a child of another modal, this field specifies the ID of the parent modal.                                                          |
| viewBuilder       | (view: [View\<"MODAL" \| "HOME_VIEW"\>](/modals-views-reference)) => ViewBuilder\<"MODAL" \| "HOME_VIEW"\>                                                | Returns a function that takes a view object as an argument, and returns a builder object with helper methods for easier manipulaton of the view object content (append blocks, update state, update title...) |

### View Action payload

| name           | type                                             | optional | description                                                                   |
|:---------------|:-------------------------------------------------|:---------|:------------------------------------------------------------------------------|
| workspaceIs    | String                                           | false    | ID of the workspace, where the view action was triggered.                     |
| userId         | String                                           | false    | ID of the user who triggered the view action.                                 |
| channelId      | String                                           | true     | ID of the channel, where the view action was triggered.                       |
| viewActionType | String                                           | false    | Type of the source of the view action. Possible values are `SUBMIT`, `CLOSE`. |
| view           | [View\<"MODAL"\>](/modals-views-reference#modal) | false    | View object, whose submit or close action was triggered.                      |
| triggerId      | String                                           | false    | Internal identifier of the action.                                            |

## Events

To subscribe to events, you have to add the event listeners in the main `App`.
Events do not need to be acknowledged.

```typescript
const app: App = {
	events: [
		{
			name: "NEW_MESSAGE",
			handler: async (ctx) => {
                console.log("New message arrived!");
			}
		}
	]
}
```

>[!NOTE]
>If you created an App object using `setup` function, insert the `eventSubscriptions` property within the `AddonManifest` object, and make sure to specify the full `url` for it.

 There are two types of events:
 1. [App specific events](#unauthorize-and-uninstall-events) ( `APP_UNAUTHORIZED` and `APP_UNINSTALLED` )
 2. [Pumble Events](#pumble-events)

While App specific events do not require any special scope to be able to receive them, Pumble Events usually requires the users or bots to have authorized your app with certain scopes to receive them.
So, for example, if you have `messages:read` scope for the bot but not for users, you will receive only `NEW_MESSAGE` events that the bot can read.

The list of Pumble Events and their scopes:

| event                   | scopes          |
|:------------------------|:----------------|
| `NEW_MESSAGE`           | `messages:read` |
| `UPDATED_MESSAGE`       | `messages:read` |
| `REACTION_ADDED`        | `reaction:read` |
| `CHANNEL_CREATED`       | `channels:read` |
| `WORKSPACE_USER_JOINED` | `user:read`     |

### Unauthorize and Uninstall events 

These events will be useful to clean up the tokens in the token store, and do any other cleanup after user un-authorizes.

```typescript
const app: App = {
	events: [
		{
			name: "APP_UNAUTHORIZED",
			handler: async (ctx) => {
				console.log("UNAUTHORIZED USER", ctx.payload.body.workspaceUser)
			}
		}
	]
}
```

### Pumble Events

#### Pumble Events Context

| name          | type                                                   | description                                                                                                                                                                                                                                                                                                                                         |
|:--------------|:-------------------------------------------------------|:----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| payload       | [EventPayload](#event-payload)                         | The payload for the global shortcut                                                                                                                                                                                                                                                                                                                 |
| getBotClient  | () =\> Promise\<ApiClient \| undefined\>               | Get the bot ApiClient for the workspace where the trigger was invoked. If you have set `{bot: false}` in the [manifest](/manifest#manifest-payload) this will return undefined                                                                                                                                                                      |
| getUserClient | (userId: String) =\> Promise\<ApiClient \| undefined\> | An event that arrives in your app can apply to more than one user. Therefore `getUserClient` the event is not user specific so `userId` must be provided. An exception for this rule applies to `NEW_MESSAGE`, `UPDATED_MESSAGE` and `REACTION_ADDED` event. The default user ID in `getUserClient` for these events is the message/reaction author |
| getManifest   | () =\> [Manifest](/manifest#manifest-payload)          | Return the manifest of your app. This can be used if you need to access some manifest configuration or secret                                                                                                                                                                                                                                       |
| getBotUserId  | () =\> Promise\<String \| undefined\>                  | Get the bot user ID for the workspace where the trigger was invoked. If you have set `{bot: false}` in the [manifest](/manifest#manifest-payload) this will return undefined                                                                                                                                                                        |
| getAuthUrl    | ()=\> String                                           | Generate an auth URL that when opened it will show the Pumble Consent screen to authorize your app                                                                                                                                                                                                                                                  |

#### `NEW_MESSAGE` Event Context

`NEW_MESSAGE` Event context in addition to the normal events context has the `say` function. See [Reply Function](#reply-function)

#### `REACTION_ADDED` Event Context

`REACTION_ADDED` Event context in addition to the normal events context has `fetchMessage` function. 
This function will first try to find the `ApiClient` of the reaction author. If that is not successful it will fall back the the bot `ApiClient` and will try to fetch the message where the reaction was added.

#### Event Payload

| name             | type     | description                                                                                                                                         |
|:-----------------|:---------|:----------------------------------------------------------------------------------------------------------------------------------------------------|
| body             | Object   | Event specific body                                                                                                                                 |
| eventType        | String   | Type of the event                                                                                                                                   |
| workspaceId      | String   | Workspace ID where the event happened                                                                                                               |
| workspaceUserIds | String[] | The list of users that have authorized the app with the required event scopes, and they have access to the event (bot can be included in this list) |

<details>
<summary>NEW_MESSAGE event body</summary>

| name | type                       | description                                                                              |
|:-----|:---------------------------|:-----------------------------------------------------------------------------------------|
| mId  | String                     | Message ID.                                                                              |
| wId  | String                     | Workspace ID, where the message was sent.                                                |
| cId  | String                     | Channel ID, in which the message was sent.                                               |
| trId | String                     | Thread root message ID, in case the message is a reply.                                  |
| stc  | Boolean                    | If message is a reply, specifies if it was also sent to channel.                         |
| trMt | String                     | Message text of the thread root message, in case the message is a reply.                 |
| aId  | String                     | Message author ID.                                                                       |
| tx   | String                     | Message text.                                                                            |
| bl   | Record\<String, Object\>[] | Message blocks.                                                                          |
| ty   | String                     | Type of the event. In this case, it is always `NEW_MESSAGE`                              |
| ts   | String                     | Timestamp denoting when the message was sent.                                            |
| tsm  | Number                     | Timestamp in milliseconds, denoting when the message was sent.                           |
| st   | String                     | Message subtype. Applicable to system messages only.                                     |
| rid  | String                     | Identifier of a request, that triggered the message to be sent.                          |
| f    | Object[]                   | Array of message files.                                                                  |
| att  | Record\<String, Object\>   | Message attachments.                                                                     |
| mm   | Object                     | Message metadata (can contains information about a call, or message translations).       |
| md   | String[]                   | An array of IDs of users who were directly mentioned in the message.                     |
| mc   | String[]                   | An array of IDs of users who were mentioned in the message through a channel mention.    |
| mu   | String[]                   | An array of IDs of users who were mentioned in the message through a user group mention. |
| au   | Object                     | idk                                                                                      |
| e    | Boolean                    | Indicates if the message was edited.                                                     |
| eph  | Boolean                    | Indicates if the message is en ephemeral message.                                        |

</details>

<details>
<summary>UPDATED_MESSAGE event body</summary>

| name | type                       | description                                                                                                                                                             |
|:-----|:---------------------------|:------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| mId  | String                     | Message ID.                                                                                                                                                             |
| wId  | String                     | Workspace ID, where the message was sent.                                                                                                                               |
| cId  | String                     | Channel ID, in which the message was sent.                                                                                                                              |
| trId | String                     | Thread root message ID, in case the message is a reply.                                                                                                                 |
| stc  | Boolean                    | If message is a reply, specifies if it was also sent to channel.                                                                                                        |
| trMt | String                     | Message text of the thread root message, in case the message is a reply.                                                                                                |
| aId  | String                     | Message author ID.                                                                                                                                                      |
| tx   | String                     | Message text.                                                                                                                                                           |
| bl   | Record\<String, Object\>[] | Message blocks.                                                                                                                                                         |
| ty   | String                     | Type of the event. In this case, it is always `UPDATED_MESSAGE`.                                                                                                        |
| ts   | String                     | Timestamp denoting when the message was sent.                                                                                                                           |
| tsm  | Number                     | Timestamp in milliseconds, denoting when the message was sent.                                                                                                          |
| st   | String                     | Message subtype. Applicable to system messages only.                                                                                                                    |
| rid  | String                     | Identifier of a request, that triggered the message to be sent.                                                                                                         |
| f    | Object[]                   | Array of message files.                                                                                                                                                 |
| att  | Record\<String, Object\>   | Message attachments.                                                                                                                                                    |
| mm   | Object                     | Message metadata (can contains information about a call, or message translations).                                                                                      |
| md   | String[]                   | An array of IDs of users who were directly mentioned in the message.                                                                                                    |
| mc   | String[]                   | An array of IDs of users who were mentioned in the message through a channel mention.                                                                                   |
| mu   | String[]                   | An array of IDs of users who were mentioned in the message through a user group mention.                                                                                |
| au   | Object[]                   | An array of objects representing info about which users were affected by an action. Present for certain system messages (e.g. `joined_channel`, `invitation_accepted`). |
| e    | Boolean                    | Indicates if the message was edited.                                                                                                                                    |
| eph  | Boolean                    | Indicates if the message is en ephemeral message.                                                                                                                       |

</details>

<details>
<summary>REACTION_ADDED event body</summary>

| name | type   | description                                                       |
|:-----|:-------|:------------------------------------------------------------------|
| wId  | String | Workspace ID, where the reaction was added.                       |
| cId  | String | Channel ID, in which the reaction was added.                      |
| mId  | String | Message ID, to which the reaction was added.                      |
| mat  | String | ID of the author of the message, to which the reaction was added. |
| uId  | String | ID of the user who added the reaction.                            |
| rc   | String | Reaction emoji code.                                              |
| ty   | String | Type of the event. In this case, it is always `REACTION_ADDED`.   |
| rid  | String | Identifier of the request that triggered adding reaction.         |

</details>

<details>
<summary>CHANNEL_CREATED event body</summary>

| name | type     | description                                                                       |
|:-----|:---------|:----------------------------------------------------------------------------------|
| wId  | String   | Workspace ID, where the channel was created.                                      |
| cId  | String   | ID of the created channel.                                                        |
| cN   | String   | Channel name.                                                                     |
| cU   | String[] | Array of IDs of channel's members.                                                |
| cT   | String   | Channel type. Can be one of the following: `PUBLIC`, `PRIVATE`, `DIRECT`, `SELF`. |
| ty   | String   | Type of the event. In this case, it is always `CHANNEL_CREATED`.                  |
| rid  | String   | Identifier of the request that triggered channel creation.                        |

</details>

<details>
<summary>WORKSPACE_USER_JOINED event body</summary>

| name | type   | description                                                                                                         |
|:-----|:-------|:--------------------------------------------------------------------------------------------------------------------|
| uN   | String | Workspace user's name.                                                                                              |
| uE   | String | Workspace user's email.                                                                                             |
| uId  | String | Workspace user's ID.                                                                                                |
| afp  | String | Full path of the workspace user's avatar.                                                                           |
| asp  | String | Scaled path of the workspace user's avatar.                                                                         |
| wId  | String | ID of the workspace to which the user belongs.                                                                      |
| ty   | String | Type of the event. In this case, it is always `WORKSPACE_USER_JOINED`.                                              |
| tz   | String | Workspace user's time zone identifier.                                                                              |
| sts  | String | Timestamp denoting the time when workspace user's notifications will be resumed, after they manually paused them.   |
| pt   | String | Workspace user's profile title.                                                                                     |
| pp   | String | Workspace user's profile phone number.                                                                              |
| cs   | Object | Workspace user's custom status.                                                                                     |
| rid  | String | Identifier of the request that triggered workspace user joining.                                                    |
| st   | String | Workspace user's status. In this case, it will always be `ACTIVATED`                                                |
| ro   | String | Workspace user's role. Possible values are: `ADMINISTRATOR`, `USER`, `GUEST_MULTI_CHANNEL`, `GUEST_SINGLE_CHANNEL`. | 
| au   | String | Timestamp denoting until when the workspace user stays active. Applicable to guest users only.                      |
| ib   | String | ID of the workspace user's inviter.                                                                                 |

</details>

<details>
<summary>APP_UNAUTHORIZED event body</summary>

| name            | type     | description                                                 |
|:----------------|:---------|:------------------------------------------------------------|
| id              | String   | App authorization ID.                                       |
| app             | String   | App ID.                                                     |
| appInstallation | String   | App installation ID, to which the authorization belongs.    |
| workspace       | String   | Workspace ID, from which the authorization is removed.      |
| workspaceUser   | String   | ID of the workspace user who is removing app authorization. |
| grantedScopes   | String[] | An array of scopes that were granted by the authorization.  |
| accessGranted   | Boolean  | Indicates if the authorization was fully completed.         |
</details>

<details>
<summary>APP_UNINSTALLED event body</summary>

| name          | type   | description                                               |
|:--------------|:-------|:----------------------------------------------------------|
| id            | String | App installation ID.                                      |
| app           | String | App ID.                                                   |
| workspace     | String | Workspace ID, from which the authorization is removed.    |
| installedBy   | String | ID of the workspace user who installed the app.           |
| botUser       | String | ID of the bot user corresponding to the app installation. |
| uninstalledAt | Date   | Timestamp denoting when the app was uninstalled.          |
</details>

## Say function

Say function will use your app's bot to respond to a trigger.
By default, it will send an `ephemeral` message to the triggering user.

```typescript
async say(message: string | {text: string, blocks?: Block[], attachments?: Attachment[]}, type: "in_channel" | "ephemeral" = "ephemeral"){...}
```

## Reply function
Reply function is similar to [Say Function](#say-function), but it has one more extra parameter `reply`.
This function applies only to contexts where a message or message ID is present.

```typescript
await say("Message", "in_channel", true);
```
If it's set to true, the response will be posted as a reply to the original message. 
If the original message is in a thread, the response will be posted in the same thread.

