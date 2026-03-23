/**
 * Typed Modal State Reader
 * 
 * Provides type-safe access to modal form values without manually specifying block_id/action_id each time.
 * 
 * @example
 * ```typescript
 * // Define schema once
 * const shortUrlSchema = {
 *     longUrl: { blockId: 'b_long_url', actionId: 'a_long_url', type: 'input' },
 *     domain: { blockId: 'b_domain', actionId: 'a_domain', type: 'select' },
 *     masked: { blockId: 'b_masked', actionId: 'a_masked', type: 'checkbox' },
 *     expires: { blockId: 'b_expires', actionId: 'a_expires', type: 'datepicker' },
 * } as const;
 * 
 * // Create typed reader
 * const readShortUrlModal = createModalStateReader(shortUrlSchema);
 * 
 * // Use in handler - fully typed!
 * const values = readShortUrlModal(ctx.payload.state);
 * values.longUrl   // string
 * values.domain    // string | undefined
 * values.masked    // boolean
 * values.expires   // string | undefined
 * ```
 */

// Field types supported by the reader
export type FieldType = 'input' | 'select' | 'checkbox' | 'datepicker' | 'multiselect';

// Schema field definition - generic to preserve literal type
export interface FieldDefinition<T extends FieldType = FieldType> {
    readonly blockId: string;
    readonly actionId: string;
    readonly type: T;
}

// Schema is a record of field names to field definitions
export type ModalSchema = Record<string, FieldDefinition<FieldType>>;

// Map field type to its return type
type FieldReturnType<T extends FieldType> = 
    T extends 'input' ? string :
    T extends 'select' ? string | undefined :
    T extends 'checkbox' ? boolean :
    T extends 'datepicker' ? string | undefined :
    T extends 'multiselect' ? string[] :
    never;

// Infer the return type from schema - extracts literal type from readonly field
export type ModalStateValues<S extends ModalSchema> = {
    [K in keyof S]: S[K] extends FieldDefinition<infer T> ? FieldReturnType<T> : never;
};

// Modal state type (from Pumble)
export interface ModalState {
    values?: Record<string, Record<string, any>>;
}

/**
 * Creates a typed modal state reader from a schema definition.
 * 
 * @param schema - The modal schema defining fields and their types
 * @returns A function that reads state and returns typed values
 */
export function createModalStateReader<S extends ModalSchema>(
    schema: S
): (state: ModalState | any) => ModalStateValues<S> {
    return (state: ModalState | any): ModalStateValues<S> => {
        const result: Partial<ModalStateValues<S>> = {};

        for (const [key, field] of Object.entries(schema)) {
            const value = readField(state, field.blockId, field.actionId, field.type);
            (result as any)[key] = value;
        }

        return result as ModalStateValues<S>;
    };
}

/**
 * Reads a single field from modal state based on its type.
 */
function readField(state: ModalState | any, blockId: string, actionId: string, type: FieldType): any {
    const field = state?.values?.[blockId]?.[actionId];

    switch (type) {
        case 'input':
            return readInputField(field);
        case 'select':
            return readSelectField(field);
        case 'checkbox':
            return readCheckboxField(field);
        case 'datepicker':
            return readDatepickerField(field);
        case 'multiselect':
            return readMultiselectField(field);
        default:
            return undefined;
    }
}

function readInputField(field: any): string {
    const value = field?.value;
    return typeof value === 'string' ? value.trim() : '';
}

function readSelectField(field: any): string | undefined {
    // Handle various Pumble response formats
    return field?.selected_option?.value 
        ?? field?.selectedOption?.value 
        ?? field?.value 
        ?? undefined;
}

function readCheckboxField(field: any): boolean {
    if (!field?.values?.[0]) return false;
    const value = field.values[0];
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') return value.trim().toLowerCase() === 'true';
    return false;
}

function readDatepickerField(field: any): string | undefined {
    const rawValue = field?.selected_date ?? field?.selectedDate ?? field?.value;
    if (typeof rawValue !== 'string') return undefined;
    
    const date = new Date(rawValue.split('T')[0]);
    if (isNaN(date.getTime())) return undefined;
    
    date.setUTCHours(23, 59, 59, 0);
    return date.toISOString();
}

function readMultiselectField(field: any): string[] {
    const options = field?.selected_options ?? field?.selectedOptions ?? [];
    if (!Array.isArray(options)) return [];
    return options.map((opt: any) => opt?.value).filter(Boolean);
}

/**
 * Helper to create field definitions with proper typing
 */
export const field = {
    input: (blockId: string, actionId: string): FieldDefinition<'input'> => 
        ({ blockId, actionId, type: 'input' } as const),
    
    select: (blockId: string, actionId: string): FieldDefinition<'select'> => 
        ({ blockId, actionId, type: 'select' } as const),
    
    checkbox: (blockId: string, actionId: string): FieldDefinition<'checkbox'> => 
        ({ blockId, actionId, type: 'checkbox' } as const),
    
    datepicker: (blockId: string, actionId: string): FieldDefinition<'datepicker'> => 
        ({ blockId, actionId, type: 'datepicker' } as const),
    
    multiselect: (blockId: string, actionId: string): FieldDefinition<'multiselect'> => 
        ({ blockId, actionId, type: 'multiselect' } as const),
};
