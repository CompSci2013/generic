/**
 * Cache Key Builder Interface
 * Domain-agnostic interface for building unique cache keys for request deduplication
 *
 * Implementations of this interface convert filter objects into unique string keys
 * that can be used for caching API responses and deduplicating identical requests.
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
 * class ProductCacheKeyBuilder implements ICacheKeyBuilder<ProductFilters> {
 *   buildKey(filters: ProductFilters): string {
 *     // Create deterministic key from filters
 *     const parts = [
 *       filters.category,
 *       filters.minPrice.toString(),
 *       filters.maxPrice.toString(),
 *       filters.page.toString()
 *     ];
 *     return `products:${parts.join(':')}`;
 *   }
 * }
 *
 * // Usage
 * const builder = new ProductCacheKeyBuilder();
 * const key = builder.buildKey({ category: 'electronics', minPrice: 0, maxPrice: 1000, page: 1 });
 * // Result: 'products:electronics:0:1000:1'
 * ```
 */
export interface ICacheKeyBuilder<TFilters> {
  /**
   * Build a unique cache key from filters
   *
   * The key should be deterministic - the same filters should always produce
   * the same key. This enables effective caching and request deduplication.
   *
   * @param filters - Domain filters
   * @returns Unique cache key string
   */
  buildKey(filters: TFilters): string;
}
