/**
 * Distribution data for statistical charts.
 *
 * Represents a single bucket in a distribution (e.g., one manufacturer's count).
 */
export interface DistributionData {
  /** Category label (e.g., manufacturer name, year, body class) */
  label: string;

  /** Count of items in this category */
  count: number;

  /** Percentage of total (0-100) */
  percentage?: number;
}

/**
 * Automobile statistics model.
 *
 * NOTE: Domain-specific naming is allowed in the domain-config layer.
 * This represents statistical distributions for automobile data.
 */
export interface AutoStatistics {
  /** Distribution by manufacturer */
  manufacturerDistribution: DistributionData[];

  /** Distribution by model */
  modelDistribution: DistributionData[];

  /** Distribution by year */
  yearDistribution: DistributionData[];

  /** Distribution by body class */
  bodyClassDistribution: DistributionData[];

  /** Distribution by data source (optional) */
  dataSourceDistribution?: DistributionData[];

  /** Total vehicle count */
  totalCount: number;

  /** Total VIN instances */
  totalVins: number;

  /** Date range of data (optional) */
  dateRange?: {
    from: Date;
    to: Date;
  };
}

/**
 * Statistics summary for quick overview.
 */
export interface AutoStatisticsSummary {
  /** Number of unique manufacturers */
  uniqueManufacturers: number;

  /** Number of unique models */
  uniqueModels: number;

  /** Year range (min-max) */
  yearRange: {
    min: number;
    max: number;
  };

  /** Most common body class */
  mostCommonBodyClass: string;

  /** Total records */
  totalRecords: number;
}
