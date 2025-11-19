import { Params } from '@angular/router';

/**
 * Filter URL Mapper Interface
 * Domain-agnostic interface for converting between filters and URL parameters
 *
 * Implementations of this interface handle the bidirectional conversion between
 * typed filter objects and URL query parameter representations.
 *
 * @template TFilters - The shape of the filter object
 *
 * @example
 * ```typescript
 * interface ProductFilters {
 *   category: string;
 *   minPrice: number;
 *   maxPrice: number;
 *   page: number;
 * }
 *
 * class ProductFilterUrlMapper implements IFilterUrlMapper<ProductFilters> {
 *   filtersToParams(filters: ProductFilters): Params {
 *     return {
 *       category: filters.category,
 *       minPrice: filters.minPrice.toString(),
 *       maxPrice: filters.maxPrice.toString(),
 *       page: filters.page.toString()
 *     };
 *   }
 *
 *   paramsToFilters(params: Params): ProductFilters {
 *     return {
 *       category: params['category'] || '',
 *       minPrice: parseInt(params['minPrice']) || 0,
 *       maxPrice: parseInt(params['maxPrice']) || 1000,
 *       page: parseInt(params['page']) || 1
 *     };
 *   }
 * }
 * ```
 */
export interface IFilterUrlMapper<TFilters> {
  /**
   * Convert typed filters to URL query parameters
   *
   * @param filters - Typed filter object
   * @returns URL query parameters as key-value pairs
   */
  filtersToParams(filters: TFilters): Params;

  /**
   * Convert URL query parameters to typed filters
   *
   * @param params - URL query parameters
   * @returns Typed filter object with defaults for missing values
   */
  paramsToFilters(params: Params): TFilters;
}
