/**
 * Generic API request configuration interface
 * Provides a structured way to configure HTTP requests
 *
 * @example
 * ```typescript
 * const request: ApiRequest = {
 *   endpoint: '/api/items',
 *   params: { page: 1, size: 20, filter: 'active' },
 *   method: 'GET'
 * };
 * ```
 */
export interface ApiRequest {
  /** API endpoint path (relative to base URL) */
  endpoint: string;

  /** Query parameters as key-value pairs */
  params?: Record<string, any>;

  /** HTTP method (defaults to GET) */
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

  /** Request body for POST/PUT/PATCH requests */
  body?: any;

  /** Custom headers for the request */
  headers?: Record<string, string>;

  /** Optional base URL override (defaults to environment apiUrl) */
  baseUrl?: string;
}

/**
 * Options for API request coordination
 * Used by RequestCoordinatorService to configure caching and retries
 */
export interface RequestOptions {
  /** Cache time-to-live in milliseconds */
  ttl?: number;

  /** Number of retry attempts on failure */
  retries?: number;

  /** Enable request deduplication (prevents parallel identical requests) */
  deduplication?: boolean;

  /** Skip cache and force a fresh request */
  skipCache?: boolean;
}
