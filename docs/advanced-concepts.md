# Advanced Concepts

## Adding new HTTP routes

Internally, Pumble SDK is using an `express.js` HTTP server to receive events from Pumble and to expose the redirect endpoint.
However, in case you need to add your custom endpoints you have two alternatives:
1. Create another HTTP server in a different port
2. Extend the existing HTTP server

To extend the existing HTTP server all you have to do is add `onServerConfiguring` in the `App`.

```typescript
const app: App = {
    onServerConfiguring: (express, addon) => {
        express.get("/my_custom_endpoint", async (request, response) => {
            const userClient = await addon.getUserClient("<<workspace_id>>", "<<user_id>>")
            response.send("My response");
        })
    },
    //... Triggers
};
```

It is also possible to define `onServerConfiguring` upon an `addon: Addon<AddonManifest>` instance:

```typescript
addon.onServerConfiguring((express, addon) => {
    express.get("/my_custom_endpoint", async (request, response) => {
        const userClient = await addon.getUserClient("<<workspace_id>>", "<<user_id>>")
        response.send("My response");
    })
});
```

Notice that in this callback you also have access to the `addon` object, which provides you with some helper methods to get [ApiClients](/api-client), access [manifest](/manifest), generate OAuth2 URL etc.

## Handling Errors 

The addon will emit errors every time some uncaught error occurs in one of your event handlers.
In order to capture these errors use the code below:

```typescript
async function main() {
    const addon = await start(app);
    addon.onError((error) => {
        console.log("Error handling event: ", error);
    });
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


