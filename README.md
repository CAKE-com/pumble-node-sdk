# Pumble SDK

This repository contains the tools to create [Pumble](https://pumble.com/) apps.

1. [Pumble SDK](https://www.npmjs.com/package/pumble-sdk) - A javascript framework to quickly build Pumble apps.  
2. [Pumble CLI](https://www.npmjs.com/package/pumble-cli) - A cli tool to generate and run Pumble apps from your local environment.

Read the full [documentation](https://CAKE-com.github.io/pumble-node-sdk/getting-started) to get started.

## Quick  Start

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
