import { Type } from '@angular/core';
import { Observable } from 'rxjs';
import { TableColumn } from '../../components/base-data-table/models/table-column';
import { PickerConfig } from '../../components/base-picker/models/picker-config';
import { PanelConfig } from './panel-config';

/**
 * Generic Domain Configuration Schema
 *
 * Defines the contract that any domain must fulfill to use the framework.
 * Supports automobile, agriculture, real estate, medical devices, or any other domain.
 *
 * @template TFilters - The domain's filter model type
 * @template TData - The domain's main data entity type
 * @template TStatistics - The domain's statistics/aggregation type
 */
export interface DomainConfig<TFilters = any, TData = any, TStatistics = any> {
  /**
   * Domain information
   */
  domain: DomainInfo;

  /**
   * API configuration
   */
  api: ApiConfig;

  /**
   * Data model types (for type checking and validation)
   */
  models: DomainModels<TFilters, TData, TStatistics>;

  /**
   * Adapters - domain-specific implementations
   */
  adapters: DomainAdapters<TFilters, TData, TStatistics>;

  /**
   * UI configuration
   */
  ui: UiConfig<TData>;

  /**
   * Feature flags
   */
  features: FeatureFlags;

  /**
   * Optional custom configuration
   */
  custom?: Record<string, any>;
}

/**
 * Domain identification and metadata
 */
export interface DomainInfo {
  /**
   * Unique identifier for the domain (e.g., 'automobile', 'agriculture')
   */
  name: string;

  /**
   * Display label for the domain
   */
  label: string;

  /**
   * Domain description
   */
  description?: string;

  /**
   * Domain version
   */
  version?: string;

  /**
   * Domain icon (CSS class or URL)
   */
  icon?: string;
}

/**
 * API configuration
 */
export interface ApiConfig {
  /**
   * Base URL for API endpoints
   */
  baseUrl: string;

  /**
   * API endpoint definitions
   */
  endpoints: EndpointConfig;

  /**
   * API timeout in milliseconds
   * @default 30000
   */
  timeout?: number;

  /**
   * Whether to use credentials
   * @default false
   */
  withCredentials?: boolean;

  /**
   * Custom headers to include in all requests
   */
  headers?: Record<string, string>;
}

/**
 * Endpoint configuration
 */
export interface EndpointConfig {
  /**
   * Search/discovery endpoint
   */
  search: string;

  /**
   * Statistics/aggregation endpoint
   */
  statistics?: string;

  /**
   * Detail/single item endpoint (with :id placeholder)
   */
  detail?: string;

  /**
   * Custom endpoints
   */
  [key: string]: string | undefined;
}

/**
 * Domain model types
 */
export interface DomainModels<TFilters, TData, TStatistics> {
  /**
   * Filter model class/constructor
   */
  filterModel: Type<TFilters>;

  /**
   * Main data entity class/constructor
   */
  dataModel: Type<TData>;

  /**
   * Statistics model class/constructor
   */
  statisticsModel: Type<TStatistics>;
}

/**
 * Domain-specific adapter implementations
 */
export interface DomainAdapters<TFilters, TData, TStatistics> {
  /**
   * API adapter for data fetching and transformation
   */
  apiAdapter: IApiAdapter<TFilters, TData, TStatistics>;

  /**
   * URL mapper for encoding/decoding filters in URLs
   */
  urlMapper: IFilterUrlMapper<TFilters>;

  /**
   * Cache key builder for intelligent caching
   */
  cacheKeyBuilder: ICacheKeyBuilder<TFilters>;
}

/**
 * API Adapter Interface
 * Handles API communication and data transformation
 */
export interface IApiAdapter<TFilters, TData, TStatistics> {
  /**
   * Fetch data based on filters
   */
  fetchData(filters: TFilters): Observable<TData[]>;

  /**
   * Fetch statistics based on filters
   */
  fetchStatistics?(filters: TFilters): Observable<TStatistics>;

  /**
   * Fetch single item by ID
   */
  fetchDetail?(id: string | number): Observable<TData>;

  /**
   * Transform API response to domain model
   */
  transformResponse?(response: any): TData[];

  /**
   * Transform domain filters to API request params
   */
  transformFilters?(filters: TFilters): any;
}

/**
 * Filter URL Mapper Interface
 * Handles encoding/decoding filters to/from URL query params
 */
export interface IFilterUrlMapper<TFilters> {
  /**
   * Encode filters to URL query parameters
   */
  toUrlParams(filters: TFilters): Record<string, string>;

