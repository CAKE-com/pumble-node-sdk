/**
 * Manifest Validator
 *
 * Validates Pumble app manifest before sending to API to catch errors early
 * and provide meaningful error messages instead of generic 500 errors.
 */

export interface ValidationResult {
    valid: boolean;
    errors: string[];
    warnings: string[];
}

// Known supported fields in Pumble manifest
const SUPPORTED_ROOT_FIELDS = new Set([
    'id',
    'name',
    'displayName',
    'bot',
    'botTitle',
    'socketMode',
    'scopes',
    'eventSubscriptions',
    'welcomeMessage',
    'offlineMessage',
    'slashCommands',
    'shortcuts',
    'blockInteraction',
    'viewAction',
    'dynamicMenus',
    'redirectUrls',
    'listingUrl',
    'helpUrl',
    // Internal fields (added by SDK)
    'clientSecret',
    'appKey',
    'signingSecret',
]);

// Fields that are known to cause 500 errors
const UNSUPPORTED_FIELDS = new Set([
    'listingIcon',
    'avatar',
    'icon',
    'logo',
]);

// Valid bot scopes
const VALID_BOT_SCOPES = new Set([
    'messages:read',
    'messages:write',
    'channels:read',
    'channels:write',
    'users:read',
    'files:read',
    'files:write',
    'reactions:read',
    'reactions:write',
]);

// Valid user scopes
const VALID_USER_SCOPES = new Set([
    'messages:read',
    'messages:write',
    'channels:read',
    'channels:write',
    'users:read',
    'files:read',
    'files:write',
    'reactions:read',
    'reactions:write',
]);

// Valid shortcut types
const VALID_SHORTCUT_TYPES = new Set(['GLOBAL', 'ON_MESSAGE']);

// Valid event types
const VALID_EVENT_TYPES = new Set([
    'NEW_MESSAGE',
    'UPDATED_MESSAGE',
    'DELETED_MESSAGE',
    'REACTION_ADDED',
    'REACTION_REMOVED',
    'CHANNEL_CREATED',
    'CHANNEL_UPDATED',
    'CHANNEL_DELETED',
    'USER_JOINED_CHANNEL',
    'USER_LEFT_CHANNEL',
    'APP_INSTALLED',
    'APP_UNINSTALLED',
]);

/**
 * Validates a Pumble app manifest
 */
