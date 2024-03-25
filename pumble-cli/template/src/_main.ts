import {
  App,
  JsonFileTokenStore,
  start,
} from "pumble-sdk";

const addon: App = {
  globalShortcuts: {{globalShortcuts}},
  messageShortcuts: {{messageShortcuts}},
  slashCommands: {{slashCommands}},
  events: {{events}},
  eventsPath: "{{eventsPath}}",
  redirect: {{redirect}},
  tokenStore: new JsonFileTokenStore("tokens.json"),
};

start(addon);
