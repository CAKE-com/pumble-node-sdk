# Pumble SDK

A javascript framework to quickly build [Pumble](https://pumble.com) Apps.
Visit [the documentation](https://CAKE-com.github.io/pumble-node-sdk/getting-started) to explore the full guide on creating Pumble Apps

## Setup

Create a new project in an empty directory

```sh
mkdir my-pumble-app
cd my-pumble-app
npm init -y
```

Install the packages

```sh
npm install pumble-sdk
npm install -D pumble-cli typescript
```

Create `tsconfig.json` file in the root directory with the content below:
```json
{
    "compilerOptions": {
        "target": "es2016",
        "module": "commonjs",
        "rootDir": "./src",
        "outDir": "./dist",
        "esModuleInterop": true
    }
}
```

Create a `manifest.json` file with the content below:

```json
{
    "name": "my-pumble-app",
    "displayName": "My Pumble App",
    "botTitle": "My Pumble App Bot",
    "bot": true,
    "scopes": {
        "botScopes": [
            "messages:read",
            "messages:write"
        ],
        "userScopes": [
            "messages:read"
        ]
    }
}
```

Create  `src/main.ts` file with the content below

```sh
mkdir src
touch src/main.ts
```

```typescript
import { App, JsonFileTokenStore, start } from "pumble-sdk";

const addon: App = {
  slashCommands: [
    {
      command: "/my_slash_command",
      handler: async (ctx) => {
        await ctx.ack();
        await ctx.say("Received slash command!");
      },
    },
  ],
  redirect: { enable: true },
  tokenStore: new JsonFileTokenStore("tokens.json"),
};

start(addon);
```

Folder structure
```sh
.
├── manifest.json
├── package.json
├── src
│   └── main.ts
└── tsconfig.json
```

Run the project. When prompted provide your credentials to log in.

```sh
npx pumble-cli
```

**After everything is set up open Pumble and type `/my_slash_command`**

## Triggers
Pumble Apps can be triggered by App custom triggers or Pumble Events

### App Triggers

#### Slash Commands

```typescript
  slashCommands: [
	//.....
    {
      command: "/my_slash_command",
      handler: async (ctx) => {
        await ctx.ack();
        await ctx.say("Received slash command!");
      },
    },
	//.....
  ],
```
#### Global Shortcuts

```typescript
    globalShortcuts: [
		//...
        {
            name: 'My App Global Shortcut',
            handler: async (ctx) => {
                await ctx.ack();
				await ctx.say("Received global shortcut")
            },
        },
		//...
    ],
```

### Message Shortcuts

```typescript
    messageShortcuts: [
        {
            name: 'My App message shortcut',
            handler: async (ctx) => {
                await ctx.ack();
				await ctx.say("Received message shortcut")
            },
        },
	]
```

### Pumble Events

```typescript
    events: [
        {
            name: 'APP_UNAUTHORIZED',
            handler: (ctx) => {
                console.log('User unauthorized app');
            },
        },
        {
            name: 'REACTION_ADDED',
            options: { match: ':robot_face:' },
            handler: async (ctx) => {
				await ctx.say('BLEEP BLOOP')
            },
        },
        {
            name: 'NEW_MESSAGE',
            options: { includeBotMessages: false, match: /^greet/ },
            handler: async (ctx) => {
                await ctx.say('hello');
            },
        },
	]
```

### Triggers context

Each trigger callback has a context argument where you can find information information and helper methods to interact with Pumble.

```typescript
  slashCommands: [
	//.....
    {
      command: "/my_slash_command",
      handler: async (ctx) => {
        await ctx.ack();
		const userId = ctx.payload.userId;
		const workspaceId = ctx.payload.userId.
        await ctx.say("Received slash command!");
		await ctx.getUserClient();
      },
    },
	//.....
  ],
```

The properties below are available on every context:
| key          | type                                    | description                                                                                                                                                  |
| :----------- | :-------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| payload      | object                                  | The payload of the trigger. It contains all the relevant information of the trigger, such as workspace where it as triggered, triggering user etc.           |
| getBotClient | `() => Promise<ApiClient \| undefined>` | A method to get an instance of Pumble ApiClient in order to make requests in Pumble on behalf of your app's bot in the workspace where trigger was initiated |
| getBotUserId | `() => Promise<string \| undefined>`    | A method to get your App's bot id in the workspace where the trigger was initiated                                                                           |
| getManifest  | `() => AddonManifest`                   | A method to get the manifest of your App, in this manifest you can find all of your app's secrets and configurations                                         |
| getAuthUrl   | `() => string`                          | A method to generate a URL that would open Pumble's OAuth2 screen with your `client_id` and `scopes`                                                         |

Every trigger also has its own methods in the context,
For example `messageShortcuts`, `NEW_MESSAGE`, `UPDATED_MESSAGE` and `REACTION_ADDED` have `fetchMessage()` method
For more information about triggers and their contexts click here. TBD

### Responding to triggers

Slash commands, Global shortcuts, Message shortcuts, `NEW_MESSAGE` and `REACTION_ADDED` events
have `say()` method in their context
`say()` will send a message or ephemeral message as your App's bot


### Responding with an ephemeral message

```typescript
  slashCommands: [
	//.....
    {
      command: "/my_slash_command",
      handler: async (ctx) => {
        await ctx.ack();
        await ctx.say("Received slash command!");
      },
    },
	//.....
  ],
```

### Responding with a normal message

```typescript
  slashCommands: [
	//.....
    {
      command: "/my_slash_command",
      handler: async (ctx) => {
        await ctx.ack();
        await ctx.say("Received slash command!", 'in_channel');
      },
    },
	//.....
  ],
```

## Working with the Pumble API

All Trigger contexts have access to two methods `getUserClient()` and  `getBotClient()`
In all App trigger contexts (commands and shortcuts) a user id is not required for `getUserClient()` since it will try to automatically try to use the authorization of the user 
that triggered the request.
For events such as `NEW_MESSAGE`, `REACTION_ADDED`, `UPDATED_MESSAGE` the default user id if not provided in `getUserClient(user_id)` is the event author.

```typescript
  slashCommands: [
	//.....
    {
      command: "/my_slash_command",
      handler: async (ctx) => {
        await ctx.ack();
		const userClient = await ctx.getUserClient();
		if (userClient) {
			await userClient.v1.messages.postMessageToChannel(ctx.payload.channelId, "Message from user")
		}
		const botClient = await ctx.getBotClient();
		if (botClient) {
			await botClient.v1.messages.postMessageToChannel(ctx.payload.channelId, "Message from bot")
		}
      },
    },
	//.....
  ],
```