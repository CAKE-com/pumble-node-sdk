export const MONGO_URL =
    process.env.MONGO_URL ||
    'mongodb://root:admin@localhost:27017?directConnection=true';
export const MONGO_DB_NAME = process.env.MONGO_DB_NAME || 'addon-pumble-zendesk';
export const CLIENT_ID = process.env.CLIENT_ID || 'pumble-local';
export const CLIENT_SECRET = process.env.CLIENT_SECRET || 'your-zendesk-oauth-client-secret-here';
export const REDIRECT_URI = process.env.REDIRECT_URI || 'https://your-test-domain-here.com/setup';
export const SCOPES = process.env.SCOPES || 'read%20write';
export const STATE_SECRET = process.env.STATE_SECRET || 'dc256907-bee9-bee9-bee9-dc2569079912';
export const ZENDESK_APP_ID = process.env.ZENDESK_APP_ID || '';
export const ZENDESK_APP_NAME = process.env.ZENDESK_APP_NAME || 'Pumble';
export const ZENDESK_DEVELOPER_ORG_ID = process.env.ZENDESK_DEVELOPER_ORG_ID || '';
export const WEBHOOK_BASE_URL = process.env.WEBHOOK_BASE_URL || 'https://your-test-domain-here.com/webhook/';
export const PUMBLE_APP_URL = process.env.PUMBLE_APP_URL || "app.pumble.com";