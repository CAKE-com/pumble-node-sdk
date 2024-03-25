type Shortcut = {
    name: string;
    url: string;
    [key: string]: unknown;
} & (
    | {
          shortcutType: 'GLOBAL';
      }
    | {
          shortcutType: 'ON_MESSAGE';
      }
);

type SlashCommand = {
    command: string;
    url: string;
    [key: string]: unknown;
};

type BlockInteraction = {
    url: string;
};

type ManifestEvents = {
    url: string;
    events?: readonly EventDeclare[];
};

type EventDeclare =
    | string
    | {
          name: string;
      };

export type AddonManifest = {
    id: string;
    socketMode?: boolean;
    shortcuts: readonly Shortcut[];
    slashCommands: readonly SlashCommand[];
    blockInteraction?: BlockInteraction;
    redirectUrls: readonly string[];
    eventSubscriptions: ManifestEvents;
    clientSecret: string;
    appKey: string;
    signingSecret: string;
    scopes: {
        userScopes: string[];
        botScopes: string[];
    };
    listingUrl?: string;
    helpUrl?: string;
    welcomeMessage?: string;
    offlineMessage?: string;
    [key: string]: unknown;
};
