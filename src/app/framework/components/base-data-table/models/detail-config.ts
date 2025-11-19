import { Observable } from 'rxjs';
import { TemplateRef } from '@angular/core';
import { TableColumn } from './table-column';

/**
 * Configuration for row detail expansion and lazy loading
 *
 * This is a generic, domain-agnostic interface that defines how detail data
 * should be loaded and displayed when a row is expanded.
 *
 * @template TParent - The type of the parent/main table data
 * @template TDetail - The type of the detail/child data
 *
 * @example
 * ```typescript
 * // Vehicle → VIN instances example
 * interface Vehicle {
 *   id: string;
 *   manufacturer: string;
 *   model: string;
 * }
 *
 * interface VinInstance {
 *   vin: string;
 *   condition: string;
 *   mileage: number;
 * }
 *
 * const detailConfig: DetailConfig<Vehicle, VinInstance> = {
 *   loadDetails: (vehicle) => vinService.getVinsByVehicleId(vehicle.id),
 *   detailColumns: [
 *     { field: 'vin', header: 'VIN', sortable: false },
 *     { field: 'condition', header: 'Condition', sortable: false },
 *     { field: 'mileage', header: 'Mileage', sortable: false }
 *   ],
 *   cacheDetails: true,
 *   displayMode: 'nested-table'
 * };
 * ```
 */
export interface DetailConfig<TParent, TDetail> {
  /**
   * Function to load detail data for a specific parent row
   * Called when row is expanded (if not cached)
   *
   * @param parent - The parent row data
   * @returns Observable of detail items
   */
  loadDetails: (parent: TParent) => Observable<TDetail[]>;

  /**
   * Column definitions for detail table (when using nested-table mode)
   */
  detailColumns?: TableColumn<TDetail>[];

  /**
   * Custom template for rendering detail content
   * Alternative to using detailColumns + nested table
   */
  detailTemplate?: TemplateRef<any>;

  /**
   * How to display the detail data
   * - 'nested-table': Display as a table using detailColumns
   * - 'custom': Use detailTemplate
   * @default 'nested-table'
   */
  displayMode?: 'nested-table' | 'custom';

  /**
   * Whether to cache loaded detail data to avoid re-fetching
   * @default true
   */
  cacheDetails?: boolean;

  /**
   * Function to get unique identifier from parent row
   * Used for caching. If not provided, uses table's dataKey
   */
  getParentId?: (parent: TParent) => string | number;

  /**
   * Function to get unique identifier from detail row
   * Used for nested table's dataKey
   */
  getDetailId?: (detail: TDetail) => string | number;

  /**
   * Placeholder message while loading details
   * @default 'Loading...'
   */
  loadingMessage?: string;

  /**
   * Message to show when no detail records found
   * @default 'No details available'
   */
  emptyMessage?: string;

  /**
   * Maximum height for detail section (enables scrolling)
   */
  scrollHeight?: string;

  /**
   * CSS class to apply to detail container
   */
  styleClass?: string;

  /**
   * CSS class to apply to nested detail table
   */
  detailTableClass?: string;

  /**
   * Whether to show grid lines in nested table
   * @default true
   */
  showGridlines?: boolean;

  /**
   * Whether to stripe rows in nested table
   * @default false
   */
  stripedRows?: boolean;

  /**
   * Whether to enable row hover in nested table
   * @default true
   */
  rowHover?: boolean;

  /**
   * Number of rows to display in nested table pagination
   * If not set, pagination is disabled in detail table
   */
  detailRows?: number;

  /**
   * Available page size options for detail table
   */
  detailRowsPerPageOptions?: number[];

  /**
   * Whether detail table should be paginated
   * @default false
   */
  detailPaginator?: boolean;

  /**
   * Callback when detail load fails
   */
  onLoadError?: (parent: TParent, error: any) => void;

  /**
   * Callback when detail load succeeds
   */
  onLoadSuccess?: (parent: TParent, details: TDetail[]) => void;
}

/**
 * Internal state for tracking detail data
 */
export interface DetailState<TDetail> {
  /**
   * The loaded detail items
   */
  items: TDetail[];

  /**
   * Whether currently loading
   */
  loading: boolean;

  /**
   * Error if load failed
   */
  error?: any;

  /**
   * Timestamp of when loaded (for cache invalidation)
   */
  loadedAt?: Date;
}
