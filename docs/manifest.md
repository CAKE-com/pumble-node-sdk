
# Overview

The manifest is your App's configuration that should be registered in Pumble.\
All the information that Pumble needs to know about your app exists in that configuration. 

This guide will show you how you can manually create and update your apps.\
You can also use `pumble-cli` instead of maintaining your apps manually which will automate this process for you, and will expose only the relevant details.\


## Creating an app

To manually create an app with a manifest you should send a request to this Pumble API endpoint:


```http
POST https://api-ga.pumble.com/workspaces/{workspace_id}/workspaceUsers/{workspace_user_id}/apps
```

with this json body see [Manifest Payload](#manifest-payload):
```json
{
    "name": "my_app",
    "displayName": "My App",
    "bot": true,
    "botTitle": "My App Bot Description",
    "socketMode": false,
    "scopes": {
        "botScopes": [
            "messages:read",
            "messages:write"
        ],
        "userScopes": [
            "messages:read",
            "messages:write"
        ]
    },
    "shortcuts": [
		{
			"shortcutType": "ON_MESSAGE"
			"url": "https://myapp.com/onmessage",
			"name": "message_shortcut",
			"displayName": "Message Shortcut",
			"description": "Message Shortcut Description"
		},
		{
			"shortcutType": "GLOBAL",
			"url": "https://myapp.com/global",
			"name": "global_shortcut",
			"displayName": "Global Shortcut",
			"description": "Global Shortcut Description"
		},
	],
    "slashCommands": [
        {
            "command": "/my_slash_command",
            "url": "https://myapp.com/slash",
            "description": "Google Calendar commands",
            "usageHint": "/my_slash_command [first][second]"
        }
    ],
    "eventSubscriptions": {
        "url": "https://myapp.com/events",
        "events": [
            "APP_UNAUTHORIZED",
            "APP_UNINSTALLED",
			"NEW_MESSAGE"
        ]
    },
    "redirectUrls": [
        "https://myapp.com/redirect"
    ],
	"helpUrl": "https://myapp.com/help",
	"listingUrl": "https://myapp.com/install-on-pumble",
    "welcomeMessage": "Hello :wave:",
    "offlineMessage": "We are experiencing some issues at the moment. Please try again later"
}
```

:::info
All the requests to manage your apps, need to you use `Authtoken` header. \
You can get this value in `~/.pumblerc` file `PUMBLE_ACCESS_TOKEN` after you login with `npx pumble-cli login` 
:::

You will get a response  with the full Manifest and your app's secrets

```json
{
	//...your manifest
	"id": "...",
	"clientSecret": "...",
	"appKey": "...",
	"signingSecret": "...",
}
```

| name         | description                                                                                                                                                                             |
| :----------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| id           | Your app's id. This will be used as the clientId in OAuth2 request. See [Authorization](/advanced-concepts#authorization).                                                              |
| clientSecret | Your app's clientSecret. This will be used to generate access tokens. See [Authorization](/advanced-concepts#authorization).                                                            |
| appKey       | Your app's  secret key. This should be sent on every Pumble request along with the access token. See [API](/api-client)                                                                 |
| signingKey   | Your app's signing key. Pumble will sign every request that will be sent to your endpoints with this key. See Verifying [Signature](/advanced-concepts#request-signature-verification). |

## Updating an app

To update your app you should send the updated manifest in this url:

```http
PUT https://api-ga.pumble.com/workspaces/{workspace_id}/workspaceUsers/{workspace_user_id}/apps/{app_id}
```
The secrets will remain unchanged.

## Listing your apps

To view a list of your created apps use this url:

```http
GET https://api-ga.pumble.com/workspaces/{workspace_id}/workspaceUsers/{workspace_user_id}/apps/mine
```
This list will not return secrets for every app

## Get your app manifest (along with it's secrets)

To get the full app manifest along with the secrets use this url

```http
GET https://api-ga.pumble.com/workspaces/{workspace_id}/workspaceUsers/{workspace_user_id}/apps/mine/{app_id}
```

## Manifest Payload

| name           | type                                    | required | default | description                                                                                                                                                                                                                                                 |
| :------------- | :-------------------------------------- | :------- | :------ | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| name           | string                                  | true     | -       | The name identifier for your app                                                                                                                                                                                                                            |
| displayName    | string                                  | true     | -       | The name that will be shown for your app. This also will be the name of the bots created when this app is installed                                                                                                                                         |
| bot            | boolean                                 | true     | -       | This specifies if your app should create a bot user when installed or not                                                                                                                                                                                   |
| botTitle       | string                                  | false    | -       | The description of your app that will be shown on the bot's profile                                                                                                                                                                                         |
| socketMode     | boolean                                 | false    | -       | If this is set to true all your of your app communication with Pumble will be done via websockets. Currently it's not implemented fully so it should be false                                                                                               |
| scopes         | [Scopes](#scopes)                       | true     | -       | Scopes that your app will use for both authorized users and your bot                                                                                                                                                                                        |
| shortcuts      | [Array\<Shortcut\>](#shortcuts)         | true     | -       | Global and message shortcuts definitions                                                                                                                                                                                                                    |
| slashCommands  | [Array\<SlashCommand\>](#slashcommands) | true     | -       | Your app's slash commands                                                                                                                                                                                                                                   |
| events         | [Events](#events)                       | true     | -       | Your app's Event subscriptions                                                                                                                                                                                                                              |
| redirectUrls   | Array\<string\>                         | true     | -       | The list of redirect urls that will be used to authorize your app. See [Authorization](/advanced-concepts#authorization).                                                                                                                                   |
| helpUrl        | string                                  | false    | null    | A valid url that Pumble will link for you app  in `Configure Apps` page                                                                                                                                                                                     |
| listingUrl     | string                                  | false    | null    | A valid url that will open when user clicks on `Install` or `Authorize` in `Configure Apps` page. If this is not specified Pumble will open the consent screen for you app, with all the scopes selected and the first `redirectUrl` in your `redirectUrls` |
| welcomeMessage | string                                  | false    | null    | This message, if specified will be sent to all the users in the workspace when your app is first installed                                                                                                                                                  |
| offlineMessage | string                                  | false    | null    | Whenver you app fails to respond to Pumble trigger requests this message will be shown as an ephemeral message                                                                                                                                              |



### Scopes

| name       | type            | required | default | description                                                                                                          |
| :--------- | :-------------- | :------- | :------ | :------------------------------------------------------------------------------------------------------------------- |
| botScopes  | Array\<string\> | true     | -       | Scopes that your bot will use in an installed workspace when making requests or subscribing to events                |
| userScopes | Array\<string\> | true     | -       | Scopes that your app will use when making requests, or subscribing on events on behalf of users that have authorized |

### Shortcuts

| name         | type                     | required | default | description                                                                                                                                      |
| :----------- | :----------------------- | :------- | :------ | :----------------------------------------------------------------------------------------------------------------------------------------------- |
| shortcutType | "ON_MESSAGE" \| "GLOBAL" | true     | -       | Specifies if the shortcut is a global or message shortcut                                                                                        |
| url          | string                   | true     | -       | Url where Pumble will send the signed request when the shortcut is triggered. You should respond to this request within 3 seconds to acknowledge |
| name         | string                   | true     | -       | Unique name across your app for the shortcut. Pumble will send this name when a trigger happens                                                  |
| displayName  | string                   | true     | -       | The name that will be shown in Pumble for this shortcut                                                                                          |
| description  | string                   | false    | null    | Description that users will see for this shortcut                                                                                                |

### SlashCommands

| name        | type   | required | default | description                                                                                                                                  |
| :---------- | :----- | :------- | :------ | :------------------------------------------------------------------------------------------------------------------------------------------- |
| command     | string | true     | -       | The actual command that will be typed in Pumble's message editor. It should start with `/`                                                   |
| url         | string | true     | -       | Url where Pumble will send the signed request when command is triggered. You should respond to this request within 3 seconds to acknowledge. |
| description | string | false    | null    | Description of the command                                                                                                                   |
| usageHint   | string | false    | null    | Usage hint of the command. It should include some hints for the text that should come after the slash command                                |

### Events
| name   | type            | required | default | description                                                                                       |
| :----- | :-------------- | :------- | :------ | :------------------------------------------------------------------------------------------------ |
| url    | string          | true     | -       | Url where Pumble events will be sent. These requests do not need to be acknowledged               |
| events | Array\<string\> | true     | -       | List of the events you want to subscribe. For more info read [Events](/triggers-reference#events) |