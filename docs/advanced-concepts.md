# Advanced Concepts

## Authorization

Pumble uses OAuth2 in order to allow your app to access the API.
- User first clicks on a link to Install/Authorize your app. This link can either be through Pumble's `Configure Apps` page or externally through a website.
- This link will open the Pumble Consent screen that will display the scopes that are requested. 
- User clicks `Allow`, and Pumble will redirect the user to your `redirectUrl`. Pumble will add a query parameter to this url called `code`.
- Using this code and your `clientSecret`  (that is returned when you [create your app](/manifest)) you will be able to generate an access token.
- With this access token you will be able to use the pumble api.

The link that will open the Pumble consent screen is in this format:

```
https://app.pumble.com/access-request?redirectUrl=<REDDIRECT_URL>&clientId=<CLIENT_ID>&scopes=<SCOPES>&defaultWorkspaceId=<DEFAULT_WORKSPACE_ID>&isReinstall=true
```

| name               | required | description                                                                                                                                                                                                                                                                                                                                                                                                               |
| :----------------- | :------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| redirectUrl        | yes      | The redirect url where user will be redirected after they click `Allow`. This redirect url must match one of your app's `redirectUrls`. This means that if you have a redirect url of `https://example.com/redirect` it will match `https://example.com/redirect/other` but not `https://example.com`                                                                                                                     |
| clientId           | yes      | The id of your app                                                                                                                                                                                                                                                                                                                                                                                                        |
| scopes             | yes      | The scopes that you have defined in your manifest.  These scopes are send as a comma separated list of user scopes + bot scopes. Bot scopes however are prepended with `bot:`. example: `messages:read,messages:write,bot:messages:read,bot:messages:write`, scopes can be only a subset or the full list of scopes that you have defined in your manifest. To view a list of all scopes click [here](/api-client#scopes) |
| defaultWorkspaceId | no       | The default workspace id to open consent screen to. Users will have the option to change the workspace, but when `defaultWorkspaceId` is provided that workspace will be preselected.                                                                                                                                                                                                                                     |
| isReinstall        | no       | If you need to re authorize the bot with new scopes, reInstallation is required, sending this query parameter with `true` will trigger a reinstallation, and therefore bot will be reauthorized                                                                                                                                                                                                                           |

After user authorizes, they will be redirected to the specified `redirectUrl`, the authorization code will be in the `code` query parameter of the `redirectUrl`.
Using this code and your `clientSecret` provided when [creating your app](/manifest) you will be able to generate the access token for that user and for your bot.

```sh
curl 
curl --location 'https://api-ga.pumble.com/oauth2/access' \
--form 'client-id="<<YOUR CLIENT ID>>"' \
--form 'client-secret="<<YOUR CLIENT SECRET>>"' \
--form 'code="<<AUTHORIZATION CODE>>"'
```

After this request you will receive back this payload:

```json
{
    "accessToken": "<<User's access token>>",
    "botToken": "<<Bot's access token>>",
    "userId": "<<User Id>>",
    "botId": "<<Bot Id in that workspace>>",
    "workspaceId": "<<Workspace ID>>"
}
```

If your app requires a bot user, `botToken` and `botId` will be returned on every authorization.
However it's good practice to always save them since one of these authorizations might be a reinstallation, therefore a new bot token is generated and the old one is invalidated.  

:::tip
Access tokens generated do not need to be refreshed.\
They can however be invalidated by the user (when users unauthorize)
:::

### Using the SDK

Pumble SDK provides an easy way to set up the redirect page to capture authorization codes, generate access tokens and store them.
All you need to do is setup a Token Store in your app, and enable redirect.

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
If `onSuccess` or `onError` overriden, please make sure to always return a `response`
:::

## Token Store
Token store is the mechanism Pumble SDK uses to save the Access Tokens after they are generated and to get `ApiClient` in the relevant contexts.\
Pumble SDK provides to pre-implemented token stores: `JsonFileTokenStore` and `MongoDbTokenStore`.\
You can also implement your own custom store by just providing an implementation with this interface:

```typescript
export interface CredentialsStore {
    getBotToken(workspaceId: string): Promise<string | undefined>;
    getUserToken(
        workspaceId: string,
        workspaceUserId: string
    ): Promise<string | undefined>;
    getBotUserId(workspaceId: string): Promise<string | undefined>;
    saveTokens(accessTokenResponse: OAuth2AccessTokenResponse): Promise<void>;
    initialize(): Promise<void>;
}
```

## Adding new HTTP routes

Internally Pumble SDK is using an `express.js` http server to receive events from Pumble and to expose the redirect endpoint.
However in case you need to add your custom endpoints you have two alternatives:
1. Create another HTTP server in a different port
2. Extend the existing HTTP server

To extend the existing HTTP server all you have to do is add `onServerConfiguring` in the `App`

```typescript
const app: App = {
    onServerConfiguring: (express, addon) => {
        express.get("/my_custom_endpoint", (request, response)=>{
			const userClient = await addon.getUserClient("<<workspace_id>>", "<<user_id>>")
            response.send("My response");
        })
    },
	//... Triggers
};
```
Notice that in this callback you also have access to the `addon` object, which provides you with some helper methods to get [ApiClients](/api-client) , access [manifest](/manifest), generate OAuth2 url etc.

## Handling Errors 

The addon will emit errors every time some uncaught error occurs in one of your event handlers.
In order to capture these errors use the code below:

```typescript
async function main() {
    const addon = await start(app);
    addon.onError((error)=>{
        console.log("Error handling event: ", error);
    })
}

main();
```


## Request Signature Verification

Every request that is coming from Pumble is signed using your `signingSecret`.
While the `Pumble SDK` does this automatically, below is and explanation how the verification is done:

``` typescript
function verifySignature(signingSecret: string) {
    const TIMESTAMP_HEADER = 'x-pumble-request-timestamp';
    const SIGNATURE_HEADER = 'x-pumble-request-signature';
    return (request: Request, res: Response, next: NextFunction) => {
        const timestamp = request.headers[TIMESTAMP_HEADER];
        const signature = request.headers[SIGNATURE_HEADER];
        if (!timestamp || !signature) {
            res.status(403).send('Invalid signature!');
            return;
        }
        const rawBody = request.rawBody;
		// The string to be signed is timestamp:rawBody
        const signingPayload = `${timestamp}:${rawBody}`;
        const hmac = crypto.createHmac('sha256', signingSecret);
        const testSignature = hmac
            .update(signingPayload)
            .digest()
            .toString('hex');
        if (testSignature !== signature) {
            res.status(403).send('Invalid signature!');
            return;
        }
        next();
    };
}
```


