# Api Client

Every Request to Pumble API must be sent with two headers:

1. `x-app-token`:  Your app token that you receive when app is created. See [manifest](/manifest)
2. `token`: The access token of the user or bot. See [Authorization](/authorization)

`pumble-sdk` provides an easy way to get the user or bot client from a trigger context. See [Triggers](/triggers-reference)

Each ApiClient method has its own set of required scopes.

## Messages

`client.v1.messages`
| method                          | scopes                                                     | description                                                      |
|:--------------------------------|:-----------------------------------------------------------|:-----------------------------------------------------------------|
| fetchMessage                    | `messages:read`                                            | Get message by ID and channel ID                                 |
| fetchMessages                   | `channels:read`                                            | Paginate through channel messages                                |
| fetchThreadReplies              | `channels:read`                                            | Fetch thread messages                                            |
| postMessageToChannel            | `messages:write`, `files:write`(optional)                  | Post a message to a channel                                      |
| dmUser                          | `channels:read`, `messages:write`, `files:write`(optional) | Send a direct message to a user                                  |
| reply                           | `messages:write`, `files:write`(optional)                  | Reply in a thread                                                |
| postEphemeral                   | `messages:write`                                           | Send an ephemeral message to a user or list of users             |
| replyEphemeral                  | `messages:write`                                           | Send an ephemeral message to a user or list of users in a thread |
| editMessage                     | `messages:edit`                                            | Edit a message                                                   |
| deleteMessage                   | `messages:delete`                                          | Delete a message                                                 |
| editEphemeralMessage            | `messages:edit`                                            | Edit an ephemeral message                                        |
| deleteEphemeralMessage          | `messages:delete`                                          | Delete an ephemeral message                                      |
| editAttachments                 | `attachments:write`                                        | Edit a message attachments                                       |
| addReaction                     | `reaction:write`                                           | React to a message                                               |
| removeReaction                  | `reaction:write`                                           | Remove reaction from a message                                   |
| searchMessages                  | `messages:read`, `channels:list`                           | Search messages                                                  |
| fetchScheduledMessage           | `messages:read`                                            | Get scheduled message by ID                                      |
| fetchScheduledMessages          | `messages:read`                                            | List pending scheduled messages                                  |
| createScheduledMessage          | `messages:write`                                           | Schedule a message                                               |
| editScheduledMessage            | `messages:edit`                                            | Edit a scheduled message                                         |
| editScheduledMessageAttachments | `attachments:write`                                        | Edit scheduled message attachments                               |
| deleteScheduledMessage          | `messages:delete`                                          | Delete a scheduled message                                       |

### File Upload

When sending a message, it is possible to specify a list of files that will be uploaded and sent within the message. 
A file can be specified by providing the file path, or in a form of a `Blob` or `Buffer`, in which case it is mandatory to provide file name and mime type as well:

```typescript

type FileToUpload = {
    input: String,
    options?: FileUploadOptions
} | { 
    input: Buffer | Blob, 
    options: FileUploadOptions 
}

interface FileUploadOptions {
    name: string,
    mimeType: string
}
```

A message can contain up to 20 files, and each file size must not exceed 512MB.

## Channels

`client.v1.channels`
| method                | scopes           | description                                                             |
|:----------------------|:-----------------|:------------------------------------------------------------------------|
| getDirectChannel      | `channels:read`  | Get the direct channels between the requesting user and a list of users |
| createDirectChannel   | `channels:write` | Create a direct channel with one or more users                          |
| getChannelDetails     | `channels:read`  | Get channel info by ID                                                  |
| listChannels          | `channels:list`  | List user visible channels                                              |
| createChannel         | `channels:write` | Create a Public or Private channel                                      |
| addUsersToChannel     | `channels:write` | Add one or more users in a channel                                      |
| removeUserFromChannel | `channels:write` | Remove a user from a channel                                            |

## Users

`client.v1.users`
| method             | scopes         | description                     |
|:-------------------|:---------------|:--------------------------------|
| listWorkspaceUsers | `users:list`   | List Workspace Users            |
| listUserGroups     | `users:list`   | List User Groups                |
| getProfile         |                | Get authorizing user basic info |
| userInfo           | `user:read`    | Get user by ID                  |
| updateCustomStatus | `status:write` | Update user status              |

## Workspaces

`client.v1.workspace`
| method           | scopes           | description        |
|:-----------------|:-----------------|:-------------------|
| getWorkspaceInfo | `workspace:read` | Get workspace info |

## Calls

`client.v1.calls`
| method              | scopes        | description             |
|:--------------------|:--------------|:------------------------|
| createPermanentCall | `calls:write` | Create a permanent call |

## App

`client.v1.app`
| method              | scopes           | description         |
|:--------------------|:-----------------|:--------------------|
| removeAuthorization | -                | Unauthorize the app |
| uninstallApp        | -                | Uninstall the app   |
| publishHomeView     | `channels:write` | Publish home view   |

## Files

`client.v1.files`
| method    | scopes          | description         |
|:----------|:----------------|:--------------------|
| fetchFile | `messages:read` | Fetch a file by URL |

## Scopes

The list of all available scopes:

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