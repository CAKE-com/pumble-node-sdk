# Basic Concepts

## Pumble App components

A Pumble App has three main parts:
1. **The manifest**: The manifest is your app definition registered in Pumble.
   In the manifest you define your app name, bot name, all your triggers, event subscriptions, scopes etc.
   While `pumble-cli` will make the process of creating and registering the manifest easy, you can read more about the manifest [here](/manifest)

2. **The bot**: Optionally you can have a bot that comes along with your app. The bot is a user that represents your app in every workspace that your app is installed.\
   You can use the bot to display useful information about your app logic or simply use it to communicate with users. For every workspace you will have a different bot id.\
   When your app is installed in a workspace the bot user will be created and your app will receive an authorization code that, when used, will generate access tokens for both the user who installed your app and the bot. See [Authorization](/advanced-concepts#authorization)

3. **Your app server**: Pumble will notify your app on every event and trigger on the installed workspaces through the **public** HTTP endpoints defined in the [manifest](/manifest). So you will need to have a running HTTP server to be able to receive events and triggers from Pumble.


## Listening to messages

To listen to messages, in the main `app` object we define handlers for `NEW_MESSAGE` event.\
Make sure you have `messages:read` in the `botScopes` in your [`manifest.json`](/getting-started#manifest-json) (and optionally in `userScopes`)\
If only your App's bot has that scope you will listen to messages that bot has access to, otherwise you will receive messages for all authorized users with the scope.


The `NEW_MESSAGE` event handlers can have an optional `options` property.
| name               | type           | required           | description                                                                          |
| :----------------- | :------------- | :----------------- | :----------------------------------------------------------------------------------- |
| match              | string\|RegExp | no                 | Match if the message `text` includes a particular string or matches a RegExp pattern |
| includeBotMessages | boolean        | no (default false) | If it's set to true your app bot messages will be received by the handler            |

```typescript
const app: App = {
	//...
	events: [
		{
            name: 'NEW_MESSAGE',
            handler: async (ctx) => {
				console.log("Received a message.")
            },
		},
		{
            name: 'NEW_MESSAGE',
            options: { match: "hello" },
            handler: async (ctx) => {
				console.log("Received a message with hello", 
							ctx.payload.body.tx);
            },
		},
		{
            name: 'NEW_MESSAGE',
            options: { match: /^hello/ },
            handler: async (ctx) => {
				console.log("Received a message that STARTS with hello", 
							ctx.payload.body.tx);
            },
		},
		{
            name: 'NEW_MESSAGE',
            options: { includeBotMessages: true },
            handler: async (ctx) => {
				console.log("Received user or bot message");
            },
		}
	]
	//...
}
```

:::tip
Events can have one or more handlers.
:::

## Sending messages

The easiest way to send messages in your app is by using the `say()` function inside your listeners.\
The code below will send an ephemeral message on behalf of your App's bot.\
To be able to do this make sure you have `messages:write` scope for your bot. (in your [`manifest.json`](/getting-started#manifest-json))

```typescript
{
	name: 'NEW_MESSAGE',
	options: { includeBotMessages: true },
	handler: async (ctx) => {
		await ctx.say("Received a message");
	},
}
```

:::tip
Ephemeral messages can be sent on any channel (including user's self channel, DM's, Group Conversations and Private or Public channel)\
They are sent only to the user who triggered the event, and they will not be persisted.
:::

`say()` function also accepts a second argument which by default is `ephemeral` but it can be changed to `in_channel` in order
to post that message as a normal message.
In this case the bot will post a normal message. 

```typescript
{
	name: 'NEW_MESSAGE',
	handler: async (ctx) => {
		await ctx.say("Received a message", "in_channel");
	},
}
```

:::warning
While it's not required for the bot to be a member of the channel where it posts, if the bot is trying to post a message in a DM channel, or Group DM channel where he is not a member this method will fail.\
Bots will be able to post messages in any Public or Private channel.
:::

To send message on behalf of users your app needs to have `messages:write` user [scope](/getting-started#manifest-json), and users should have authorized your app.

```typescript
{
	name: 'NEW_MESSAGE',
	handler: async (ctx) => {
		// This will return author's client. 
		// To get any other user in the same workspace user ctx.getUserClient(user_id)
		const userClient = await ctx.getUserClient();
		if (userClient) {
			await userClient.v1.messages.postMessageToChannel(
				ctx.payload.body.cId,
				'Message form the same user'
			);
		}
	},
}
```

In some contexts that are related to a single message such as `MessageShortcut`, `NEW_MESSAGE`, `UPDATED_MESSAGE`, `REACTION_ADDED` the `say()` function has the ability to reply to the message.

```typescript
{
	name: 'NEW_MESSAGE',
	handler: async (ctx) => {
		await ctx.say('Received your message', 'in_channel', true);
	},
}
```

## Listening to events
Just like `NEW_MESSAGE` Pumble apps can subscribe to a list of Pumble events.
Each event has it's own payload and a list of user id's that have authorized your app and are eligible to receive that event

```typescript
const app: App = {
	//... Triggers
	events: [
		{
            name: 'REACTION_ADDED',
            options: { match: ':robot_face:' },
            handler: async (ctx) => {
				console.log("Workspace IDs: ", ctx.payload.workspaceId);
				console.log("User IDs: ", ctx.payload.workspaceUserIds);
				console.log("Event Body: ", ctx.payload.body);
                await ctx.say('RECEIVED ROBOT FACE');
            },

		}
	]
};
```
For more info about the available events click [here](/triggers-reference#events)

## Using the Pumble API

Your app can use the Pumble API on behalf of every user that has authorized it, or the bot in the workspace where your app is installed.
In order to use the build in ApiClient you need to set up the `tokenStore` in your App and enable `redirect` to be able to capture user [authorizations](/advanced-concepts#authorization).

```typescript
const app: App = {
    tokenStore: new JsonFileTokenStore('tokens.json'),
	redirect: { enable: true }
	//... Triggers
};
```

There are two type of clients `botClient` and `userClient`
`botClient` can be accessible in every trigger or event, while `userClient` is available only in triggers, and some events such as `NEW_MESSAGE`, `UPDATED_MESSAGE`, `REACTION_ADDED`.

```typescript
const app: App = {
	//...
	slashCommands: [
		{
            command: '/my_slash_command',
            handler: async (ctx) => {
                await ctx.ack();
                const botClient = await ctx.getBotClient();
                if (!botClient) return;
                const channel = await botClient.v1.channels.createChannel({
                    name: 'ChannelFromBot',
                    type: 'PUBLIC',
                });
                const userClient = await ctx.getUserClient();
                if (!userClient) return;
                await userClient.v1.messages
					.postMessageToChannel(channel.channel.id, 'First channel message');
            },
        }
	]
};
```
:::tip
Select either botClient or userClient depending on what you are trying to achieve.\
If you need to change user's custom status you need `userClient` for that.\
If you need to send a notification message you can use `botClient`
:::

For each `ApiClient` method you are trying to invoke make sure your bot or user has the required scopes.
For more information about API methods and scopes click [here](/api-client)

## Listening to triggers

There are 3 types of triggers that you App can define
1. Slash Commands
2. Global Shortcuts
3. Message Shortcuts

### Trigger Acknowledgement
Every trigger received must be acknowledged within 3 seconds, otherwise Pumble will consider it an error and return an ephemeral message to the user that your app is not available to handle the trigger.

```typescript
const app: App = {
	//...
	slashCommands: [
		{
            command: '/todo',
            handler: async (ctx) => {
                await ctx.ack();
            }
        }
	]
};
```

:::tip
You can customize the message that Pumble sends to the user in case of a missed acknowledgement by setting `offlineMessage` in the `App`

```typescript
const app: App = {
	//... config
    offlineMessage: 'We are experiencing some issues at the moment. Please try again later',
	//... Triggers
};
```
:::

### Slash Commands 

Slash commands can be typed by the users on any channel or thread, in workspaces where your App is installed.\
A user does not have to be authorized in order to use your App's triggers, so `getUserClient()` in a trigger context might not always return a value.

Slash Command context in its payload has information about the workspace where it was triggered, the user who triggered it, the channel and if applied the thread id where it was triggered.
Also in the same payload you will receive a `text` property, which is the text that user typed after the slash command

```typescript
const app: App = {
	//...
	slashCommands: [
		{
            command: '/todo',
            handler: async (ctx) => {
                await ctx.ack();
                const text = ctx.payload.text;
				if(!["add","remove", "list"].include(text)){
					await ctx.say("Invalid command");
					return;
				}
				await ctx.say(`Triggered /todo ${text} from <<@${ctx.payload.userId}>>` )
            },
        }
	]
};
```

### Global Shortcuts 

Global shortcuts are similar to Slash Commands with 2 main differences:
- Global shortcut does not have a `text` property
- Global shortcut does not have thread information if triggered in a thread

```typescript
globalShortcuts: [
	{
		name: 'My Global Shortcut',
		handler: async (ctx) => {
			await ctx.ack();
			await ctx.say(`Received global shortcut by <<@${ctx.payload.userId}>>`);
		},
	},
],
```

### Message Shortcuts

Message shortcuts are shortcuts that are always associated with a single message.  This means that message shortcuts will have `messageId` in the payload.\
Also message shortcuts have `fetchMessage()` method in their context, so it can be used to easily fetch the message where it was triggered.

```typescript
globalShortcuts: [
	{
		name: 'My Global Shortcut',
		handler: async (ctx) => {
			await ctx.ack();
			await ctx.say(`Received message shortcut by <<@${ctx.payload.userId}>>`);
			const message = await ctx.fetchMessage();
			if (!message) return;
			await ctx.say("The message text is: " + message.text);
		},
	},
],
```

:::warning
`fetchMessage()` will try to find if the triggering user has authorized your app and if so, it will try to fetch the message on behalf of that user.\
This means that users must have `messages:read` scope.\
If this is not successful it will try to fetch the message using the bot (if bot has access to that message).
:::

For more information about triggers and their contexts click [here](/triggers-reference)

## Authorization

When your App is published it will be visible to all workspaces, so they can install and authorize your app.\
Installation means that a bot user for your app will be created and you will receive both bot authorization code and user authorization code (for the user that installed your app initially)\
Other users in the workspace have to authorize in order for you app to receive their authorization codes.\
Users have to go to the `Configure Apps` page in Pumble (by clicking Add apps in the sidebar) and the will be able to install/authorize your app from there.

To capture the authorization codes of installing/authorizing users Pumble SDK provides a simple way to set up the page that Pumble will send users to, after they authorize.

```typescript
const app: App = {
    tokenStore: new JsonFileTokenStore('tokens.json'),
	redirect: { enable: true }
	//... Triggers
};
```

In order to share the installation link with a user you can use the `context.getAuthUrl()` in the context of triggers/events.

```typescript
const app: App = {
	//...
	slashCommands: [
		{
            command: '/my_slash_command',
            handler: async (ctx) => {
                await ctx.ack();
				const userClient = await ctx.getUserClient();
				if (!userClient) {
                    await ctx.say(`Please use this link to authorize: ${ctx.getAuthUrl({defaultWorkspaceId: ctx.payload.workspaceId})}` )
				} else {
					await ctx.say(`You are authorized`)
				}
            },
        }
	]
};
```

For more information about authorization and Pumble's OAuth2 click [here](/advanced-concepts#authorization)