import { Injectable } from '@angular/core';
import { PickerConfig } from '../../components/base-picker/models/picker-config';

/**
 * Registry service for managing picker configurations
 * Allows centralized registration and retrieval of picker configurations
 *
 * This enables applications to:
 * - Register picker configs at startup
 * - Retrieve configs by ID
 * - Share picker configs across components
 * - Maintain consistency in picker behavior
 *
 * @example
 * ```typescript
 * // In app initialization
 * registry.register({
 *   id: 'country-picker',
 *   label: 'Country',
 *   displayField: 'name',
 *   valueField: 'code',
 *   multiSelect: false,
 *   apiEndpoint: '/api/countries'
 * });
 *
 * // In components
 * const config = registry.get<Country>('country-picker');
 * ```
 */
@Injectable({
  providedIn: 'root',
})
export class PickerConfigRegistryService {
  /**
   * Internal storage for picker configurations
   */
  private configs = new Map<string, PickerConfig<any>>();

  constructor() {}

  /**
   * Register a picker configuration
   *
   * @param config - The picker configuration to register
   * @throws Error if a config with the same ID already exists
   */
  register<TItem>(config: PickerConfig<TItem>): void {
    if (this.configs.has(config.id)) {
      console.warn(
        `Picker config with ID "${config.id}" already exists. Overwriting.`
      );
    }
    this.configs.set(config.id, config);
  }

  /**
   * Register multiple picker configurations at once
   *
   * @param configs - Array of picker configurations to register
   */
  registerMany(configs: PickerConfig<any>[]): void {
    configs.forEach((config) => this.register(config));
  }

  /**
   * Get a picker configuration by ID
   *
   * @template TItem - The type of items in the picker
   * @param id - The unique ID of the picker configuration
   * @returns The picker configuration, or undefined if not found
   */
  get<TItem>(id: string): PickerConfig<TItem> | undefined {
    return this.configs.get(id) as PickerConfig<TItem> | undefined;
  }

  /**
   * Get a picker configuration by ID (throws if not found)
   *
   * @template TItem - The type of items in the picker
   * @param id - The unique ID of the picker configuration
   * @returns The picker configuration
   * @throws Error if configuration not found
   */
  getOrThrow<TItem>(id: string): PickerConfig<TItem> {
    const config = this.get<TItem>(id);
    if (!config) {
      throw new Error(`Picker configuration with ID "${id}" not found`);
    }
    return config;
  }

  /**
   * Check if a picker configuration exists
   *
   * @param id - The unique ID to check
   * @returns True if the configuration exists
   */
  has(id: string): boolean {
    return this.configs.has(id);
  }

  /**
   * Unregister a picker configuration
   *
   * @param id - The unique ID of the configuration to remove
   * @returns True if the configuration was removed
   */
  unregister(id: string): boolean {
    return this.configs.delete(id);
  }

  /**
   * Get all registered picker IDs
   *
   * @returns Array of all registered picker IDs
   */
  getAllIds(): string[] {
    return Array.from(this.configs.keys());
  }

  /**
   * Get all registered picker configurations
   *
   * @returns Array of all picker configurations
   */
  getAll(): PickerConfig<any>[] {
    return Array.from(this.configs.values());
  }

  /**
   * Clear all registered configurations
   * Useful for testing or hot-reloading scenarios
   */
  clear(): void {
    this.configs.clear();
  }

  /**
   * Get the number of registered configurations
   *
   * @returns Count of registered picker configurations
   */
  count(): number {
    return this.configs.size;
  }
}
