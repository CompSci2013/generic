import { Injectable } from '@angular/core';
import { AutoSearchFilters } from '../models';

/**
 * Builds cache keys for automobile API requests.
 *
 * Cache keys must be:
 * - Unique for each distinct filter combination
 * - Consistent for identical filter sets (regardless of order)
 * - Human-readable for debugging
 *
 * NOTE: This is domain-specific configuration code.
 */
@Injectable({
  providedIn: 'root'
})
export class AutoCacheKeyBuilder {
  /**
   * Generates a unique cache key from filters.
   *
   * The key includes all filter parameters in a deterministic order.
   * Array values are sorted to ensure consistent keys regardless of input order.
   *
   * @param filters - Search filter parameters
   * @returns Deterministic cache key string
   */
  buildKey(filters: AutoSearchFilters): string {
    const parts = [
      'auto',
      this.formatArrayPart(filters.manufacturers, 'mfr'),
      this.formatArrayPart(filters.models, 'mdl'),
      this.formatRangePart(filters.yearMin, filters.yearMax, 'yr'),
      this.formatArrayPart(filters.bodyClass, 'bc'),
      this.formatArrayPart(filters.dataSource, 'ds'),
      this.formatArrayPart(filters.vins, 'vins'),
      `p${filters.page}`,
      `sz${filters.size}`,
      filters.sortField || 'default',
      filters.sortOrder || 'asc'
    ];

    return parts.join('|');
  }

  /**
   * Formats an array parameter for cache key.
   * Sorts values to ensure consistency.
   *
   * @param values - Array of values or undefined
   * @param defaultLabel - Label to use when array is empty
   * @returns Formatted string for cache key
   */
  private formatArrayPart(values: string[] | undefined, defaultLabel: string): string {
    if (!values || values.length === 0) {
      return `all-${defaultLabel}`;
    }
    return values.slice().sort().join(',');
  }

  /**
   * Formats a range parameter for cache key.
   *
   * @param min - Minimum value or undefined
   * @param max - Maximum value or undefined
   * @param prefix - Prefix for the range
   * @returns Formatted string for cache key
   */
  private formatRangePart(min: number | undefined, max: number | undefined, prefix: string): string {
    if (min === undefined && max === undefined) {
      return `${prefix}-any`;
    }
    const minStr = min !== undefined ? min.toString() : 'min';
    const maxStr = max !== undefined ? max.toString() : 'max';
    return `${prefix}-${minStr}-${maxStr}`;
  }
}
