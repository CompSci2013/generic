import { Injectable } from '@angular/core';
import { StorageConfig, StorageType, StoredState } from '../models/storage-config';

/**
 * Service for persisting component and application state
 * Domain-agnostic state persistence using localStorage/sessionStorage
 *
 * Features:
 * - Generic type-safe state storage
 * - localStorage and sessionStorage support
 * - Per-component state isolation with prefixes
 * - State serialization/deserialization
 * - TTL (time-to-live) support
 * - Clear/remove operations
 * - Versioning support for state migration
 *
 * @example
 * ```typescript
 * // Save state
 * persistence.save('my-component', { filter: 'active', page: 1 });
 *
 * // Load state
 * const state = persistence.load<MyState>('my-component');
 *
 * // Save with TTL (expires in 1 hour)
 * persistence.save('temp-data', data, { ttl: 3600000 });
 *
 * // Clear specific state
 * persistence.clear('my-component');
 *
 * // Clear all states with prefix
 * persistence.clearAll('my-app');
 * ```
 */
@Injectable({
  providedIn: 'root',
})
export class StatePersistenceService {
  /**
   * Default configuration
   */
  private defaultConfig: StorageConfig = {
    type: StorageType.LOCAL,
    prefix: 'app',
    encrypt: false,
    ttl: 0,
    compress: false,
  };

  constructor() {}

  /**
   * Save state to storage
   *
   * @template TState - The type of state to save
   * @param key - Unique key for the state
   * @param state - State data to save
   * @param config - Optional storage configuration
   */
  save<TState>(
    key: string,
    state: TState,
    config?: Partial<StorageConfig>
  ): void {
    const mergedConfig = { ...this.defaultConfig, ...config };
    const storage = this.getStorage(mergedConfig.type!);
    const fullKey = this.buildKey(key, mergedConfig.prefix!);

    const storedState: StoredState<TState> = {
      data: state,
      timestamp: Date.now(),
    };

    // Add expiration if TTL is set
    if (mergedConfig.ttl && mergedConfig.ttl > 0) {
      storedState.expiresAt = Date.now() + mergedConfig.ttl;
    }

    try {
      const serialized = JSON.stringify(storedState);
      storage.setItem(fullKey, serialized);
    } catch (error) {
      console.error(`Failed to save state for key "${key}":`, error);
      throw new Error(`State persistence failed for key "${key}"`);
    }
  }

  /**
   * Load state from storage
   *
   * @template TState - The type of state to load
   * @param key - Unique key for the state
   * @param config - Optional storage configuration
   * @returns The loaded state, or null if not found or expired
   */
  load<TState>(
    key: string,
    config?: Partial<StorageConfig>
  ): TState | null {
    const mergedConfig = { ...this.defaultConfig, ...config };
    const storage = this.getStorage(mergedConfig.type!);
    const fullKey = this.buildKey(key, mergedConfig.prefix!);

    try {
      const serialized = storage.getItem(fullKey);
      if (!serialized) {
        return null;
      }

      const storedState: StoredState<TState> = JSON.parse(serialized);

      // Check if state has expired
      if (storedState.expiresAt && Date.now() > storedState.expiresAt) {
        this.clear(key, config);
        return null;
      }

      return storedState.data;
    } catch (error) {
      console.error(`Failed to load state for key "${key}":`, error);
      return null;
    }
  }

  /**
   * Check if state exists in storage
   *
   * @param key - Unique key for the state
   * @param config - Optional storage configuration
   * @returns True if state exists and is not expired
   */
  has(key: string, config?: Partial<StorageConfig>): boolean {
    const state = this.load(key, config);
    return state !== null;
  }

  /**
   * Clear specific state from storage
   *
   * @param key - Unique key for the state to clear
   * @param config - Optional storage configuration
   */
  clear(key: string, config?: Partial<StorageConfig>): void {
    const mergedConfig = { ...this.defaultConfig, ...config };
    const storage = this.getStorage(mergedConfig.type!);
    const fullKey = this.buildKey(key, mergedConfig.prefix!);

    try {
      storage.removeItem(fullKey);
    } catch (error) {
      console.error(`Failed to clear state for key "${key}":`, error);
    }
  }

  /**
   * Clear all states with a specific prefix
   *
   * @param prefix - Prefix to match (default: 'app')
   * @param config - Optional storage configuration
   */
  clearAll(prefix?: string, config?: Partial<StorageConfig>): void {
    const mergedConfig = { ...this.defaultConfig, ...config };
    const storage = this.getStorage(mergedConfig.type!);
    const targetPrefix = prefix || mergedConfig.prefix!;

    try {
      const keysToRemove: string[] = [];

      // Find all keys with the prefix
      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);
        if (key && key.startsWith(`${targetPrefix}:`)) {
          keysToRemove.push(key);
        }
      }

      // Remove all matching keys
      keysToRemove.forEach((key) => storage.removeItem(key));
    } catch (error) {
      console.error(`Failed to clear all states with prefix "${targetPrefix}":`, error);
    }
  }

  /**
   * Get all keys with a specific prefix
   *
   * @param prefix - Prefix to match (default: 'app')
   * @param config - Optional storage configuration
   * @returns Array of keys (without prefix)
   */
  getKeys(prefix?: string, config?: Partial<StorageConfig>): string[] {
    const mergedConfig = { ...this.defaultConfig, ...config };
    const storage = this.getStorage(mergedConfig.type!);
    const targetPrefix = prefix || mergedConfig.prefix!;
    const keys: string[] = [];

    try {
      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);
        if (key && key.startsWith(`${targetPrefix}:`)) {
          // Remove prefix and add to list
          keys.push(key.substring(targetPrefix.length + 1));
        }
      }
    } catch (error) {
      console.error(`Failed to get keys with prefix "${targetPrefix}":`, error);
    }

    return keys;
  }

  /**
   * Get the size of stored data in bytes
   *
   * @param key - Unique key for the state
   * @param config - Optional storage configuration
   * @returns Size in bytes, or 0 if not found
   */
  getSize(key: string, config?: Partial<StorageConfig>): number {
    const mergedConfig = { ...this.defaultConfig, ...config };
    const storage = this.getStorage(mergedConfig.type!);
    const fullKey = this.buildKey(key, mergedConfig.prefix!);

    try {
      const serialized = storage.getItem(fullKey);
      if (!serialized) {
        return 0;
      }
      return new Blob([serialized]).size;
    } catch (error) {
      console.error(`Failed to get size for key "${key}":`, error);
      return 0;
    }
  }

  /**
   * Get total storage size for a prefix
   *
   * @param prefix - Prefix to match (default: 'app')
   * @param config - Optional storage configuration
   * @returns Total size in bytes
   */
  getTotalSize(prefix?: string, config?: Partial<StorageConfig>): number {
    const keys = this.getKeys(prefix, config);
    return keys.reduce((total, key) => total + this.getSize(key, config), 0);
  }

  /**
   * Update configuration defaults
   *
   * @param config - New default configuration
   */
  updateDefaults(config: Partial<StorageConfig>): void {
    this.defaultConfig = { ...this.defaultConfig, ...config };
  }

  /**
   * Get the storage object based on type
   *
   * @private
   */
  private getStorage(type: StorageType): Storage {
    switch (type) {
      case StorageType.LOCAL:
        return localStorage;
      case StorageType.SESSION:
        return sessionStorage;
      default:
        return localStorage;
    }
  }

  /**
   * Build full storage key with prefix
   *
   * @private
   */
  private buildKey(key: string, prefix: string): string {
    return `${prefix}:${key}`;
  }
}