export function validateManifest(manifest: Record<string, unknown>): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check for unsupported fields that cause 500 errors
    for (const field of UNSUPPORTED_FIELDS) {
        if (field in manifest) {
            errors.push(`"${field}" is not supported by Pumble API and will cause an error. Remove this field.`);
        }
    }

    // Warn about unknown fields
    for (const key of Object.keys(manifest)) {
        if (!SUPPORTED_ROOT_FIELDS.has(key) && !UNSUPPORTED_FIELDS.has(key)) {
            warnings.push(`Unknown field "${key}" - this may be ignored or cause errors.`);
        }
    }

    // Required fields
    if (!manifest.name) {
        errors.push('"name" is required.');
    } else if (typeof manifest.name !== 'string') {
        errors.push('"name" must be a string.');
    } else if (!/^[a-z0-9_]+$/.test(manifest.name as string)) {
        errors.push('"name" must contain only lowercase letters, numbers, and underscores.');
    }

    if (!manifest.displayName) {
        errors.push('"displayName" is required.');
    } else if (typeof manifest.displayName !== 'string') {
        errors.push('"displayName" must be a string.');
    }

    // Scopes validation
    if (!manifest.scopes) {
        errors.push('"scopes" is required.');
    } else if (typeof manifest.scopes !== 'object' || manifest.scopes === null) {
        errors.push('"scopes" must be an object.');
    } else {
        const scopes = manifest.scopes as Record<string, unknown>;
        
        if (!Array.isArray(scopes.botScopes)) {
            errors.push('"scopes.botScopes" must be an array.');
        } else {
            for (const scope of scopes.botScopes) {
                if (!VALID_BOT_SCOPES.has(scope as string)) {
                    warnings.push(`Unknown bot scope "${scope}" - verify this is valid.`);
                }
            }
        }

        if (!Array.isArray(scopes.userScopes)) {
            errors.push('"scopes.userScopes" must be an array.');
        } else {
            for (const scope of scopes.userScopes) {
                if (!VALID_USER_SCOPES.has(scope as string)) {
                    warnings.push(`Unknown user scope "${scope}" - verify this is valid.`);
                }
            }
        }
    }

    // Slash commands validation
    if (manifest.slashCommands !== undefined) {
        if (!Array.isArray(manifest.slashCommands)) {
            errors.push('"slashCommands" must be an array.');
        } else {
            (manifest.slashCommands as any[]).forEach((cmd, i) => {
                if (!cmd.command) {
                    errors.push(`slashCommands[${i}]: "command" is required.`);
                } else if (!cmd.command.startsWith('/')) {
                    errors.push(`slashCommands[${i}]: "command" must start with "/".`);
                }
                if (!cmd.url) {
                    errors.push(`slashCommands[${i}]: "url" is required.`);
                }
            });
        }
    }

    // Shortcuts validation
    if (manifest.shortcuts !== undefined) {
        if (!Array.isArray(manifest.shortcuts)) {
            errors.push('"shortcuts" must be an array.');
        } else {
            (manifest.shortcuts as any[]).forEach((shortcut, i) => {
                if (!shortcut.name) {
                    errors.push(`shortcuts[${i}]: "name" is required.`);
                }
                if (!shortcut.shortcutType) {
                    errors.push(`shortcuts[${i}]: "shortcutType" is required.`);
                } else if (!VALID_SHORTCUT_TYPES.has(shortcut.shortcutType)) {
                    errors.push(`shortcuts[${i}]: "shortcutType" must be "GLOBAL" or "ON_MESSAGE".`);
                }
                if (!shortcut.url) {
                    errors.push(`shortcuts[${i}]: "url" is required.`);
                }
            });
        }
    }

    // Event subscriptions validation
    if (manifest.eventSubscriptions !== undefined) {
        const evtSub = manifest.eventSubscriptions as Record<string, unknown>;
        
        if (typeof evtSub !== 'object' || evtSub === null) {
            errors.push('"eventSubscriptions" must be an object.');
        } else {
            if (evtSub.events !== undefined) {
                if (!Array.isArray(evtSub.events)) {
                    errors.push('"eventSubscriptions.events" must be an array.');
                } else {
                    (evtSub.events as any[]).forEach((evt, i) => {
                        const eventName = typeof evt === 'string' ? evt : evt?.name;
                        if (!eventName) {
                            errors.push(`eventSubscriptions.events[${i}]: event name is required.`);
                        } else if (!VALID_EVENT_TYPES.has(eventName)) {
                            warnings.push(`eventSubscriptions.events[${i}]: unknown event "${eventName}".`);
                        }
                    });
                }
            }
        }
    }

    // Dynamic menus - warn if empty array (can cause issues)
    if (manifest.dynamicMenus !== undefined) {
        if (Array.isArray(manifest.dynamicMenus) && manifest.dynamicMenus.length === 0) {
            warnings.push('"dynamicMenus" is an empty array - consider removing it.');
        }
    }

    // Boolean fields
    if (manifest.bot !== undefined && typeof manifest.bot !== 'boolean') {
        errors.push('"bot" must be a boolean.');
    }
    if (manifest.socketMode !== undefined && typeof manifest.socketMode !== 'boolean') {
        errors.push('"socketMode" must be a boolean.');
    }

    // String fields
    const stringFields = ['botTitle', 'welcomeMessage', 'offlineMessage', 'listingUrl', 'helpUrl'];
    for (const field of stringFields) {
        if (manifest[field] !== undefined && typeof manifest[field] !== 'string') {
            errors.push(`"${field}" must be a string.`);
        }
    }

    return {
        valid: errors.length === 0,
        errors,
        warnings,
    };
}

/**
 * Validates manifest and logs results
 */
export function validateAndLogManifest(manifest: Record<string, unknown>, logger?: {
    error: (msg: string) => void;
    warn: (msg: string) => void;
    success: (msg: string) => void;
}): boolean {
    const log = logger || {
        error: (msg: string) => console.error(`✗ ${msg}`),
        warn: (msg: string) => console.warn(`⚠ ${msg}`),
        success: (msg: string) => console.log(`✓ ${msg}`),
    };

    console.log('Validating manifest...');
    const result = validateManifest(manifest);

    for (const warning of result.warnings) {
        log.warn(warning);
    }

    for (const error of result.errors) {
        log.error(error);
    }

    if (result.valid) {
        log.success('Manifest is valid.');
    } else {
        log.error(`Manifest has ${result.errors.length} error(s). Fix them before syncing.`);
    }

    return result.valid;
}
