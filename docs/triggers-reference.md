# Triggers

Pumble apps can subscribe to two types of triggers:

1. App specific triggers ([Slash Commands](#slash-commands), [Global Shortcuts](#global-shortcuts), [Message Shortcuts](#message-shortcuts))
2. [Pumble Events](#events)

The payloads for each specific trigger exist on every event handler context

```typescript
  slashCommands: [
        {
            command: '/my_slash_command',
            handler: async (ctx) => {
                await ctx.ack();
                const payload = ctx.payload;
            },
        },
    ],
```

## Slash Commands

To create slash commands, in your `main.ts` App object insert the property `slashCommands`

```typescript
const app: App = {
    slashCommands: [
        {
            command: '/my_slash_command',
            description: 'My slash command description',
            usageHint: '[usage hint]',
            handler: async (ctx) => {
                console.log('Received slash command');
            },
        },
	]
}
```

:::warning
You cannot have 2 slash commands with the same `command`
:::

### Slash command context:

| name              | type                                                    | description                                                                                                                                                                                                |
| :---------------- | :------------------------------------------------------ | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| payload           | [SlashCommandPayload](#slash-command-payload)           | The payload for the slash command                                                                                                                                                                          |
| say               | [SayFunction](#say-function)                            | Quickly reply to the trigger using the bot. See [SayFunction](#say-function)                                                                                                                               |
| ack               | () =\> Promise\<void\>                                  | Callback to acknowledge the trigger. This should be invoked within 3 seconds upon receiving the request. It's recommended for this to be the first call in the trigger handler.                            |
| nack              | (message?: string) =\> Promise\<void\>                  | Callback to reject the trigger. If provided with an argument the message will be sent to the user as an ephemeral message.                                                                                 |
| getBotClient      | () =\> Promise\<ApiClient \| undefined\>                | Get the bot ApiClient for the workspace where the trigger was invoked. If you ave set `{bot: false}` in the [manifest](/manifest#manifest-payload) this will return undefined                              |
| getUserClient     | (userId?: string) =\> Promise\<ApiClient \| undefined\> | Return the user client given a user id. If userId is not fed in this method it will try to find a the ApiClient of the triggering user. If the user has not authorized your app this will return undefined |
| getManifest       | () =\> [Manifest](/manifest#manifest-payload)           | Return the manifest of your app. This can be used if you need to access some manifest configuration or secret                                                                                              |
|                   |
| getBotUserId      | () =\> Promise\<string \| undefined\>                   | Get the bot user id for the workspace where the trigger was invoked. If you ave set `{bot: false}` in the [manifest](/manifest#manifest-payload) this will return undefined                                |
| getAuthUrl        | ()=\> string                                            | Generate an auth url that when opened it will show the Pumble Consent screen to authorize your app                                                                                                         |
| getChannelDetails | ()=\> Promise\<ChannelInfo\>                            | Get channel information for the channel where the command was invoked, given the `channels:read` scope is granted for the user or bot                                                                      |

The slash command payload will contain all the relevant information for the trigger event

### Slash command payload

| name         | type   | optional | description                                                      |
| :----------- | :----- | :------- | :--------------------------------------------------------------- |
| slashCommand | string | no       | The slash command that was invoked                               |
| text         | string | no       | The text that user typed after the slash command                 |
| userId       | string | no       | The user who invoked the slash command                           |
| channelId    | string | no       | The channel where the slash command was invoked                  |
| workspaceId  | string | no       | The workspace where the slash command was invoked                |
| threadRootId | string | yes      | The thread id if the slash command is invoked in a thread window |


## Global Shortcuts

To create global shortcuts in your `main.ts` App object insert the property `globalShortcuts`

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

:::warning
Your app cannot have two global shortcuts with the same name 
:::

### Global shortcut context:

| name          | type                                                    | description                                                                                                                                                                                                |
| :------------ | :------------------------------------------------------ | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| payload       | [GlobalShortcutPayload](#global-shortcut-payload)       | The payload for the global shortcut                                                                                                                                                                        |
| say           | [SayFunction](#say-function)                            | Quickly reply to the trigger using the bot. See [SayFunction](#say-function)                                                                                                                               |
| ack           | () =\> Promise\<void\>                                  | Callback to acknowledge the trigger. This should be invoked within 3 seconds upon receiving the request. It's recommended for this to be the first call in the trigger handler.                            |
| nack          | (message?: string) =\> Promise\<void\>                  | Callback to reject the trigger. If provided with an argument the message will be sent to the user as an ephemeral message.                                                                                 |
| getBotClient  | () =\> Promise\<ApiClient \| undefined\>                | Get the bot ApiClient for the workspace where the trigger was invoked. If you ave set `{bot: false}` in the [manifest](/manifest#manifest-payload) this will return undefined                              |
| getUserClient | (userId?: string) =\> Promise\<ApiClient \| undefined\> | Return the user client given a user id. If userId is not fed in this method it will try to find a the ApiClient of the triggering user. If the user has not authorized your app this will return undefined |
| getManifest   | () =\> [Manifest](/manifest#manifest-payload)           | Return the manifest of your app. This can be used if you need to access some manifest configuration or secret                                                                                              |
|               |
| getBotUserId  | () =\> Promise\<string \| undefined\>                   | Get the bot user id for the workspace where the trigger was invoked. If you ave set `{bot: false}` in the [manifest](/manifest#manifest-payload) this will return undefined                                |
| getAuthUrl    | ()=\> string                                            | Generate an auth url that when opened it will show the Pumble Consent screen to authorize your app                                                                                                         |

The global shortcut payload will contain all the relevant information for the trigger event

### Global shortcut payload

| name        | type   | optional | description                                  |
| :---------- | :----- | :------- | :------------------------------------------- |
| shortcut    | string | no       | The shortcut name that was invoked           |
| userId      | string | no       | The user who invoked the shortcut            |
| channelId   | string | no       | The channel where the shortcut was invoked   |
| workspaceId | string | no       | The workspace where the shortcut was invoked |

## Message Shortcuts

To create message shortcuts in your `main.ts` App object insert the property `messageShortcuts`

```typescript

// main.ts
const app: App = {
    messageShortcuts: [
        {
            name: 'Message Shortcut',
            description: 'Message shortcut description',
            handler: async (ctx) => {
                console.log('Received message shortcut');
            },
        },
	]
}
```

:::warning
Your app cannot have two message shortcuts with the same name 
:::

### Message shortcut context:

| name          | type                                                    | description                                                                                                                                                                                                                                                                             |
| :------------ | :------------------------------------------------------ | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| payload       | [MessageShortcutPayload](#message-shortcut-payload)     | The payload for the global shortcut                                                                                                                                                                                                                                                     |
| say           | [ReplyFunction](#reply-function)                        | Quickly reply to the trigger using the bot. See [ReplyFunction](#reply-function)                                                                                                                                                                                                        |
| ack           | () =\> Promise\<void\>                                  | Callback to acknowledge the trigger. This should be invoked within 3 seconds upon receiving the request. It's recommended for this to be the first call in the trigger handler.                                                                                                         |
| nack          | (message?: string) =\> Promise\<void\>                  | Callback to reject the trigger. If provided with an argument the message will be sent to the user as an ephemeral message.                                                                                                                                                              |
| getBotClient  | () =\> Promise\<ApiClient \| undefined\>                | Get the bot ApiClient for the workspace where the trigger was invoked. If you ave set `{bot: false}` in the [manifest](/manifest#manifest-payload) this will return undefined                                                                                                           |
| getUserClient | (userId?: string) =\> Promise\<ApiClient \| undefined\> | Return the user client given a user id. If userId is not fed in this method it will try to find a the ApiClient of the triggering user. If the user has not authorized your app this will return undefined                                                                              |
| getManifest   | () =\> [Manifest](/manifest#manifest-payload)           | Return the manifest of your app. This can be used if you need to access some manifest configuration or secret                                                                                                                                                                           |
|               |
| getBotUserId  | () =\> Promise\<string \| undefined\>                   | Get the bot user id for the workspace where the trigger was invoked. If you ave set `{bot: false}` in the [manifest](/manifest#manifest-payload) this will return undefined                                                                                                             |
| getAuthUrl    | ()=\> string                                            | Generate an auth url that when opened it will show the Pumble Consent screen to authorize your app                                                                                                                                                                                      |
| fetchMessage  | ()=\> Promise\<Message \| undefined\>                   | Fetch the message on which the shortcut was invoked. It will first try to fetch the message using the `ApiClient` of the user that invoked the trigger. If the user has not authorized it will try to fetch with the bot `ApiClient`. If none of these succeed it will return undefined |

The message shortcut payload will contain all the relevant information for the trigger event

### Message shortcut payload

| name        | type   | optional | description                                       |
| :---------- | :----- | :------- | :------------------------------------------------ |
| shortcut    | string | no       | The shortcut name that was invoked                |
| userId      | string | no       | The user who invoked the shortcut                 |
| channelId   | string | no       | The channel where the shortcut was invoked        |
| workspaceId | string | no       | The workspace where the shortcut was invoked      |
| messageId   | string | no       | The message id on which  the shortcut was invoked |

## Events

To subscribe to events you have to add the listeners in the main `App`
Events do not need to be acknowledged.

```typescript
const app: App = {
	events: [
		{
			name: "NEW_MESSAGE",
			handler: async (ctx) => {

			}
		}
	]
}
```

 There are two types of events:
 1. [App specific events](#unauthorize-and-uninstall-events) ( `APP_UNAUTHORIZED` and `APP_UNINSTALLED` )
 2. [Pumble Events](#pumble-events)

While App specific events do not require any special scope to be able to receive them, Pumble Events usually requires the users or bots to have authorized your app with certain scopes to receive them.
So, for example, if you have `messages:read` scope for the bot but not for users, you will receive only `NEW_MESSAGE` events that the bot can read.

The list of Pumble Events and their scopes:

| event                   | scopes          |
| :---------------------- | :-------------- |
| `NEW_MESSAGE`           | `messages:read` |
| `UPDATED_MESSAGE`       | `messages:read` |
| `REACTION_ADDED`        | `reaction:read` |
| `CHANNEL_CREATED`       | `channels:read` |
| `WORKSPACE_USER_JOINED` | `user:read`     |

### Unauthorize and Uninstall events 

These events will be useful to cleanup the tokens in the token store, and do any other cleanup after user un-authorizes 

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
| :------------ | :----------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| payload       | [EventPayload](#event-payload)                         | The payload for the global shortcut                                                                                                                                                                                                                                                                                                                 |
| getBotClient  | () =\> Promise\<ApiClient \| undefined\>               | Get the bot ApiClient for the workspace where the trigger was invoked. If you ave set `{bot: false}` in the [manifest](/manifest#manifest-payload) this will return undefined                                                                                                                                                                       |
| getUserClient | (userId: string) =\> Promise\<ApiClient \| undefined\> | An event that arrives in your app can apply to more than one user. Therefore `getUserClient` the event is not user specific so `userId` must be provided. An exception for this rule applies to `NEW_MESSAGE`, `UPDATED_MESSAGE` and `REACTION_ADDED` event. The default user id in `getUserClient` for these events is the message/reaction author |
| getManifest   | () =\> [Manifest](/manifest#manifest-payload)          | Return the manifest of your app. This can be used if you need to access some manifest configuration or secret                                                                                                                                                                                                                                       |
|               |
| getBotUserId  | () =\> Promise\<string \| undefined\>                  | Get the bot user id for the workspace where the trigger was invoked. If you ave set `{bot: false}` in the [manifest](/manifest#manifest-payload) this will return undefined                                                                                                                                                                         |
| getAuthUrl    | ()=\> string                                           | Generate an auth url that when opened it will show the Pumble Consent screen to authorize your app                                                                                                                                                                                                                                                  |

#### `NEW_MESSAGE` Event Context

`NEW_MESSAGE` Event context in addition to the normal events context has the `say` function. See [Reply Function](#reply-function)

#### `REACTION_ADDED` Event Context

`REACTION_ADDED` Event context in addition to the normal events context has `fetchMessage` function. 
This function will first try to find the `ApiClient` of the reaction author. If that is not successful it will fall back the the bot `ApiClient` and will try to fetch the message where the reaction was added.

#### Event Payload

| name             | type            | description                                                                                                                                         |
| :--------------- | :-------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------- |
| body             | object          | Event specific body                                                                                                                                 |
| eventType        | string          | Type of the event                                                                                                                                   |
| workspaceId      | string          | Workspace id where the event happened                                                                                                               |
| workspaceUserIds | Array\<string\> | The list of users that have authorized the app with the required event scopes, and they have access to the event (bot can be included in this list) |

## Say function

Say function will use your app's bot to respond to a trigger.
By default it will send an `ephemeral` message to the triggering user.

```typescript
async say(message: string | {text: string, blocks?: Block[], attachments?: Attachment[]}, type: "in_channel" | "ephemeral" = "ephemeral"){...}
```

## Reply function
Reply function is similar to [Say Function](#say-function), but it has one more extra parameter `reply`.
This function applies only to contexts where a message or message id is present.

```typescript
await say("Message", "in_channel", true);
```
If its set to true, the response will be posted as a reply to the original message. If the original message is in a thread, me response will be posted in the same thread.

