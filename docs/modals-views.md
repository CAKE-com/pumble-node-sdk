# Modals & Views

Pumble's modals and views allow apps to create rich, interactive user interfaces beyond simple messages.

## Modals

Modals in Pumble are interactive, pop-up windows that provide a focused space for user interaction, ideal for collecting input or guiding multistep processes. 
They allow apps to present dynamic forms and information, creating richer, more app-like experiences within Pumble.


### Key Concepts

- Views: Every modal is built using a view, which is a JSON object defining the UI layout and content. This allows you to arrange various UI components like text, input fields, buttons, and more.
- Focus & Interactivity: Modals are designed to capture user focus until they are submitted or dismissed. This makes them ideal for forms, confirmations, and any scenario requiring dedicated user interaction.
- View Stack: Modals can have a modal stack, allowing your app to push up to three modals. This enables multistep forms or wizards without closing the initial modal.

### When to Use Modals
Modals are best suited for situations where you need to:
- Collect User Input: Create forms with various input types (text fields, dropdowns, etc.) to gather data from users.
- Guide Multi-Step Workflows: Break down complex processes into digestible steps using the modal stack.
- Display Focused Information: Present details that require the user's undivided attention, such as summaries or configuration options.
- Confirm Actions: Prompt users for confirmation before performing critical operations.
- Present Dynamic Content: Show information that changes based on user input or external data.

### How Modals Work (Basic Flow)
1. Triggering the modal: A modal is typically opened in response to a user action, such as:
   - Clicking a button in a message (or interacting with any interactive component)
   - Using a slash command, global shortcut or message shortcut
2. Composing the view: Your app constructs a JSON object defining the modal's content and layout using blocks. This includes all the blocks and input elements.
3. Opening the modal: Your app makes call to `context.spawnModalView` to display the constructed view as a modal to the user.
4. User interaction: The user interacts with the elements within the modal (e.g., filling out forms, clicking buttons).
5. Handling submissions/closures: When the user submits the form or dismisses the modal, Pumble sends an interaction payload to your app's configured Request URL.
   - For submissions, payload includes all the submitted data in `state` field
   - For dismissals, your app can define if it will handle such event by setting `notifyOnClose` property
6. Responding to interactions: Your app processes the block interaction payload. Based on the input, it can:
   - Update the current view by using `context.updateView`
   - Push a new view onto the stack (by using `context.pushModalView`) for the next step
   - Present an error message within the modal if validation fails
   - Send a message to a channel based on the submission
   - Whatever you need to do ;)

<br>

Let's write some code :rocket:

<br>

##### Spawn modal
```typescript
globalShortcuts: [
   {
      name: 'Open modal',
      description: 'Open interactive modal',
      handler: async (ctx) => {
         await ctx.spawnModalView({
            callbackId: "modal_callback_id_1",
            type: "MODAL",
            title: {
               type: "plain_text",
               text: "Title"
            },
            submit: {
               type: "plain_text",
               text: "Submit"
            },
            notifyOnClose: false,
            blocks: [
               {
                  type: "input",
                  blockId: "input_static_1",
                  label: {
                     text: "Select menu",
                     type: "plain_text"
                  },
                  element: {
                     type: "static_select_menu",
                     placeholder: {text: "text", type: "plain_text"},
                     onAction: "static_select_menu_input_action",
                     options: [
                        {text: {type: "plain_text", text: "Option 1"}, value: "1"},
                        {text: {type: "plain_text", text: "Option 2"}, value: "2"} // value that's preselected in modal state
                     ]
                  },
                  dispatchAction: true
               },
               {
                  type: "actions",
                  elements: [
                     {
                        type: "button",
                        onAction: "info_btn_action",
                        value: `test metadata`,
                        text: {
                           text: 'Read info',
                           type: "plain_text"
                        },
                        style: "danger",
                     }
                  ]
               }
            ]
         });
      }
   }
]
```
> [!WARNING]
> Don't call `ctx.ack()` in case you're handling modals (opening, updating or pushing new modals).

##### Handle submission
```typescript
viewAction: {
    onSubmit: {
      modal_callback_id_1: async (ctx) => {
        await ctx.ack();
        // block needs to be wrapped with block of type = "input" in order to be available in a view state
        // in our case only static_select_menu_input_action (that's inside input_static_1) is available
        console.log(`Modal state ${JSON.stringify(ctx.payload.view.state)}. Do whatever with it :)`);
      }
    },
    onClose: {
      // will be triggered only if notifyOnClose=true
      modal_callback_id_1: async (ctx) => {
        await ctx.ack();
        console.log("Modal closed");
      }
    }
  }
```
> [!WARNING]
> For input values to be included in a view `state`, they must be wrapped within an `input` block. Furthermore, the `modal_callback_id_1` handler name must correspond to the value specified in the modal's `callbackId` property.

> [!TIP]
> You can also receive block interaction events for modal inputs by setting `dispatchAction` to `true` in input block.

##### Handle block interactions
```typescript
blockInteraction: {
   interactions: [
      {
         sourceType: "MESSAGE",
         handlers: {
            bttn_1_action: async (ctx) => {
               await ctx.ack();
               await ctx.say("Button 1 pressed", "ephemeral");
            }
         }
      },
      {
         sourceType: 'VIEW',
         handlers: {
            static_select_menu_input_action: async (ctx) => {
               await ctx.ack();
               console.log("Static select from input in modal triggered, do something :)");
            },
            info_btn_action: async (ctx) => {
               // no need to call ctx.ack when pushing new modal
               await ctx.pushModalView(
                   { parentViewId: ctx.payload.sourceId, ...}
               );
            },
         },
      }]
}
```
> [!NOTE]
> When pushing a new modal over an existing one, you must specify `parentViewId`, which represents the parent modal's `id`.

<br>

#### Take a look at detailed code examples :bulb: [interactivity-example](https://github.com/CAKE-com/pumble-node-sdk/tree/master/examples/interactivity).

## Home views

The Home tab (in app channel), is a private, customizable one-to-one space between a user and an app. It acts as a persistent dashboard where your app can display dynamic, personalized content and provide entry points for core functionality using blocks.

##### Publish home view
The Home view can be updated at any time an app deems appropriate, for instance, three seconds after a user authorizes the app:
```typescript
redirect: {
    enable: true, path: "/redirect",
    onSuccess: async (result, req, res) => {
        if (result.botToken && result.botId && result.userId) {
            setTimeout(async () => {
                try {
                    const addonManifest = await addonManifestPromise;
                    const botClient = await addonManifest.getBotClient(result.workspaceId);
                    // publish addon home view when user authorizes
                    botClient?.v1.app.publishHomeView(result.userId, {callbackId: '', title: {...}, ...});
                } catch (err) {
                    console.error(err);
                }
            }, 3000);
        }
    }
}
```