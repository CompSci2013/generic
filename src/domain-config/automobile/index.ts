/**
 * Automobile Domain Configuration - Barrel Export
 *
 * This file exports all automobile domain assets:
 * - Models (AutoSearchFilters, AutoData, AutoStatistics)
 * - Adapters (AutoApiAdapter, AutoFilterUrlMapper, AutoCacheKeyBuilder)
 * - UI Configurations (table columns, pickers, filters, charts)
 * - Complete Domain Configuration (AUTOMOBILE_DOMAIN_CONFIG)
 *
 * The complete configuration can be provided to the framework via:
 * ```typescript
 * import { AUTOMOBILE_DOMAIN_CONFIG } from './domain-config/automobile';
 * import { DOMAIN_CONFIG } from './framework/core/services/config-loader.service';
 *
 * @NgModule({
 *   providers: [
 *     { provide: DOMAIN_CONFIG, useValue: AUTOMOBILE_DOMAIN_CONFIG }
 *   ]
 * })
 * ```
 */

// Models
export * from './models';

// Adapters
export * from './adapters';

// UI Configurations
export * from './configs';

// Complete Domain Configuration
export { AUTOMOBILE_DOMAIN_CONFIG } from './automobile-domain.config';
