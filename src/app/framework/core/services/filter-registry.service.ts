import { Injectable } from '@angular/core';
import { FilterDefinition } from '../models/filter-definition';

/**
 * Generic service for registering and managing filter definitions.
 *
 * This service provides a centralized registry for all filters in the application.
 * Domain-specific configurations can register their filters at startup, and
 * components can retrieve them as needed.
 *
 * @template TFilters - The type representing all filter values in the application
 *
 * @example
 * ```typescript
 * // Register filters at application startup
 * const filterRegistry = inject(FilterRegistryService);
 *
 * filterRegistry.register({
 *   id: 'category',
 *   label: 'Category',
 *   type: 'multi-select',
 *   options: [...]
 * });
 *
 * // Retrieve a filter later
 * const categoryFilter = filterRegistry.getFilter('category');
 * ```
 */
@Injectable({
  providedIn: 'root'
})
export class FilterRegistryService<TFilters = any> {
  /**
   * Internal map storing filter definitions by their ID.
   */
  private filters = new Map<string, FilterDefinition<any>>();

  /**
   * Registers a filter definition in the registry.
   *
   * @param filter - The filter definition to register
   * @throws Error if a filter with the same ID already exists
   */
  register(filter: FilterDefinition<any>): void {
    if (this.filters.has(filter.id)) {
      console.warn(`Filter with id '${filter.id}' is already registered. Overwriting.`);
    }
    this.filters.set(filter.id, filter);
  }

  /**
   * Registers multiple filter definitions at once.
   *
   * @param filters - Array of filter definitions to register
   */
  registerAll(filters: FilterDefinition<any>[]): void {
    filters.forEach(filter => this.register(filter));
  }

  /**
   * Retrieves a filter definition by its ID.
   *
   * @param id - The filter ID to look up
   * @returns The filter definition, or undefined if not found
   */
  getFilter(id: string): FilterDefinition<any> | undefined {
    return this.filters.get(id);
  }

  /**
   * Retrieves all registered filter definitions.
   *
   * @returns Array of all filter definitions
   */
  getAllFilters(): FilterDefinition<any>[] {
    return Array.from(this.filters.values());
  }

  /**
   * Checks if a filter with the given ID exists in the registry.
   *
   * @param id - The filter ID to check
   * @returns True if the filter exists, false otherwise
   */
  hasFilter(id: string): boolean {
    return this.filters.has(id);
  }

  /**
   * Removes a filter definition from the registry.
   *
   * @param id - The filter ID to remove
   * @returns True if the filter was removed, false if it didn't exist
   */
  unregister(id: string): boolean {
    return this.filters.delete(id);
  }

  /**
   * Clears all registered filters from the registry.
   */
  clear(): void {
    this.filters.clear();
  }

  /**
   * Gets the total number of registered filters.
   *
   * @returns The count of registered filters
   */
  getCount(): number {
    return this.filters.size;
  }
}
