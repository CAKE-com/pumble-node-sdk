# Production deployment

After you have finished developing your app locally, and you are ready to deploy, all that remains is that you configure all the URLs where Pumble will send the events.\
Pumble will need to know the host where you will be deploying because it will send the events to the new URLs.

To do this through the `Pumble CLI` use this command

```sh
npx pumble-cli pre-publish
```
This command will ask you for the hostname, and after you input a valid hostname it will update all the URLs in Pumble.
:::tip
To skip prompting for the hostname just run the command with:
```sh
npx pumble-cli pre-publish --host https://yourhost.com
```
:::

:::warning
`Pumble CLI` is intended for local development only. In production however you only need to run you main compiled script.
This means that simply having `.pumbleapprc` in the root directory will not suffice, since that file is only used by the CLI.
Make sure to have these values as environment variables or set `id`, `appKey`, `signingSecret` and `clientSecret` in your app.
:::

If you wish to opt out of using the `Pumble CLI`, you can update your app by calling [this endpoint](/manifest#updating-an-app), where you can specify your hostname for each trigger.

To deploy your app make sure you have these environment variables set up:
```sh
PUMBLE_APP_ID=
PUMBLE_APP_KEY=
PUMBLE_APP_CLIENT_SECRET=
PUMBLE_APP_SIGNING_SECRET=
```

```typescript
const app: App = {
    // ...
    id: '...', 
    signingSecret: '...', 
    clientSecret: '...', 
    appKey: '...'
    // ...
};
```

You received them upon app creation, and if you were using the `Pumble CLI`, you can find them in your local `.pumbleapprc` file.

To run in production after you have prepared your app for deployment and configured the manifest correctly, you simply have to run the compiled main file.
```json
// package.json
{
    "scripts": {
        "compile": "tsc", 
        "run-prod": "PUMBLE_APP_ID=... PUMBLE_APP_KEY=... PUMBLE_APP_CLIENT_SECRET=... PUMBLE_APP_SIGNING_SECRET=... node ./dist/main.js"
    }
}
```

### Dockerfile

Here is an example of a basic Dockerfile that can be used to create a Docker image for your app.

```dockerfile
FROM node:24.14-alpine AS builder
WORKDIR /root/
COPY . .
RUN npm ci
RUN npm run compile

FROM node:24.14-alpine
WORKDIR /root/

COPY --from=builder /root/dist ./dist
COPY --from=builder /root/package.json .

# Set to your path of manifest.json file, or omit if you created the app without using manifest.json file
COPY --from=builder /root/manifest.json .

COPY --from=builder /root/node_modules node_modules/

CMD ["node", "dist/main.js"]
```

Before building the image, make sure to have `"compile": "tsc"` script in your `package.json` file.
Also make sure to provide Pumble app secrets as environment variables, in case you haven't provided them in the app instance in your project.

### Publishing

After you've verified you app's functionality and successfully set it up in a production environment, you can publish it to [CAKE.com Marketplace](https://marketplace.cake.com). 

By doing so, you will make it available to users on other Pumble workspaces as well :rocket:

For more information, visit the [Publishing to CAKE.com Marketplace guide](/publish-to-marketplace).