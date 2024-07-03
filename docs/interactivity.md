# Interactivity 
###### Coming soon

## Interactive messages

Pumble's interactive messages enhance communication by allowing users to perform actions directly within the message interface. 
These messages can include buttons, select menus, and other interactive elements, enabling users to respond to requests, provide feedback, or trigger workflows without leaving the conversation.

### Compose your interactive message

Adding interactive components is similar to adding any other [block](/blocks). The following example provides insight on how to add buttons in an actions block within a message payload:

```typescript
await ctx.say({
    text:"John requests read permission for the header design document.",
    blocks:[
        {
            type:"rich_text",
            elements:[
                {
                    type:"rich_text_section",
                    elements:[
                        {
                            type:"text",
                            text:"John requests read permission for the header design document."
                        }
                    ]
                }
            ]
        },
        {
            type:"actions",
            elements:[
                {
                    type:"button",
                    onAction:"approve_btn",
                    text:{
                        text:"Approve",
                        type:"plain_text"
                    },
                    style:"primary"
                },
                {
                    type:"button",
                    onAction:"reject_btn",
                    text:{
                        text:"Reject",
                        type:"plain_text"
                    },
                    style:"danger"
                }
            ]
        }
    ]
}, "in_channel");
```

You can replace buttons with other interactive elements based on your needs. After composing and sending such a message, it should soon be visible in your channel.

### Handle interactive payload

When a user interacts with an interactive component published by your app in Pumble, block interaction payload will be sent to your app.
This payload notifies your app about the interaction and provides a bundle of information about relevant details of the interaction. Understanding this payload is crucial for your app to process interactions effectively.

Pumble delivers this payload to your app's configured handlers.
The payload includes all the contextual information your app requires to determine the type and specifics of the interaction.

Take a look at following example on how to handle interactive payload based on previous message.

Inside your app's definition (like [here](https://github.com/CAKE-com/pumble-node-sdk/blob/master/playground/example-1.ts)), add following code:

```typescript
blockInteraction: {
    interactions: [
        {
            sourceType: "MESSAGE",
            handlers: {
                "approve_btn": async ctx => {
                    await ctx.ack();
                    console.log(ctx.payload);
                    // additional stuff you want to do
                    await ctx.say({text: "Approved"}, "in_channel", true);
                },
                "reject_btn": async ctx => {
                    await ctx.ack();
                    console.log(ctx.payload);
                    // additional stuff you want to do
                    await ctx.say({text: "Rejected"}, "in_channel", true);
                }
            }
        }
    ]
}
```

For more interactive elements, click [here](/interactive-elements-reference).

## Dynamic select menus

Dynamic select menu will load its options from an external data source, allowing for a dynamic list of options.
Each time a select menu of this type is opened or the user starts typing in the typeahead field, we'll send a request to your app.
For more details about dynamic select menu properties, see [this](/interactive-elements-reference).

Your app should provide handlers that will be called each time user interacts with dynamic select menu.
The handler should return an array of options or option groups. See the following example.

Inside your app's definition (like [here](https://github.com/CAKE-com/pumble-node-sdk/blob/master/playground/example-1.ts)), add following code:

```typescript
dynamicMenus: [
    {
        onAction: "dynamic_menu_1",
        producer: async (ctx) => {
            return [
                {text: {type: "plain_text", text: "Option 1"}, value: "1"},
                {text: {type: "plain_text", text: "Option 2"}, value: "2"}
            ]
        }
    }
]
```
`onAction` must match the `onAction` field of the dynamic select menu, otherwise the handler won't be called.

The provided handler will be executed when the following message is sent:
```typescript
await ctx.say({
    text:"Dynamic select menu",
    blocks:[
        {
            type:"actions",
            elements:[
                {
                    type: "dynamic_select_menu",
                    min_query_length: 3,
                    onAction: "dynamic_menu_1",
                    placeholder: {text: "Select something", type: "plain_text"}
                }
            ]
        }
    ]
}, "in_channel");
```