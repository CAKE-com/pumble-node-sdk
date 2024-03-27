# Pumble CLI

Pumble CLI provides a set of tools that you can use for your [Pumble](https://pumble.com) app development and configuration.
It will make the process of creating and maintaining your app easier.  

Visit [the documentation](https://CAKE-com.github.io/pumble-node-sdk/getting-started) to explore the full guide on creating Pumble Apps

To get started you can either install the cli globally `npm i -g pumble-cli` or use it with `npx`: `npx pumble-cli <command>`

To list the available commands and their usage simply use `pumble-cli --help` or `pumble-cli-command --help`

## Quick Start
In this guide you will install `pumble-cli` and use it to generate a project for a Pumble App
Start by running this command to install the `Pumble CLI`

```sh
npm i -g pumble-cli
```

After successfully installing `pumble-cli` use the command below to log in to your workspace 

```sh
pumble-cli login
```

You will be asked to input your email address and you will receive a code in your inbox.
After logging in you can proceed to create your first Pumble App. 

```sh
pumble-cli create
```
This command will ask you to type a name and description and will generate the project.\
After this command has completed you can then `cd` into the generated directory and start the addon.

```sh
cd my_app
npm run dev
```

If you login into Pumble you will see your App is installed and ready to use.

> [!TIP]   
> You can also skip installing `pumble-cli` and use `npx pumble-cli create` instead

## Available commands

### `pumble-cli login`

Using `pumble-cli login` you will be prompted to enter your email address and the verification code that will be sent to your email.\
After these steps you are logged in and ready to us the cli.\
If you need to login in another workspace simply use `pumble-cli login --force` or `pumble-cli logout && pumble-cli login`\
By default this command will save you authorization info in `~/.pumblerc` file.

If you need to check in which workspace you are logged in use `pumble-cli info`

### `pumble-cli create`

With `pumble-cli create` you will be able to generate a new app.\
It will create a default app with some triggers implemented.\
You will be prompted to provide some basic information such as `name` and `description`.\
After this command completes you can simply `cd` into the newly created directory and start your app with `npm run dev`\
After you execute `npm run dev` for the first time the Pumble app will be crated and installed in your logged in workspace, so you will be ready to test it.
While having `npm run dev` running, every change you make in your project (adding removing triggers, changing `manifest.json`) will update your app.

### `pumble-cli logout`

With `pumble-cli logout` your authorization info will be removed effectively logging you out of the session

### `pumble-cli info`

Use `pumble-cli info` to check in which workspace you are logged in. 

### `pumble-cli list`

With `pumble-cli list` you will list of your created apps. If you are using this command in the directory of a currently connected app,
the connected app will be indicated

### `pumble-cli connect`

Use `pumble-cli connect` in an app project directory to configure the environment to one of your Pumble Apps 
You will be prompted to select an app and after selected the contents of `.pumbleapprc` will be replaced with the secrets of the newly connected app.

> [!WARNING]  
> After you run with `pumble-cli` your connected app will be updated with the new configuration & triggers.\
> Use this command only to connect a previously connected app.\
> i.e. You are checking out from your version control, but `.pumbleapprc` secrets file it's not in the repository. In this case `pumble-cli connect` becomes useful

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
Since Pumble needs public endpoints to reach your app, `pumble-cli` will create a tunnel exposing your server port in a temporary generated  public url using [`https://localtunnel.me/`](https://localtunnel.me). If you want to have your own solution to expose your server publicly you can simply add `--host` and `--port` command arguments after `pumble-cli`

```sh
pumble-cli --host=https://myhostname.com --port=8080
```

> [!TIP]
> If you don't provide `--port`, `pumble-cli` will try to find free ports in your machine and listen to that port. This means you will not have a fixed port to expose, and `--port` solves the issue.

After `pumble-cli` starts your app's server, it will detect for changes in the manifest and update your manifest in Pumble.
So if you are running the command without a fixed `--host`, every time your run this command the manifest will be updated with the new hostname to reach your local environment.