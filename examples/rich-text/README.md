> [!TIP]   
> If you want to quickly check out how things work, just download this example and run `npm run dev`.

## Use the following commands to create a new app

```sh
npm i -g pumble-cli
```

After successfully installing `pumble-cli`, use the command below to log in to your workspace:

```sh
pumble-cli login
```

You will be asked to input your email address, and you will receive a code via email.
After logging in, you can proceed to create your first Pumble App.

```sh
pumble-cli create
```

This command will ask you to type a name and description and will generate the project.
After this command has completed, you can then `cd` into the generated directory and start the addon.

```sh
cd my_app
npm run dev
```

If you log in to Pumble, you will see your app is installed and ready to use.

## App release preparation

After finishing the development part, your app should be prepared for release.

```sh
pumble-cli pre-publish
```