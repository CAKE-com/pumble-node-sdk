# Api Client

Every Request to Pumble api must be sent with two headers

1. `x-app-token`:  Your app token that you receive when app is created. See [manifest](/manifest)
2. `token`: The access token of the user or bot. See [Authorization](/advanced-concepts#authorization)

`pumble-sdk` provides an easy way to get the user or bot client from a trigger context. See [Triggers](/triggers-reference)

Each ApiClient method has its own set of required scopes.

## Messages
| method                                    | scopes                           | description                                                      |
|:------------------------------------------|:---------------------------------|:-----------------------------------------------------------------|
| client.v1.messages.fetchMessage           | `messages:read`                  | Get message by id and channel id                                 |
| client.v1.messages.fetchMessages          | `channels:read`                  | Paginate through channel messages                                |
| client.v1.messages.fetchThreadReplies     | `channels:read`                  | Fetch thread messages                                            |
| client.v1.messages.postMessageToChannel   | `messages:write`, `files:write`  | Post a message to a channel                                      |
| client.v1.messages.reply                  | `messages:write`, `files:write`  | Reply in a thread                                                |
| client.v1.messages.postEphemeral          | `messages:write`                 | Send an ephemeral message to a user or list of users             |
| client.v1.messages.replyEphemeral         | `messages:write`                 | Send an ephemeral message to a user or list of users in a thread |
| client.v1.messages.editMessage            | `messages:edit`                  | Edit a message                                                   |
| client.v1.messages.deleteMessage          | `messages:delete`                | Delete a message                                                 |
| client.v1.messages.editEphemeralMessage   | `messages:edit`                  | Edit an ephemeral message                                        |
| client.v1.messages.deleteEphemeralMessage | `messages:delete`                | Delete an ephemeral message                                      |
| client.v1.messages.editAttachments        | `attachments:write`              | Edit a message attachment                                        |
| client.v1.messages.addReaction            | `reaction:write`                 | React to a message                                               |
| client.v1.messages.removeReaction         | `reaction:write`                 | Remove reaction from a message                                   |
| client.v1.messages.searchMessages         | `messages:read`, `channels:list` | Search messages                                                  |

## Channels
| method                                   | scopes           | description                                                             |
|:-----------------------------------------|:-----------------|:------------------------------------------------------------------------|
| client.v1.channels.getDirectChannel      | `channels:read`  | Get the direct channels between the requesting user and a list of users |
| client.v1.channels.createDirectChannel   | `channels:write` | Create a direct channel with one or more users                          |
| client.v1.channels.getChannelDetails     | `channels:read`  | Get channel info by id                                                  |
| client.v1.channels.listChannels          | `channels:list`  | List user visible channels                                              |
| client.v1.channels.createChannel         | `channels:write` | Create a Public or Private channel                                      |
| client.v1.channels.addUsersToChannel     | `channels:write` | Add one or more users in a channel                                      |
| client.v1.channels.removeUserFromChannel | `channels:write` | Remove a user from a channel                                            |

## Users
| method                             | scopes         | description                     |
|:-----------------------------------|:---------------|:--------------------------------|
| client.v1.users.listWorkspaceUsers | `users:list`   | List Workspace Users            |
| client.v1.users.listUserGroups     | `users:list`   | List User Groups                |
| client.v1.users.getProfile         |                | Get authorizing user basic info |
| client.v1.users.userInfo           | `user:read`    | Get user by id                  |
| client.v1.users.updateCustomStatus | `status:write` | Update user status              |

## Workspaces
| method                               | scopes           | description        |
|:-------------------------------------|:-----------------|:-------------------|
| client.v1.workspace.getWorkspaceInfo | `workspace:read` | Get workspace info |

## Calls
| method                              | scopes        | description             |
|:------------------------------------|:--------------|:------------------------|
| client.v1.calls.createPermanentCall | `calls:write` | Create a permanent call |

## App
| method                        | scopes           | description       |
|:------------------------------|:-----------------|:------------------|
| client.v1.app.publishHomeView | `channels:write` | Publish home view |

## Files
| method                    | scopes          | description         |
|:--------------------------|:----------------|:--------------------|
| client.v1.files.fetchFile | `messages:read` | Fetch a file by URL |

## Scopes

The list of all available scopes

| name                | description                 |
|:--------------------|:----------------------------|
| `messages:read`     | Read messages               |
| `messages:write`    | Write messages              |
| `messages:edit`     | Edit messages               |
| `messages:delete`   | Delete messages             |
| `attachments:write` | Write attachments           |
| `user:read`         | Read user profile           |
| `status:write`      | Write user status           |
| `reaction:read`     | Receive reactions           |
| `reaction:write`    | React to messages           |
| `channels:list`     | List channels               |
| `channels:read`     | Get channel information     |
| `channels:write`    | Write channels              |
| `users:list`        | List all workspace users    |
| `workspace:read`    | Read workspace information  |
| `calls:write`       | Create permanent calls      |
| `files:write`       | Write messages with files   |