  /**
   * Decode URL query parameters to filters
   */
  fromUrlParams(params: Record<string, string>): TFilters;

  /**
   * Get default/empty filters
   */
  getDefaultFilters(): TFilters;
}

/**
 * Cache Key Builder Interface
 * Generates cache keys based on filter state
 */
export interface ICacheKeyBuilder<TFilters> {
  /**
   * Build cache key from filters
   */
  buildKey(filters: TFilters): string;

  /**
   * Check if filters are cacheable
   */
  isCacheable?(filters: TFilters): boolean;

  /**
   * Get cache expiration time in milliseconds
   */
  getCacheDuration?(): number;
}

/**
 * UI configuration
 */
export interface UiConfig<TData = any> {
  /**
   * Table column definitions
   */
  tableColumns: TableColumn<TData>[];

  /**
   * Filter picker configurations
   */
  pickers?: PickerConfig<any>[];

  /**
   * Filter definitions
   */
  filters?: FilterDefinition<any>[];

  /**
   * Chart configurations
   */
  charts?: ChartConfig[];

  /**
   * Panel configurations
   */
  panels?: PanelConfig[];

  /**
   * Default page size
   * @default 20
   */
  defaultPageSize?: number;

  /**
   * Available page sizes
   * @default [10, 20, 50, 100]
   */
  pageSizeOptions?: number[];
}

/**
 * Filter definition
 */
export interface FilterDefinition<T = any> {
  /**
   * Filter identifier
   */
  id: string;

  /**
   * Filter label
   */
  label: string;

  /**
   * Filter type
   */
  type: 'text' | 'number' | 'date' | 'select' | 'multiselect' | 'range' | 'custom';

  /**
   * Field in filter model
   */
  field: keyof T;

  /**
   * Options for select/multiselect
   */
  options?: FilterOption[];

  /**
   * Default value
   */
  defaultValue?: any;

  /**
   * Whether filter is required
   */
  required?: boolean;

  /**
   * Placeholder text
   */
  placeholder?: string;
}

/**
 * Filter option
 */
export interface FilterOption {
  label: string;
  value: any;
  icon?: string;
}

/**
 * Chart configuration
 */
export interface ChartConfig {
  /**
   * Chart identifier
   */
  id: string;

  /**
   * Chart title
   */
  title: string;

  /**
   * Chart type
   */
  type: 'bar' | 'line' | 'pie' | 'scatter' | 'histogram';

  /**
   * Data source (statistics field or custom)
   */
  dataSource: string;

  /**
   * Chart options
   */
  options?: any;
}

/**
 * Feature flags
 */
export interface FeatureFlags {
  /**
   * Enable data highlighting
   * @default false
   */
  highlighting?: boolean;

  /**
   * Enable pop-out windows
   * @default false
   */
  popOuts?: boolean;

  /**
   * Enable row expansion
   * @default false
   */
  rowExpansion?: boolean;

  /**
   * Enable column management
   * @default true
   */
  columnManagement?: boolean;

  /**
   * Enable statistics/charts
   * @default true
   */
  statistics?: boolean;

  /**
   * Enable export functionality
   * @default false
   */
  export?: boolean;

  /**
   * Enable URL state persistence
   * @default true
   */
  urlState?: boolean;

  /**
   * Enable local storage persistence
   * @default true
   */
  localStoragePersistence?: boolean;

  /**
   * Custom feature flags
   */
  [key: string]: boolean | undefined;
}

/**
 * Configuration validation result
 */
export interface ConfigValidationResult {
  /**
   * Whether configuration is valid
   */
  isValid: boolean;

  /**
   * Validation errors
   */
  errors: ConfigValidationError[];

  /**
   * Validation warnings
   */
  warnings: ConfigValidationWarning[];
}

/**
 * Configuration validation error
 */
export interface ConfigValidationError {
  /**
   * Error path (e.g., 'api.baseUrl')
   */
  path: string;

  /**
   * Error message
   */
  message: string;

  /**
   * Error severity
   */
  severity: 'error';
}

/**
 * Configuration validation warning
 */
export interface ConfigValidationWarning {
  /**
   * Warning path
   */
  path: string;

  /**
   * Warning message
   */
  message: string;

  /**
   * Warning severity
   */
  severity: 'warning';
}

/**
 * Configuration metadata
 */
export interface ConfigMetadata {
  /**
   * When the configuration was loaded
   */
  loadedAt: Date;

  /**
   * Configuration source
   */
  source: string;

  /**
   * Whether configuration is frozen (immutable)
   */
  frozen: boolean;
}
