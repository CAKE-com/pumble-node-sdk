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
              files?: FileToUpload[]
          }
        | string;

    export type MessageRequest = {
        text: string;
        blocks?: MainBlock[];
        attachments?: MessageAttachment[];
        files?: String[]
    }

    export type BlockRichTextSection = {
        type: 'rich_text_section';
        elements: BlockBasic[];
    };

    export type BlockRichTextPreformatted = {
        type: 'rich_text_preformatted';
        elements: { type: 'text'; text: string; }[];
    };

    export type BlockRichTextQuote = {
        type: 'rich_text_quote';
        elements: BlockBasic[];
    };

    export type BlockRichTextList = {
        type: 'rich_text_list';
        border?: 0 | 1;
        offset?: number;
        indent: 0 | 1 | 2 | 3 | 4;
        style: "ordered" | "bullet"
        elements: BlockRichTextSection[];
    };

    type TextStyle = {code?: boolean; bold?: boolean; strike?: boolean; italic?: boolean};

    export type BlockBasic =
        | { type: 'link'; url: string; text?: string; raw?: boolean; style?: TextStyle}
        | { type: 'text'; text: string; unlinked?: boolean; style?: TextStyle }
        | { type: 'emoji'; name: string; skin_tone?: number }
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

    export type OptionGroup = {
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

    export type BlockPlainTextInput = Input & {
        type: 'plain_text_input';
        initial_value?: string;
        placeholder?: BlockTextElement;
        multiline?: boolean;
        min_length?: number;
        max_length?: number;
        interaction_triggers?: InteractionTriggers[];
    };

    export type BlockStaticSelectMenu = Input & {
        type: 'static_select_menu';
        placeholder: BlockTextElement;
        options: Option[];
        option_groups?: OptionGroup[];
        initial_option?: Option | OptionGroup;
        confirm?: ConfirmDialog;
    };

    export type BlockDynamicSelectMenu = Input & {
        type: 'dynamic_select_menu';
        placeholder: BlockTextElement;
        min_query_length?: number;
        initial_option?: Option | OptionGroup;
        confirm?: ConfirmDialog;
    };

    export type BlockCheckboxes = Input & {
        type: 'checkboxes';
        options: Option[];
        initial_options?: Option[];
        confirm?: ConfirmDialog;
    };

    export type BlockDatePicker = Input & {
        type: 'date_picker';
        /**
         * YYYY-MM-DD
         */
        initial_date?: string;
        placeholder?: BlockTextElement;
        confirm?: ConfirmDialog;
    };

    export type BlockDateRangePicker = Input & {
        type: 'date_range_picker';
        initial_date_range?: DateRange;
        placeholder?: BlockTextElement;
        confirm?: ConfirmDialog;
    }

    export type DateRange = {
        /**
         * YYYY-MM-DD
         */
        start: string;
        /**
         * YYYY-MM-DD
         */
        end: string;
    }

    type ActionableBlock = BlockButton | BlockStaticSelectMenu | BlockDynamicSelectMenu | BlockPlainTextInput |
        BlockCheckboxes | BlockDatePicker | BlockDateRangePicker;
    export type ActionableBlockNames = 'button' | 'static_select_menu' | 'dynamic_select_menu' | 'plain_text_input' |
        'checkboxes' | 'date_picker' | 'date_range_picker';
    export type InteractionTriggers = 'on_enter_pressed' | 'on_input';

    export type BlockRichText = {
        type: 'rich_text';
        elements: (BlockRichTextSection | BlockRichTextPreformatted | BlockRichTextList | BlockRichTextQuote)[];
    };

    export type BlockInput = {
        type: 'input';
        blockId: string;
        label: BlockTextElement;
        element: ActionableBlock;
        dispatchAction?: boolean;
        optional?: boolean;
    };

    export type BlockActions = {
        type: 'actions';
        elements: ActionableBlock[];
    };

    export type BlockDivider = {
        type: 'divider';
    };

    export type BlockSection = {
        type: 'section';
        text: BlockTextElement;
        accessory?: BlockInput;
        text_position?: 'left' | 'right';
    }

    export type MainBlock = BlockRichText | BlockInput | BlockActions | BlockDivider | BlockSection;

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
        blocks?: MainBlock[];
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

    export interface EditEphemeralMessageRequestBody {
        text: string;
        blocks?: MainBlock[],
        attachments?: MessageAttachment[];
        ephemeral: EphemeralMessageParams;
    }

    export interface DeleteEphemeralMessageRequestBody {
        threadRootId?: string,
        deleteForUsers: string[]
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
        timeFormat : number;
    }

    export interface UserGroup {
        id: string;
        workspaceId: string;
        createdBy: string;
        disabled: boolean;
        name: string;
        handle: string;
        description: string;
        workspaceUserIds: string[];
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

    export interface ScheduledMessageRequest {
        /**
         * @format int64
         * @min 0
         * @max 4000000000000
         */
        sendAt: number;
        /**
         * @minLength 0
         * @maxLength 100000
         */
        text: string;
        channelId: string;
        blocks?: MainBlock[];
        attachments?: MessageAttachment[];
        recurrence?: ScheduledMessageRecurrenceRequest;
    }

    export interface CreateScheduledMessageRequest extends ScheduledMessageRequest{
        files?: FileToUpload[];
    }

    export interface ScheduledMessageRecurrenceRequest {
        recurrenceType: ScheduledMessageRecurrenceType,
        /**
         * @format int32
         * @min 0
         * @max 9999
         */
        endAfterOccurrences?: number;
        /**
         * @format int64
         * @min 0
         * @max 4000000000000
         */
        endDate?: number;
    }

    export type ScheduledMessageRecurrenceType =
        'DAILY' |
        'BUSINESSDAYS' |
        'WEEKLY'  |
        'BIWEEKLY'  |
        'MONTHLY_NTH_WEEKDAY' |
        'MONTHLY_LAST_WEEKDAY' |
        'QUARTERLY_NTH_WEEKDAY' |
        'QUARTERLY_LAST_WEEKDAY' |
        'ANNUALLY';

    export interface ScheduledMessage {
        id: string;
        workspaceId: string;
        author: string;
        channelId: string;
        text: string;
        sentAt: number;
        files: MessageFile[];
        blocks?: MainBlock[];
        attachments: Record<string, object>[];
        recurrence?: ScheduledMessageRecurrence;
    }

    export interface ScheduledMessageRecurrence {
        recurrenceType: ScheduledMessageRecurrenceType,
        endAfterOccurrences: number;
        endDate: number;
    }

    export interface ScheduledMessages {
        scheduledMessages: ScheduledMessage[];
        hasMore: boolean;
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

    export interface FileUploadTokenRequest {
        filename: string,
        length:  number
    }

    export interface FileUploadToken {
        token: string;
        remoteProductToken?: string;
    }

    export interface File {
        id: string;
        path: string;
        name: string;
    }

    export interface FileDataResponse {
        mimeType: string;
        width: number;
        height: number;
        size: number;
        path: string;
        duration: number;
        waveform: number[],
        requestedFileUploadId: string;
        base64Value: string
    }

    export interface CompleteFileUpload {
        original: FileDataResponse;
        thumbs: FileDataResponse[];
        signature: string;
    }

    export interface FileUploadOptions {
        name: string,
        mimeType: string
    }

    export interface ProccessedFile {
        blob: Blob,
        name: string,
        length: number
    }

    export interface FileToUpload {
        input: Buffer|Blob|String,
        options?: V1.FileUploadOptions
    }

    export interface PublishHomeViewRequest {
        blocks: MainBlock[];
        title?: BlockTextElement,
        state?: any
    }

    export type ViewType = "MODAL" | "HOME";

    export type View<T extends ViewType> = {
        id?: string,
        type: T,
        blocks: MainBlock[]
        title: BlockTextElement,
        state?: State
    } & (T extends "MODAL" ? {
            callbackId: string,
            submit?: BlockTextElement,
            close?: BlockTextElement,
            notifyOnClose: boolean,
            parentViewId?: string
        } : {})

    export type State = {
        values: {
            [key: string]: {
                [key: string]: {
                    type: ActionableBlockNames;
                    value: string;
                    values?: string[];
                }
            }
        }
    };

    export type StorageIntegrationModalCredentials = GoogleDriveModalCredentials;

    export interface GoogleDriveModalCredentials {
        googleAccessToken: string,
        googleAppId: string,
        googleApiKey: string,
        googleClientId: string
    }

}
