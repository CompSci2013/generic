import { DomainConfig } from '../../app/framework/core/models/domain-config';

// Models (types only)
import { AutoSearchFilters, AutoData, AutoStatistics } from './models';

// Adapters
import { AutoFilterUrlMapper } from './adapters/auto-filter-url-mapper';
import { AutoCacheKeyBuilder } from './adapters/auto-cache-key-builder';

// UI Configurations
import { AUTO_TABLE_COLUMNS } from './configs/auto-table-config';
import { AUTO_PICKER_CONFIGS } from './configs/auto-picker-config';
import { AUTO_FILTER_DEFINITIONS } from './configs/auto-filter-config';
import { AUTO_CHART_CONFIGS } from './configs/auto-chart-config';

/**
 * Complete Automobile Domain Configuration
 *
 * This configuration wires the generic framework to work with automobile data.
 * It demonstrates the three-layer architecture:
 * 1. Generic framework (domain-agnostic)
 * 2. Domain configuration (this file - automobile-specific)
 * 3. Application instance (wiring)
 *
 * To create a different domain (agriculture, real estate, etc.):
 * - Create similar models, adapters, and configs for that domain
 * - Create a new domain configuration file
 * - Provide it via DOMAIN_CONFIG injection token
 * - Framework code remains unchanged!
 */
export const AUTOMOBILE_DOMAIN_CONFIG: DomainConfig<AutoSearchFilters, AutoData, AutoStatistics> = {
  /**
   * Domain identification and metadata
   */
  domain: {
    name: 'automobile',
    label: 'Automobile Discovery',
    description: 'Explore and analyze vehicle data across manufacturers, models, and years',
    version: '1.0.0',
    icon: 'pi pi-car'
  },

  /**
   * API configuration
   */
  api: {
    baseUrl: 'http://autos.minilab/api/v1',
    endpoints: {
      search: '/vehicles/details',
      statistics: '/vehicles/statistics',
      detail: '/vehicles/:id/vins'
    },
    timeout: 30000
  },

  /**
   * Data model types
   * Note: TypeScript interfaces don't exist at runtime
   * These are placeholders for type checking only
   */
  models: {
    filterModel: {} as any,
    dataModel: {} as any,
    statisticsModel: {} as any
  },

  /**
   * Domain adapters
   * Note: apiAdapter must be injected via factory in AppModule
   */
  adapters: {
    apiAdapter: null as any, // Injected via factory in AppModule
    urlMapper: new AutoFilterUrlMapper() as any,
    cacheKeyBuilder: new AutoCacheKeyBuilder() as any
  },

  /**
   * UI configuration
   */
  ui: {
    tableColumns: AUTO_TABLE_COLUMNS,
    pickers: AUTO_PICKER_CONFIGS as any,
    filters: AUTO_FILTER_DEFINITIONS as any,
    charts: AUTO_CHART_CONFIGS as any,
    panels: [],
    defaultPageSize: 20,
    pageSizeOptions: [10, 20, 50, 100]
  },

  /**
   * Feature flags
   */
  features: {
    highlighting: true,
    popOuts: true,
    rowExpansion: true,
    columnManagement: true,
    statistics: true,
    export: false,
    urlState: true,
    localStoragePersistence: true
  }
};
