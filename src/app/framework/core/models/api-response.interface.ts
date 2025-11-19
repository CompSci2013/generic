/**
 * Generic paginated API response interface
 * Works with any data type (TData) and optional statistics type (TStatistics)
 *
 * @template TData - The type of individual data items in the results array
 * @template TStatistics - Optional statistics object type
 *
 * @example
 * ```typescript
 * // For a simple list of items
 * interface Product { id: string; name: string; }
 * type ProductResponse = ApiResponse<Product>;
 *
 * // With statistics
 * interface ProductStats { totalValue: number; }
 * type ProductResponseWithStats = ApiResponse<Product, ProductStats>;
 * ```
 */
export interface ApiResponse<TData, TStatistics = void> {
  /** Total number of items across all pages */
  total: number;

  /** Current page number (1-indexed) */
  page: number;

  /** Number of items per page */
  size: number;

  /** Total number of pages */
  totalPages: number;

  /** Array of data items for the current page */
  results: TData[];

  /** Optional statistics object (type depends on domain configuration) */
  statistics?: TStatistics;
}

/**
 * Generic API error response interface
 * Provides consistent error handling across all API calls
 */
export interface ApiErrorResponse {
  /** HTTP status code */
  status: number;

  /** Error message */
  message: string;

  /** Optional error code for client-side handling */
  code?: string;

  /** Optional additional error details */
  details?: Record<string, any>;

  /** Timestamp of the error */
  timestamp: string;
}
