# Pumble CLI

Pumble CLI provides a set of tools that you can use for your app's development and configuration.
It will make the process of creating and maintaining your app easier.  

To get started you can either install the cli globally `npm i -g pumble-cli` or use it with `npx`: `npx pumble-cli <command>`

To list the available commands and their usage simply use `pumble-cli --help` or `pumble-cli-command --help`

## Available commands

### `pumble-cli login`

Using `pumble-cli login` you will be prompted to enter your email address and the verification code that will be sent to your email.\
After these steps you are logged in and ready to use the cli.\
If you need to log in to another workspace simply use `pumble-cli login --force` or `pumble-cli logout && pumble-cli login`\
By default this command will save you authorization info in `~/.pumblerc` file.

If you need to check in which workspace you are logged in use `pumble-cli info`

### `pumble-cli create`

With `pumble-cli create` you will be able to generate a new app.\
It will create a default app with some triggers implemented.\
You will be prompted to provide some basic information such as `name` and `description`.\
After this command completes you can simply `cd` into the newly created directory and start your app with `npm run dev`\
After you execute `npm run dev` for the first time the Pumble app will be created and installed in your logged in workspace, so you will be ready to test it.
While having `npm run dev` running, every change you make in your project (adding removing triggers, changing `manifest.json`) will update your app.

### `pumble-cli logout`

With `pumble-cli logout` your authorization info will be removed effectively logging you out of the session

### `pumble-cli info`

Use `pumble-cli info` to check in which workspace you are logged in. 

``` sh
╔════════════════╤══════════════════════════╗
║ Workspace Id   │ 651122b0456aa466bf81c6b2 ║
╟────────────────┼──────────────────────────╢
║ Workspace Name │ my_workspace             ║
╟────────────────┼──────────────────────────╢
║ User Id        │ 651122b0456aa466bf81c6b3 ║
╟────────────────┼──────────────────────────╢
║ User Name      │ Your Name                ║
╟────────────────┼──────────────────────────╢
║ User Email     │ your.email@email.com     ║
╚════════════════╧══════════════════════════╝
```

### `pumble-cli list`

With `pumble-cli list` you will list of your created apps. If you are using this command in the directory of a currently connected app,
the connected app will be indicated

### `pumble-cli connect`

Use `pumble-cli connect` in an app project directory to configure the environment to one of your Pumble Apps 
You will be prompted to select an app and after selected the contents of `.pumbleapprc` will be replaced with the secrets of the newly connected app.

:::warning
After you run with `pumble-cli` your connected app will be updated with the new configuration & triggers.\
Use this command only to connect a previously connected app.\
i.e. You are checking out from your version control, but `.pumbleapprc` secrets file it's not in the repository. In this case `pumble-cli connect` becomes useful
:::

### `pumble-cli scaffold`

Use this command to generate a project that mirrors one of your already configured apps.\
After running this command you will be prompted to pick one of your existing projects. 
This will generate the template and configuration to match the Pumble app.\
`.pumbleapprc` will match the app's secrets. And all triggers and event subscriptions will be generated with empty handlers.\
You will just need to implement the handlers.

### `pumble-cli`

Running just `pumble-cli` in your project root will start your app. 

## Installing

To install `pumble-cli` simply use `npm install -g pumble-cli` or run `npx pumble-cli` every time you need to run a command.
If `pumble-cli` is installed as a `devDependency` in your project however, you can just use `pumble-cli` in you npm scripts directly, without needing to install it globally.
```json
// package.json
{
	"scripts": {
		"dev": "pumble-cli"
	}
}
```

## Running your app locally

To run your app locally simply run `pumble-cli` in your project root.\
This command will make sure to sync your manifest in Pumble and watch for changes.\
Since Pumble needs public endpoints to reach your app, `pumble-cli` will create a tunnel exposing your server port in a temporary generated  public url using `https://localtunnel.me/`. If you want to have your own solution to expose your server publicly you can simply add `--host` and `--port` command arguments after `pumble-cli`

```sh
pumble-cli --host=https://myhostname.com --port=8080
```

:::tip
If you don't provide `--port`, `pumble-cli` will try to find free ports in your machine and listen to that port. This means you will not have a fixed port to expose, and `--port` solves the issue.
:::

After `pumble-cli` starts your app's server, it will detect for changes in the manifest and update your manifest in Pumble.
So if you are running the command without a fixed `--host`, every time your run this command the manifest will be updated with the new hostname to reach your local environment.

## Running your app in production

To run in production after you have prepared your app for deployment and manifest is configured correctly, you simply have to run the compiled main file.
```json
//package.json
{
	"scripts": {
		"compile": "tsc",
		"run-prod": "node ./dist/main.js"
	}
}
```

## Preparing Your App for deployment

After you have finished developing your App locally and you are ready to deploy all that remains is that you configure all the urls where Pumble will send the events.\
Pumble will need to know the host where you will be deploying because it will send the events in the new URL's.
To do this through the `Pumble CLI` use this command


```sh
npx pumble-cli pre-publish
```
This command will ask you for the hostname and after you input a valid hostname it will update all the urls in Pumble.
:::tip
To skip prompting for the hostname just run the command with:
```sh
npx pumble-cli pre-publish --host https://yourhost.com
```
:::

To deploy your app make sure you have these environment variables set up
You can easily find these values in your local `.pumbleapprc` file
```sh
PUMBLE_APP_ID=
PUMBLE_APP_KEY=
PUMBLE_APP_CLIENT_SECRET=
PUMBLE_APP_SIGNING_SECRET=
```
:::warning
`Pumble CLI` is intended for local development only. In production however you only need to run you main compiled script.
This means that simply having `.pumbleapprc` in the root directory will not suffice, since that file is only used by the CLI.
Make sure to have these values as environment variables or set `id`, `appKey`, `signingKey` and `clientSecret` in your App

```typescript
const app: App = {
	//...
	id: '...'
	signingSecret: '...',
	clientSecret: '...',
	appKey: '...'
	//...
};
```
:::