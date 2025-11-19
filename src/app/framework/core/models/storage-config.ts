/**
 * Storage types supported by the persistence service
 */
export enum StorageType {
  LOCAL = 'local',
  SESSION = 'session',
}

/**
 * Configuration options for state persistence
 */
export interface StorageConfig {
  /**
   * Storage type to use
   * @default StorageType.LOCAL
   */
  type?: StorageType;

  /**
   * Prefix for storage keys
   * Helps avoid key collisions between different apps
   * @default 'app'
   */
  prefix?: string;

  /**
   * Whether to encrypt stored data
   * @default false
   */
  encrypt?: boolean;

  /**
   * Time-to-live in milliseconds (0 for no expiration)
   * @default 0
   */
  ttl?: number;

  /**
   * Whether to compress data before storage
   * @default false
   */
  compress?: boolean;
}

/**
 * Stored state wrapper with metadata
 */
export interface StoredState<TState> {
  /**
   * The actual state data
   */
  data: TState;

  /**
   * Timestamp when state was saved
   */
  timestamp: number;

  /**
   * Expiration timestamp (if TTL is set)
   */
  expiresAt?: number;

  /**
   * Version of the state structure (for migration)
   */
  version?: number;
}
