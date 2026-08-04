export const LOG_LEVEL = process.env.LOG_LEVEL || 'debug';
export const MONGO_URL = process.env.MONGO_URL || 'mongodb://root:admin@localhost:27017?directConnection=true';
export const MONGO_DB_NAME = process.env.MONGO_DB_NAME || 'rss_pumble_addon';
export const MONGO_AUTH_COLLECTION_NAME = process.env.MONGO_AUTH_COLLECTION_NAME || 'credentials'
export const MAX_ITEMS_NUMBER_PER_CYCLE = process.env.MAX_ITEMS_NUMBER_PER_CYCLE || 100;
export const CRON_JOB_EXPRESSION = process.env.CRON_JOB_EXPRESSION || '*/20 * * * *';
export const BATCH_SIZE = Number(process.env.BATCH_SIZE) || 50;
export const TIMEOUT_BETWEEN_BATCHES_MS = Number(process.env.TIMEOUT_BETWEEN_BATCHE_MS) || 3000;
export const CONCURRENCY_LIMIT = Number(process.env.CONCURRENCY_LIMIT) || 10;
export const MAX_RESPONSE_SIZE_MB = Number(process.env.MAX_RESPONSE_SIZE_MB) || 2;
export const RUN_MIGRATIONS = process.env.RUN_MIGRATIONS == 'true';

export const ADDON_CLIENT_ID = process.env.ADDON_CLIENT_ID || '6a0645e00000000000000000';
export const ADDON_CLIENT_SECRET = process.env.ADDON_CLIENT_SECRET || 'xpcls-aaaaaaaaaa1111111111aaaaaaaaaa11';
export const ADDON_SIGNING_SECRET = process.env.ADDON_SIGNING_SECRET || 'xpss-aaaaaaaaaa1111111111aaaaaaaaaa11';
export const ADDON_APP_KEY = process.env.ADDON_APP_KEY || 'xpat-aaaaaaaaaa1111111111aaaaaaaaaa11';
export const ADDON_AUTHOR =process.env.ADDON_AUTHOR || '6a0645e00000000000000000';
export const APP_BASE_URL = process.env.APP_BASE_URL || 'http://localhost:9799';
export const ADDON_FULL_AVATAR = process.env.ADDON_FULL_AVATAR || 'https://files.pumble.com/avatars/default/640/6a0645e00000000000000000'
export const ADDON_SCALED_AVATAR = process.env.ADDON_SCALED_AVATAR || 'https://files.pumble.com/avatars/default/48/6a0645e00000000000000000'
export const ADDON_DEFAULT_WORKSPACE_ID = process.env.ADDON_DEFAULT_WORKSPACE_ID || '6a0645e00000000000000000'
export const ADDON_LISTENER_PORT = +(process.env.ADDON_LISTENER_PORT || '9799');

export const HELP_PAGE_URL = process.env.HELP_PAGE_URL || 'https://pumble.com/help/integrations/content-information-feeds/rss-feed-integration/';
export const DEMO_VIDEO_URL = process.env.DEMO_VIDEO_URL || 'https://vimeo.com/1154236142/89c31f3b81?share=copy&fl=sv&fe=ci';
export const PUMBLE_APP_URL = process.env.PUMBLE_APP_URL || 'https://app.pumble.com'