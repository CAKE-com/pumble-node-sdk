export namespace V1 {
    export interface UpdateWorkspaceUserCustomStatusRequest {
        /**
         * @minLength 0
         * @maxLength 100
         */
        status?: string;
        /**
         * @minLength 3
         * @maxLength 102
         */
        code: string;
        expiration?: 'never' | 'min30' | 'hour1' | 'hour4' | 'today' | 'thisWeek' | 'custom';
        /** @format int64 */
        expiresAt: number;
        pausedNotifications: boolean;
    }

    export type SendMessagePayload =
        | {
              text: string;
              blocks?: MainBlock[];
              attachments?: MessageAttachment[];
          }
        | string;

    export type BlockRichTextSection = {
        type: 'rich_text_section';
        elements: BlockBasic[];
    };

    export type BlockRichTextPreformatted = {
        type: 'rich_text_preformatted';
        elements: (BlockBasic | BlockRichTextSection)[];
    };

    export type BlockBasic =
        | { type: 'link'; url: string }
        | { type: 'text'; text: string; style?: Record<string, unknown> }
        | { type: 'emoji'; name: string }
        | { type: 'usergroup'; usergroup_id: string }
        | { type: 'user'; user_id: string }
        | { type: 'channel'; channel_id: string }
        | { type: 'broadcast'; range: 'channel' | 'here' };

    export type BlockTextElement = {
        type: 'plain_text';
        emoji?: boolean;
        text: string;
    };

    export type Option = {
        text: BlockTextElement;
        value: string;
        description?: BlockTextElement;
    };

    type OptionGroup = {
        label: BlockTextElement;
        options: Option[];
    };

    type ConfirmDialog = {
        title: BlockTextElement;
        text: BlockTextElement;
        confirm: BlockTextElement;
        deny: BlockTextElement;
        style?: 'primary' | 'secondary' | 'warning' | 'danger';
    };

    type Input = {
        onAction?: string;
    };

    export type BlockButton = Input & {
        type: 'button';
        text: BlockTextElement;
        value?: string;
        style?: 'primary' | 'secondary' | 'warning' | 'danger';
        url?: string;
        confirm?: ConfirmDialog;
    };

    export type BlockStaticSelectMenu = Input & {
        type: 'static_select_menu';
        placeholder: BlockTextElement;
        options: Option[];
        option_groups?: OptionGroup[];
        initial_option?: Option | OptionGroup;
        confirm?: ConfirmDialog;
    };

    type ActionableBlock = BlockButton | BlockStaticSelectMenu;

    export type BlockRichText = {
        type: 'rich_text';
        elements: (BlockRichTextSection | BlockRichTextPreformatted)[];
    };

    export type BlockInput = {
        type: 'input';
        label: BlockTextElement;
        element: ActionableBlock;
        dispatchAction?: boolean;
        optional?: boolean;
    };

    export type BlockActions = {
        type: 'actions';
        elements: ActionableBlock[];
    };

    export type MainBlock = BlockRichText | BlockInput | BlockActions;

    export type OAuthUserProfile = {
        workspaceId: string;
        workspaceName: string;
        workspaceUserId: string;
        workspaceUserName: string;
    };
    export interface EphemeralMessageParams {
        threadRootId?: string;
        sendToUsers: string[];
    }

    export interface Field {
        title?: string;
        value?: string;
        short?: boolean;
    }

    export type JsonNode = object;

    export interface MessageAttachment {
        color?: string;
        pretext?: string;
        author_name?: string;
        author_link?: string;
        author_icon?: string;
        title?: string;
        title_link?: string;
        text?: string;
        fields?: Field[];
        thumb_url?: string;
        footer?: string;
        footer_icon?: string;
        /** @format int64 */
        ts?: number;
    }

    export interface MessageUpdateRequestBody {
        /**
         * @minLength 0
         * @maxLength 100000
         */
        text: string;
        blocks?: MainBlock[];
        attachments?: MessageAttachment[];
        ephemeral?: EphemeralMessageParams;
    }

    export interface AffectedUserMeta {
        workspaceUserId: string;
        addedBy: string;
        /** @format int64 */
        addedAt?: number;
    }

    export interface CallMeta {
        id: string;
        status: string;
        type: string;
        /** @format int64 */
        lastPingTs?: number;
        /** @format int64 */
        startedAt?: number;
        /** @format int64 */
        endedAt?: number;
        participants?: CallMetaParticipant[];
        permanentCode?: string;
        permanentCallsLink?: string;
    }

    export interface CallMetaParticipant {
        workspaceUserId: string;
        status: string;
        deviceCallId?: string;
        isExternal?: boolean;
        username?: string;
        avatarPath?: string;
        scaledAvatarPath?: string;
    }

    export interface LinkPreview {
        id: string;
        /** @format int32 */
        order?: number;
        type: string;
        version?: string;
        title?: string;
        description?: string;
        providerName?: string;
        author?: string;
        authorUrl?: string;
        url?: string;
        html?: string;
        expandedBy?: string[];
        hiddenBy?: string[];
        /** @format int32 */
        width?: number;
        /** @format int32 */
        height?: number;
        /** @format int32 */
        contentLength?: number;
        thumbnailUrl?: string;
        /** @format int32 */
        thumbnailWidth?: number;
        /** @format int32 */
        thumbnailHeight?: number;
        thumbnailInline?: boolean;
        iconUrl?: string;
        /** @format int32 */
        iconWidth?: number;
        /** @format int32 */
        iconHeight?: number;
        files?: MessageFile[];
        blocks?: MainBlock[];
        channelId?: string;
        channelName?: string;
        workspaceUserId?: string;
        /** @format int64 */
        timestamp?: number;
        messageId?: string;
        threadRootId?: string;
    }

    export interface Message {
        id: string;
        workspaceId: string;
        channelId: string;
        author: string;
        text?: string;
        timestamp?: string;
        /** @format int64 */
        timestampMilli?: number;
        subtype?: string;
        reactions?: MessageReaction[];
        linkPreviews?: LinkPreview[];
        isFollowing?: boolean;
        threadRootInfo?: ThreadRootInfo;
        threadReplyInfo?: ThreadReplyInfo;
        files?: MessageFile[];
        deleted?: boolean;
        edited?: boolean;
        localId?: string;
        attachments?: Record<string, object>[];
        sharedMessage?: SharedMessage;
        /** @format int64 */
        savedTimestampMilli?: number;
        blocks?: MainBlock[];
        meta?: MessageMeta;
    }

    export interface MessageFile {
        id: string;
        owner: string;
        name?: string;
        mimeType: string;
        path: string;
        thumbnails?: MessageFileThumbnail[];
        /** @format int64 */
        duration?: number;
        audioRecording?: boolean;
        videoRecording?: boolean;
        waveform?: number[];
        /** @format int64 */
        uploadedAtMilli?: number;
        publicPath?: string;
    }

    export interface MessageFileThumbnail {
        path: string;
        /** @format int32 */
        width?: number;
        /** @format int32 */
        height?: number;
    }

    export interface MessageMeta {
        reminders?: ReminderMeta[];
        callMetaDto?: CallMeta;
        affectedUsers?: AffectedUserMeta[];
    }

    export interface MessageReaction {
        user: string;
        code: string;
    }

    export interface ReminderMeta {
        id: string;
        workspaceId: string;
        workspaceUserId: string;
        channelId: string;
        messageId: string;
        /** @format int64 */
        reminderAt?: number;
    }

    export interface SharedMessage {
        messageId: string;
        text?: string;
        authorId?: string;
        channelId?: string;
        /** @format int64 */
        createdAtTimestampInMilli?: number;
        files?: MessageFile[];
        filesDeleted?: boolean;
        threadRootId?: string;
        blocks?: MainBlock[];
    }

    export interface ThreadReplyInfo {
        rootId?: string;
        replySentToChannel?: boolean;
        rootText?: string;
    }

    export interface ThreadRootInfo {
        /** @format int32 */
        repliesCount?: number;
        repliers?: string[];
        lastReplyTimestamp?: string;
        /** @format int64 */
        lastReplyTimestampMilli?: number;
        lastMarkTimestamp?: string;
        /** @format int64 */
        lastMarkTimestampMilli?: number;
        isFollowing?: boolean;
    }

    export interface AppAccessToken {
        accessToken?: string;
        botToken?: string;
        workspaceId?: string;
        userId?: string;
        botId?: string;
    }

    export interface CreateChannelRequestBody {
        /**
         * @minLength 1
         * @maxLength 80
         * @pattern [\p{L}0-9\_\-\s]+
         */
        name: string;
        /** @pattern PUBLIC|PRIVATE */
        type?: 'PUBLIC' | 'PRIVATE';
        /**
         * @minLength 0
         * @maxLength 250
         */
        description?: string;
        creatorSectionId?: string;
    }

    export interface Channel {
        id: string;
        workspaceId: string;
        channelType: 'SELF' | 'DIRECT' | 'PUBLIC' | 'PRIVATE';
        name?: string;
        description?: string;
        isMember?: boolean;
        isMuted?: boolean;
        isHidden?: boolean;
        isArchived?: boolean;
        isPumbleBot?: boolean;
        isAddonBot?: boolean;
        lastMarkTimestamp?: string;
        /** @format int64 */
        lastMarkTimestampMilli?: number;
        isMain?: boolean;
        isInitial?: boolean;
        sectionId?: string;
        postingPermissions: PostingPermissions;
        desktopNotificationPreferences: string;
        mobileNotificationPreferences: string;
        notifyAboutRepliesInThreads?: boolean;
        addedById?: string;
    }

    export interface ChannelInfo {
        channel: Channel;
        users?: string[];
        pinnedMessages?: PinnedMessageUserData[];
    }

    export interface PinnedMessageUserData {
        workspaceUserId?: string;
        messageId?: string;
    }

    export interface PostingPermissions {
        allowThreads?: boolean;
        allowMentions?: boolean;
        postingPermissionsGroup?: string;
        workspaceUserIds?: string[];
    }

    export interface AddUsersToChannelRequestBody {
        userIds: string[];
        inviteMessageId?: string;
        addEachWorkspaceUser?: boolean;
    }

    export interface UsersAddedToChannel {
        channelId: string;
        addedUserIds?: string[];
    }

    export interface EphemeralMessageParameters {
        sendToUsers: string[];
    }

    export interface MessagePostRequestBody {
        /**
         * @minLength 0
         * @maxLength 100000
         */
        text: string;
        blocks?: MainBlock[];
        attachments?: MessageAttachment[];
        files?: string[];
        ephemeral?: EphemeralMessageParameters;
    }

    export interface ThreadMessagePostRequestBody {
        /**
         * @minLength 0
         * @maxLength 100000
         */
        text: string;
        blocks?: MainBlock[];
        attachments?: MessageAttachment[];
        files?: string[];
        ephemeral?: EphemeralMessageParameters;
        alsoSendToChannel?: boolean;
    }

    export interface Avatar {
        fullPath: string;
        scaledPath: string;
    }

    export interface CustomStatusDefinition {
        code: string;
        status: string;
        expiration: string;
    }

    export interface Workspace {
        id: string;
        name: string;
        avatar?: Avatar;
        customStatusDefinitions: CustomStatusDefinition[];
        uniqueIdentifier: string;
        previousUniqueIdentifiers?: string[];
    }

    export interface CustomStatus {
        code: string;
        status: string;
        expiration: string;
        /** @format int64 */
        expiresAt?: number;
        showUntil?: boolean;
    }

    export interface WorkspaceUser {
        id: string;
        email: string;
        name: string;
        workspaceId: string;
        role: string;
        status: string;
        avatar: Avatar;
        timeZoneId: string;
        automaticallyTimeZone: boolean;
        title: string;
        phone: string;
        customStatus?: CustomStatus;
        invitedBy?: string;
        /**
         * @format int64
         * @min 0
         */
        activeUntil?: number;
        isInvitationAccepted?: boolean;
        isPumbleBot?: boolean;
        broadcastWarningShownTs?: string;
        isAddonBot?: boolean;
    }

    export interface Messages {
        messages?: Message[];
        hasMoreBefore?: boolean;
        hasMoreAfter?: boolean;
    }
    export interface PermanentCall {
        id?: string;
        code?: string;
        workspaceId?: string;
        workspaceUserId?: string;
        permanentLink?: string;
    }

    export interface MessageSearchRequest {
        /**
         * @maxItems 50
         * @minItems 0
         * @uniqueItems true
         */
        from?: string[];
        /**
         * @maxItems 50
         * @minItems 0
         * @uniqueItems true
         */
        in?: string[];
        /**
         * @minLength 0
         * @maxLength 500
         */
        text?: string;
        /**
         * @default "MOST_RELEVANT"
         * @pattern MOST_RELEVANT|MOST_RECENT|NEWEST|OLDEST
         */
        strategy?: string;
        /**
         * @deprecated
         * @format date
         */
        before?: string;
        /**
         * @deprecated
         * @format date
         */
        after?: string;
        /**
         * @format int64
         * @min 1
         */
        beforeTs?: number;
        /**
         * @format int64
         * @min 1
         */
        afterTs?: number;
        /**
         * @format int32
         * @min 0
         */
        skip?: number;
        /**
         * @format int32
         * @min 1
         * @max 20
         * @default 10
         */
        limit?: number;
        fromMyChannelsOnly?: boolean;
        fromHumanOnly?: boolean;
        /**
         * @format int32
         * @min 0
         */
        minReactionCount?: number;
        /**
         * @format int32
         * @min 0
         */
        minAttachmentCount?: number;
        /**
         * @format int32
         * @min 0
         */
        minFileCount?: number;
    }

    export interface MessageSearchResult extends Message {
        highlightedBlocks?: MainBlock[];
    }
    export interface PageMessageSearchResult {
        content?: MessageSearchResult[];
        /** @format int64 */
        totalElements?: number;
        hasMore?: boolean;
    }
    export interface ReactionRequest {
        /**
         * @minLength 3
         * @maxLength 200
         * @pattern :.*:
         */
        code: string;
        /** @format int32 */
        skinTone?: number;
    }

    export interface CreateDirectChannelRequest {
        /**
         * @maxItems 8
         * @minItems 1
         */
        participantIds?: string[];
        /**
         * @maxItems 8
         * @minItems 0
         */
        hiddenFor?: string[];
    }
}
