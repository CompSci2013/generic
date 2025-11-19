/**
 * Represents the type of filter UI component to render.
 */
export type FilterType =
  | 'multi-select'
  | 'range'
  | 'date-range'
  | 'search'
  | 'boolean'
  | 'single-select';

/**
 * Represents a single option in a filter dropdown or list.
 */
export interface FilterOption {
  /** Display label for the option */
  label: string;
  /** Underlying value for the option */
  value: any;
  /** Optional count of items matching this option (for faceted search) */
  count?: number;
}

/**
 * Generic interface defining a filter's structure and behavior.
 *
 * @template TFilterValue - The type of value this filter produces (e.g., string[], number, Date)
 *
 * @example
 * ```typescript
 * // Multi-select filter for categories
 * const categoryFilter: FilterDefinition<string[]> = {
 *   id: 'categories',
 *   label: 'Category',
 *   type: 'multi-select',
 *   options: [
 *     { label: 'Electronics', value: 'electronics' },
 *     { label: 'Clothing', value: 'clothing' }
 *   ]
 * };
 *
 * // Range filter for prices
 * const priceFilter: FilterDefinition<{ min: number | null; max: number | null }> = {
 *   id: 'price',
 *   label: 'Price Range',
 *   type: 'range',
 *   defaultValue: { min: 0, max: 1000 }
 * };
 * ```
 */
export interface FilterDefinition<TFilterValue> {
  /** Unique identifier for this filter */
  id: string;

  /** Human-readable label displayed in the UI */
  label: string;

  /** Type of filter component to render */
  type: FilterType;

  /** Default value when the filter is first initialized */
  defaultValue?: TFilterValue;

  /** Options for select-based filters (multi-select, single-select) */
  options?: FilterOption[];

  /** Optional validation function to check if a value is valid */
  validation?: (value: TFilterValue) => boolean;

  /** Optional formatter to convert the value to a display string (e.g., for filter chips) */
  formatter?: (value: TFilterValue) => string;
}

/**
 * Represents a range value with min and max bounds.
 * Used by range-filter component.
 */
export interface RangeValue {
  min: number | null;
  max: number | null;
}

/**
 * Represents a date range value with start and end dates.
 * Used by date-range-filter component.
 */
export interface DateRangeValue {
  start: Date | null;
  end: Date | null;
}
