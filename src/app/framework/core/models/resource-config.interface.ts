import { IFilterUrlMapper } from '../interfaces/filter-url-mapper.interface';
import { IApiAdapter } from '../interfaces/api-adapter.interface';
import { ICacheKeyBuilder } from '../interfaces/cache-key-builder.interface';

/**
 * Resource Management Configuration
 * Domain-agnostic configuration for ResourceManagementService
 *
 * This configuration object is injected into ResourceManagementService to provide
 * all domain-specific adapters and default values.
 *
 * @template TFilters - The shape of the filter object
 * @template TData - The type of individual data items
 * @template TStatistics - The type of statistics object (optional)
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
 * interface Product {
 *   id: string;
 *   name: string;
 *   price: number;
 * }
 *
 * interface ProductStatistics {
 *   averagePrice: number;
 *   totalProducts: number;
 * }
 *
 * const productConfig: ResourceManagementConfig<ProductFilters, Product, ProductStatistics> = {
 *   filterMapper: new ProductFilterUrlMapper(),
 *   apiAdapter: new ProductApiAdapter(apiService),
 *   cacheKeyBuilder: new ProductCacheKeyBuilder(),
 *   defaultFilters: {
 *     category: '',
 *     minPrice: 0,
 *     maxPrice: 1000,
 *     page: 1
 *   }
 * };
 * ```
 */
export interface ResourceManagementConfig<TFilters, TData, TStatistics = void> {
  /**
   * Filter URL mapper for bidirectional filter ↔ URL conversion
   */
  filterMapper: IFilterUrlMapper<TFilters>;

  /**
   * API adapter for fetching data from backend
   */
  apiAdapter: IApiAdapter<TFilters, TData, TStatistics>;

  /**
   * Cache key builder for request deduplication
   */
  cacheKeyBuilder: ICacheKeyBuilder<TFilters>;

  /**
   * Default filter values used on initialization and reset
   */
  defaultFilters: TFilters;

  /**
   * Auto-fetch data on initialization (default: true)
   * If false, data must be fetched manually via fetchData()
   */
  autoFetchOnInit?: boolean;
}
