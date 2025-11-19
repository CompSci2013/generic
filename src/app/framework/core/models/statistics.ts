/**
 * Generic Statistics Models and Interfaces
 * Domain-agnostic statistical analysis and aggregation types
 */

/**
 * Aggregation function types
 */
export type AggregateFunction = 'count' | 'sum' | 'avg' | 'min' | 'max';

/**
 * Result of aggregated data for a single group
 */
export interface AggregatedDataPoint {
  /**
   * The group key/label
   */
  groupKey: string | number;

  /**
   * The aggregated value
   */
  value: number;

  /**
   * Number of items in this group
   */
  count: number;

  /**
   * Additional metadata about the group
   */
  metadata?: Record<string, any>;
}

/**
 * Complete aggregation result
 */
export interface AggregationResult {
  /**
   * Array of aggregated data points
   */
  data: AggregatedDataPoint[];

  /**
   * Total count of items across all groups
   */
  totalCount: number;

  /**
   * Total value (sum) across all groups
   */
  totalValue: number;

  /**
   * The field that was used for grouping
   */
  groupByField: string;

  /**
   * The field that was used for aggregation (if applicable)
   */
  aggregateField?: string;

  /**
   * The aggregation function that was applied
   */
  aggregateFunction: AggregateFunction;
}

/**
 * Single bin in a histogram
 */
export interface HistogramBin {
  /**
   * Lower bound of the bin (inclusive)
   */
  min: number;

  /**
   * Upper bound of the bin (exclusive, except for last bin)
   */
  max: number;

  /**
   * Number of items in this bin
   */
  count: number;

  /**
   * Percentage of total items in this bin
   */
  percentage: number;

  /**
   * Bin label (e.g., "0-10", "10-20")
   */
  label: string;

  /**
   * Items that fall into this bin (optional, for drill-down)
   */
  items?: any[];
}

/**
 * Histogram data structure
 */
export interface HistogramData {
  /**
   * Array of histogram bins
   */
  bins: HistogramBin[];

  /**
   * Total count of items
   */
  totalCount: number;

  /**
   * Minimum value in dataset
   */
  min: number;

  /**
   * Maximum value in dataset
   */
  max: number;

  /**
   * Average value
   */
  average: number;

  /**
   * Median value
   */
  median: number;

  /**
   * The field that was used for histogram
   */
  field: string;
}

/**
 * Configuration for aggregation operations
 */
export interface AggregationConfig<TData = any> {
  /**
   * Field to group by
   */
  groupByField: keyof TData;

  /**
   * Field to aggregate (required for sum, avg, min, max)
   */
  aggregateField?: keyof TData;

  /**
   * Aggregation function to apply
   * @default 'count'
   */
  aggregateFunction?: AggregateFunction;

  /**
   * Optional filter to apply before aggregation
   */
  filter?: (item: TData) => boolean;

  /**
   * Sort direction for results
   * @default 'desc'
   */
  sortDirection?: 'asc' | 'desc';

  /**
   * Sort by field or value
   * @default 'value'
   */
  sortBy?: 'key' | 'value';

  /**
   * Limit the number of results
   */
  limit?: number;

  /**
   * Include additional metadata in results
   */
  includeMetadata?: boolean;
}

/**
 * Configuration for histogram generation
 */
export interface HistogramConfig<TData = any> {
  /**
   * Field to create histogram from
   */
  field: keyof TData;

  /**
   * Number of bins
   * @default 10
   */
  bins?: number;

  /**
   * Custom bin edges (overrides bins parameter)
   */
  binEdges?: number[];

  /**
   * Optional filter to apply before histogram
   */
  filter?: (item: TData) => boolean;

  /**
   * Include items in each bin (for drill-down)
   * @default false
   */
  includeItems?: boolean;

  /**
   * Minimum value (overrides calculated min)
   */
  minValue?: number;

  /**
   * Maximum value (overrides calculated max)
   */
  maxValue?: number;
}

/**
 * Chart data point for plotting libraries
 */
export interface ChartDataPoint {
  /**
   * X-axis value
   */
  x: string | number;

  /**
   * Y-axis value
   */
  y: number;

  /**
   * Optional label
   */
  label?: string;

  /**
   * Optional color
   */
  color?: string;

  /**
   * Additional metadata
   */
  metadata?: Record<string, any>;
}

/**
 * Chart dataset (for multi-series charts)
 */
export interface ChartDataset {
  /**
   * Dataset label/name
   */
  label: string;

  /**
   * Data points
   */
  data: ChartDataPoint[];

  /**
   * Dataset color
   */
  color?: string;

  /**
   * Chart type for this dataset
   */
  type?: 'bar' | 'line' | 'scatter' | 'pie';
}

/**
 * Complete chart data structure
 */
export interface ChartData {
  /**
   * Array of datasets
   */
  datasets: ChartDataset[];

  /**
   * Chart title
   */
  title?: string;

  /**
   * X-axis label
   */
  xAxisLabel?: string;

  /**
   * Y-axis label
   */
  yAxisLabel?: string;

  /**
   * Additional chart configuration
   */
  config?: Record<string, any>;
}

/**
 * Statistical summary of a numeric dataset
 */
export interface StatisticalSummary {
  /**
   * Number of items
   */
  count: number;

  /**
   * Sum of all values
   */
  sum: number;

  /**
   * Average value
   */
  average: number;

  /**
   * Minimum value
   */
  min: number;

  /**
   * Maximum value
   */
  max: number;

  /**
   * Median value
   */
  median: number;

  /**
   * Standard deviation
   */
  stdDev: number;

  /**
   * Variance
   */
  variance: number;
}
