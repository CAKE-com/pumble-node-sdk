# Authorization

Pumble uses OAuth2 in order to allow your app to access the API.
- User first clicks on a link to Install/Authorize your app. This link can either be through Pumble's `Configure Apps` page or externally through a website.
- This link will open the Pumble Consent screen that will display the scopes that are requested.
- User clicks `Allow`, and Pumble will redirect the user to your `redirectUrl`. Pumble will add a query parameter to this url called `code`.
- Using this code and your `clientSecret`  (that is returned when you [create your app](/manifest)) you will be able to generate an access token.
- With this access token you will be able to use the Pumble API.

The link that will open the Pumble consent screen is in this format:

```http
https://app.pumble.com/access-request?redirectUrl=<REDIRECT_URL>&clientId=<CLIENT_ID>&scopes=<SCOPES>&defaultWorkspaceId=<DEFAULT_WORKSPACE_ID>&isReinstall=true
```

| name               | required | description                                                                                                                                                                                                                                                                                                                                                                                    |
|:-------------------|:---------|:-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| redirectUrl        | true     | The redirect URL where user will be redirected after they click `Allow`. This redirect URL must match one of your app's `redirectUrls`. This means that if you have a redirect URL of `https://example.com/redirect` it will match `https://example.com/redirect/other` but not `https://example.com`.                                                                                         |
| clientId           | true     | The ID of your app.                                                                                                                                                                                                                                                                                                                                                                            |
| scopes             | true     | The scopes that you have defined in your manifest.  These scopes are sent as a comma separated list of user scopes + bot scopes. Bot scopes however are prepended with `bot:`, for example: `messages:read,bot:messages:write`. Scopes can be only a subset or the full list of scopes that you have defined in your manifest. To view a list of all scopes, click [here](/api-client#scopes). |
| defaultWorkspaceId | false    | The default workspace ID to open consent screen to. Users will have the option to change the workspace, but when `defaultWorkspaceId` is provided that workspace will be preselected.                                                                                                                                                                                                          |
| isReinstall        | false    | If you need to reauthorize the bot with new scopes, reinstallation is required. Sending this query parameter with `true` will trigger a reinstallation, and therefore bot will be reauthorized.                                                                                                                                                                                                |

After user authorizes, they will be redirected to the specified `redirectUrl`, the authorization code will be in the `code` query parameter of the `redirectUrl`.
Using this code and your `clientSecret` provided when [creating your app](/manifest) you will be able to generate the access token for that user and for your bot.

```sh
curl 
curl --location 'https://api-ga.pumble.com/oauth2/access' \
--form 'client-id="<YOUR CLIENT ID>"' \
--form 'client-secret="<YOUR CLIENT SECRET>"' \
--form 'code="<AUTHORIZATION CODE>"'
```

After this request you will receive back this payload:

```json
{
    "accessToken": "<User's access token>",
    "botToken": "<Bot's access token>",
    "userId": "<User ID>",
    "botId": "<Bot ID in the workspace>",
    "workspaceId": "<Workspace ID>"
}
```

If your app requires a bot user, `botToken` and `botId` will be returned on every authorization.
However, it's good practice to always save them since one of these authorizations might be a reinstallation, therefore a new bot token is generated and the old one is invalidated.

:::tip
Generated access tokens do not need to be refreshed.\
They can however be invalidated by the user (when users unauthorize).
:::

## Using the SDK

Pumble SDK provides an easy way to set up the redirect page to capture authorization codes, generate access tokens and store them.
All you need to do is set up a Token Store in your app, and enable redirect.

```typescript
const app: App = {
    tokenStore: new JsonFileTokenStore('tokens.json'),
	redirect: { enable: true }
	//... Triggers
};
```
In order to return a custom page / response when user authorizes or access token generation fails all you need to do is override
`onSuccess` and `onError` callbacks in the `redirect` configuration.

```typescript
const app: App = {
    tokenStore: new JsonFileTokenStore('tokens.json'),
    redirect: {
        enable: true,
        onSuccess: (tokens, request, response) => {
            // This is called after tokens are saved in the store (if provided any)
            response.send('Authorization completed');
        },
        onError: (error, request, response) => {
            response.status(401).send('Could not authorize');
        },
    },
	//... Triggers
};
```
:::warning
If `onSuccess` or `onError` is overridden, please make sure to always return a `response`.
:::

## Token Store
Token store is the mechanism Pumble SDK uses to save the Access Tokens after they are generated and to get `ApiClient` in the relevant contexts.\
Pumble SDK provides two pre-implemented token stores: `JsonFileTokenStore` and `MongoDbTokenStore`.\
You can also implement your own custom store by providing an implementation with this interface:

```typescript
export interface CredentialsStore {
    getBotToken(workspaceId: string): Promise<string | undefined>;
    getUserToken(
        workspaceId: string,
        workspaceUserId: string
    ): Promise<string | undefined>;
    getBotUserId(workspaceId: string): Promise<string | undefined>;
    saveTokens(accessTokenResponse: OAuth2AccessTokenResponse): Promise<void>;
    deleteForWorkspace(workspaceId: string): Promise<void>;
    deleteForUser(workspaceUserId: string, workspaceId: string): Promise<void>;
    initialize(): Promise<void>;
}
```