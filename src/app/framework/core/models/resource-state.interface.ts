/**
 * Resource State Interface
 * Domain-agnostic application state for resource management
 *
 * This interface defines the complete reactive state managed by ResourceManagementService.
 * All properties are immutable and updates create new state objects.
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
 * type ProductState = ResourceState<ProductFilters, Product, ProductStatistics>;
 * ```
 */
export interface ResourceState<TFilters, TData, TStatistics = void> {
  /** Current filter values */
  filters: TFilters;

  /** Array of data results for current filters */
  results: TData[];

  /** Loading indicator */
  loading: boolean;

  /** Error message if fetch failed, null otherwise */
  error: string | null;

  /** Total number of results across all pages */
  totalResults: number;

  /** Optional statistics computed from filtered data */
  statistics?: TStatistics;

  /** Optional pagination information */
  pagination?: {
    page: number;
    size: number;
    totalPages: number;
  };
}
