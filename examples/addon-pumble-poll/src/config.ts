export const ADDON_LISTENER_PORT = +(process.env.ADDON_LISTENER_PORT || '9898');
export const MONGO_URL = process.env.MONGO_URL || 'mongodb://root:admin@localhost:27017?directConnection=true';
export const MONGO_DB_NAME = process.env.MONGO_DB_NAME || 'poll_pumble_addon';
export const PUMBLE_FRONTEND_URL = process.env.PUMBLE_FRONTEND_URL || 'https://app.pumble.com';
export const APP_DOMAIN = process.env.APP_DOMAIN || 'https://your-test-domain-here.com';
export const RESULTS_PAGE_EXPIRY_DELAY = 7;

export const PUMBLE_APP_ID = process.env.PUMBLE_APP_ID;
export const PUMBLE_APP_KEY = process.env.PUMBLE_APP_KEY;
export const PUMBLE_APP_CLIENT_SECRET = process.env.PUMBLE_APP_CLIENT_SECRET;
export const PUMBLE_APP_SIGNING_SECRET = process.env.PUMBLE_APP_SIGNING_SECRET;

export const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default_32_char_placeholder_key_';
export const ENCRYPTION_IV = process.env.ENCRYPTION_IV || 'default_16_char_';

export const LOG_LEVEL = process.env.LOG_LEVEL || 'debug';