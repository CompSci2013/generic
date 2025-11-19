/**
 * URL Serializer Utility
 * Domain-agnostic URL parameter serialization and deserialization
 *
 * Handles conversion between typed objects and URL query string representations
 * Supports primitives, arrays, objects, dates, and null/undefined values
 *
 * @example
 * ```typescript
 * const serializer = new UrlSerializer();
 *
 * // Serialize object to URL params
 * const params = { page: 1, tags: ['a', 'b'], active: true };
 * const encoded = serializer.serialize(params);
 * // Result: 'page=1&tags=a,b&active=true'
 *
 * // Deserialize URL params back to object
 * const decoded = serializer.deserialize('page=1&tags=a,b&active=true');
 * // Result: { page: '1', tags: 'a,b', active: 'true' }
 * ```
 */
export class UrlSerializer {
  /**
   * Array delimiter for serializing arrays in URL
   * Default: comma (',')
   */
  private readonly arrayDelimiter = ',';

  /**
   * Serialize an object to URL query string
   * Converts typed values to URL-safe strings
   *
   * @param params - Object to serialize
   * @returns URL query string (without leading '?')
   *
   * @example
   * ```typescript
   * serialize({ page: 1, filter: 'active', tags: ['a', 'b'] })
   * // Returns: 'page=1&filter=active&tags=a,b'
   * ```
   */
  serialize(params: Record<string, any>): string {
    const pairs: string[] = [];

    for (const key in params) {
      if (params.hasOwnProperty(key)) {
        const value = params[key];

        // Skip undefined and null values
        if (value === undefined || value === null) {
          continue;
        }

        const encodedValue = this.encodeValue(value);
        pairs.push(`${encodeURIComponent(key)}=${encodeURIComponent(encodedValue)}`);
      }
    }

    return pairs.join('&');
  }

  /**
   * Deserialize URL query string to object
   * Parses URL parameters into a key-value object
   *
   * @param queryString - URL query string (with or without leading '?')
   * @returns Object with string values (use type converters for typed values)
   *
   * @example
   * ```typescript
   * deserialize('page=1&filter=active')
   * // Returns: { page: '1', filter: 'active' }
   * ```
   */
  deserialize(queryString: string): Record<string, any> {
    const params: Record<string, any> = {};

    // Remove leading '?' if present
    const cleanQuery = queryString.startsWith('?') ? queryString.slice(1) : queryString;

    if (!cleanQuery) {
      return params;
    }

    const pairs = cleanQuery.split('&');

    for (const pair of pairs) {
      const [key, value] = pair.split('=');

      if (key) {
        const decodedKey = decodeURIComponent(key);
        const decodedValue = value ? decodeURIComponent(value) : '';
        params[decodedKey] = decodedValue;
      }
    }

    return params;
  }

  /**
   * Encode a value for URL parameter
   * Handles different data types appropriately
   *
   * @param value - Value to encode
   * @returns String representation for URL
   */
  private encodeValue(value: any): string {
    // Arrays: join with delimiter
    if (Array.isArray(value)) {
      return value.map(v => String(v)).join(this.arrayDelimiter);
    }

    // Dates: convert to ISO string
    if (value instanceof Date) {
      return value.toISOString();
    }

    // Objects: JSON stringify
    if (typeof value === 'object' && value !== null) {
      return JSON.stringify(value);
    }

    // Primitives: convert to string
    return String(value);
  }

  /**
   * Decode an array from URL parameter
   * Splits comma-separated string into array
   *
   * @param value - Comma-separated string
   * @returns Array of strings
   */
  decodeArray(value: string): string[] {
    if (!value) {
      return [];
    }
    return value.split(this.arrayDelimiter).filter(v => v !== '');
  }

  /**
   * Decode a number from URL parameter
   * Converts string to number with validation
   *
   * @param value - String number
   * @param defaultValue - Default if conversion fails
   * @returns Parsed number or default
   */
  decodeNumber(value: string, defaultValue: number = 0): number {
    if (!value) {
      return defaultValue;
    }
    const num = Number(value);
    return isNaN(num) ? defaultValue : num;
  }

  /**
   * Decode a boolean from URL parameter
   * Treats 'true' (case-insensitive) as true, all else as false
   *
   * @param value - String boolean
   * @param defaultValue - Default if value is empty
   * @returns Parsed boolean
   */
  decodeBoolean(value: string, defaultValue: boolean = false): boolean {
    if (!value) {
      return defaultValue;
    }
    return value.toLowerCase() === 'true';
  }

  /**
   * Decode an object from URL parameter
   * Parses JSON-encoded string
   *
   * @param value - JSON string
   * @returns Parsed object or null if invalid
   */
  decodeObject<T = any>(value: string): T | null {
    if (!value) {
      return null;
    }
    try {
      return JSON.parse(value) as T;
    } catch {
      console.warn('[UrlSerializer] Failed to parse object from URL parameter:', value);
      return null;
    }
  }

  /**
   * Decode a Date from URL parameter
   * Parses ISO date string
   *
   * @param value - ISO date string
   * @returns Date object or null if invalid
   */
  decodeDate(value: string): Date | null {
    if (!value) {
      return null;
    }
    const date = new Date(value);
    return isNaN(date.getTime()) ? null : date;
  }
}
