/**
 * Configuration options for request coordination
 */
export interface RequestConfig {
  /**
   * Cache duration in milliseconds (0 = no cache)
   * @default 0
   */
  cacheTime?: number;

  /**
   * Enable request deduplication to prevent parallel identical requests
   * @default true
   */
  deduplication?: boolean;

  /**
   * Number of retry attempts on failure
   * @default 2
   */
  retryAttempts?: number;

  /**
   * Initial retry delay in milliseconds (uses exponential backoff)
   * @default 1000
   */
  retryDelay?: number;
}
