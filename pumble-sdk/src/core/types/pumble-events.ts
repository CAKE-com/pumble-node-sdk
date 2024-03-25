type EventMap = {
    REACTION_ADDED: NotificationReaction;
    NEW_MESSAGE: NotificationMessage;
    UPDATED_MESSAGE: NotificationMessage;
    CHANNEL_CREATED: NotificationChannel;
    APP_UNINSTALLED: NotificationAppUninstalled;
    APP_UNAUTHORIZED: NotificationAppUnauthorized;
    WORKSPACE_USER_JOINED: NotificationWorkspaceUserJoined;
};

export type PumbleEventType = keyof EventMap & string;

export type PumbleEventNotificationPayload<T extends PumbleEventType> = EventMap[T];

export type NotificationChannel = {
    // workspace id
    wId: string;
    // channel id
    cId: string;
    // channel name
    cN: string;
    // Channel users
    cU: string[];
    // Channel type
    cT: string;
    // Event type
    ty: string;
    // Request id
    rid: string;
};

type NotificationWorkspaceUserJoined = {
    // Name
    uN: string;
    // Email
    uE: string;
    // User id
    uId: string;
    // Avatar full path
    afp: string;
    // Avatar scaled path
    asp: string;
    // workspace id
    wId: string;
    // Event type
    ty: string;
    // Timezone
    tz: string;
    // Snooze timestamp
    sts: string;
    // Profile title
    pt: string;
    // Profile phone
    pp: string;
    cs: WorkspaceUserCustomStatus;
    // Request id
    rid: string;
    // status
    st: string;
    // role
    ro: string;
    // active until
    au: string;
    // invited by
    ib: string;
};

type WorkspaceUserCustomStatus = {
    // status
    st: string;
    // code
    co: string;
    // expiration
    ex: string;
    // expires at
    ea: string;
    // is shown until
    su: boolean;
};

export type NotificationAppUninstalled = {
    id: string;
    app: string;
    workspace: string;
    installedBy: string;
    botUser: string;
    uninstalledAt: Date;
};

export type NotificationAppUnauthorized = {
    id: string;
    app: string;
    appInstallation: string;
    workspaceUser: string;
    workspace: string;
    grantedScopes: string[];
    accessGranted: boolean;
};

export type NotificationReaction = {
    // workspace id
    wId: string;
    // channel id
    cId: string;
    // message id
    mId: string;
    // message author id
    mat: string;
    // user Id
    uId: string;
    // reaction code
    rc: string;
    // type
    ty: string;
    // Request id
    rid: string;
};
type NotificationShardMessage = {};
type NotificationMessageMeta = {};
type NotificationMessageFile = {};
type NotificationAffectedUserMeta = {};
export type NotificationMessage = {
    // message id
    mId: string;
    // workspace id
    wId: string;
    //  channel id
    cId: string;
    // thread root id
    trId: string;
    // is also send to channel
    stc: string;
    // thread root message text
    trMt: string;
    // author id
    aId: string;
    // message text
    tx: string;
    // blocks
    bl: Array<Record<string, object>>;
    // event type
    ty: string;
    // timestamp
    ts: string;
    // timestamp millis
    tsm: number;
    // subtype
    st: string;
    // request id
    rid: string;
    f: Array<NotificationMessageFile>;
    // local id
    lId: string;
    // attachments
    att: Record<string, object>;
    // shared message
    sm: NotificationShardMessage;
    // message meta
    mm: NotificationMessageMeta;
    // mentions direct
    md: string[];
    // mentions channel
    mc: string[];
    // mentions user
    mu: string[];
    // affected users meta
    au: Array<NotificationAffectedUserMeta>;
    // is edited
    e: boolean;
};
