import { Observable } from 'rxjs';
import { ApiResponse } from '../models';

/**
 * API Adapter Interface
 * Domain-agnostic interface for fetching data from backend APIs
 *
 * Implementations of this interface abstract away domain-specific API details
 * and provide a consistent interface for the ResourceManagementService.
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
 *   categoryBreakdown: Record<string, number>;
 * }
 *
 * class ProductApiAdapter implements IApiAdapter<ProductFilters, Product, ProductStatistics> {
 *   constructor(private apiService: ApiService) {}
 *
 *   fetchData(filters: ProductFilters): Observable<ApiResponse<Product, ProductStatistics>> {
 *     return this.apiService.get<Product, ProductStatistics>('/api/products', {
 *       category: filters.category,
 *       minPrice: filters.minPrice,
 *       maxPrice: filters.maxPrice
 *     });
 *   }
 * }
 * ```
 */
export interface IApiAdapter<TFilters, TData, TStatistics = void> {
  /**
   * Fetch main resource data based on filters
   *
   * This method should call the appropriate API endpoint(s) and return
   * a paginated response with results and optional statistics.
   *
   * @param filters - Domain-specific filters
   * @returns Observable of ApiResponse with results and metadata
   */
  fetchData(filters: TFilters): Observable<ApiResponse<TData, TStatistics>>;

  /**
   * Fetch related resource data (optional)
   * Used for populating pickers, dropdowns, or related entity lists
   *
   * @param page - Page number (1-indexed)
   * @param size - Page size
   * @returns Observable of related data response
   */
  fetchRelatedData?(page: number, size: number): Observable<any>;

  /**
   * Fetch instances of a specific resource (optional)
   * Used for detail views or drill-down functionality
   *
   * @param resourceId - Unique identifier of the resource
   * @param count - Number of instances to fetch
   * @returns Observable of instances response
   */
  fetchInstances?(resourceId: string, count: number): Observable<any>;
}
