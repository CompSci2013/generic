import { Injectable, InjectionToken } from '@angular/core';
import { DomainConfig, ConfigMetadata } from '../models/domain-config';
import { ConfigValidatorService } from './config-validator.service';

/**
 * Injection token for domain configuration
 * Use this to provide the domain configuration to the application
 */
export const DOMAIN_CONFIG = new InjectionToken<DomainConfig<any, any, any>>('DOMAIN_CONFIG');

/**
 * Configuration Loader Service
 *
 * Provides type-safe loading and management of domain configurations.
 * Validates configurations on load and provides metadata tracking.
 *
 * @example
 * ```typescript
 * // In app.module.ts
 * @NgModule({
 *   providers: [
 *     { provide: DOMAIN_CONFIG, useValue: AUTOMOBILE_DOMAIN_CONFIG }
 *   ]
 * })
 * export class AppModule {}
 *
 * // In a component
 * constructor(@Inject(DOMAIN_CONFIG) private config: DomainConfig<...>) {}
 * ```
 */
@Injectable({
  providedIn: 'root'
})
export class ConfigLoaderService {
  /**
   * Current loaded configuration
   */
  private currentConfig?: DomainConfig<any, any, any>;

  /**
   * Configuration metadata
   */
  private metadata?: ConfigMetadata;

  constructor(private validator: ConfigValidatorService) {}

  /**
   * Load and validate a domain configuration
   *
   * @param config - Domain configuration to load
   * @param validateOnly - If true, only validates without loading
   * @returns The loaded configuration
   * @throws Error if configuration is invalid
   */
  load<TFilters, TData, TStatistics>(
    config: DomainConfig<TFilters, TData, TStatistics>,
    validateOnly = false
  ): DomainConfig<TFilters, TData, TStatistics> {
    // Validate configuration
    this.validator.validateOrThrow(config);

    if (!validateOnly) {
      // Store configuration
      this.currentConfig = config;

      // Create metadata
      this.metadata = {
        loadedAt: new Date(),
        source: config.domain.name,
        frozen: false
      };

      // Freeze configuration to prevent modifications
      this.freezeConfig(config);
    }

    return config;
  }

  /**
   * Get the currently loaded configuration
   *
   * @throws Error if no configuration is loaded
   */
  getCurrent<TFilters, TData, TStatistics>(): DomainConfig<TFilters, TData, TStatistics> {
    if (!this.currentConfig) {
      throw new Error('No domain configuration loaded');
    }
    return this.currentConfig as DomainConfig<TFilters, TData, TStatistics>;
  }

  /**
   * Get configuration metadata
   */
  getMetadata(): ConfigMetadata | undefined {
    return this.metadata;
  }

  /**
   * Check if a configuration is loaded
   */
  isLoaded(): boolean {
    return this.currentConfig !== undefined;
  }

  /**
   * Get configuration summary
   */
  getSummary(): string {
    if (!this.currentConfig) {
      return 'No configuration loaded';
    }
    return this.validator.getSummary(this.currentConfig);
  }

  /**
   * Reload configuration
   * Useful for development/hot-reload scenarios
   */
  reload<TFilters, TData, TStatistics>(
    config: DomainConfig<TFilters, TData, TStatistics>
  ): DomainConfig<TFilters, TData, TStatistics> {
    console.warn('Reloading domain configuration');
    return this.load(config);
  }

  /**
   * Freeze configuration to prevent modifications
   * @private
   */
  private freezeConfig(config: DomainConfig<any, any, any>): void {
    // Deep freeze the configuration object
    Object.freeze(config);
    Object.freeze(config.domain);
    Object.freeze(config.api);
    Object.freeze(config.api.endpoints);
    Object.freeze(config.models);
    Object.freeze(config.adapters);
    Object.freeze(config.ui);
    Object.freeze(config.features);

    if (config.ui.tableColumns) {
      Object.freeze(config.ui.tableColumns);
      config.ui.tableColumns.forEach(col => Object.freeze(col));
    }

    if (config.ui.pickers) {
      Object.freeze(config.ui.pickers);
      config.ui.pickers.forEach(picker => Object.freeze(picker));
    }

    if (config.ui.filters) {
      Object.freeze(config.ui.filters);
      config.ui.filters.forEach(filter => Object.freeze(filter));
    }

    if (config.ui.charts) {
      Object.freeze(config.ui.charts);
      config.ui.charts.forEach(chart => Object.freeze(chart));
    }

    if (config.ui.panels) {
      Object.freeze(config.ui.panels);
      config.ui.panels.forEach(panel => Object.freeze(panel));
    }

    if (this.metadata) {
      this.metadata.frozen = true;
    }
  }

  /**
   * Validate a configuration without loading it
   */
  validate<TFilters, TData, TStatistics>(
    config: DomainConfig<TFilters, TData, TStatistics>
  ) {
    return this.validator.validate(config);
  }
}

/**
 * Helper function to create a validated domain configuration
 * Use this in domain configuration files to ensure type safety
 */
export function createDomainConfig<TFilters, TData, TStatistics>(
  config: DomainConfig<TFilters, TData, TStatistics>
): DomainConfig<TFilters, TData, TStatistics> {
  // Validate at creation time (development)
  const validator = new ConfigValidatorService();
  const result = validator.validate(config);

  if (!result.isValid) {
    const errors = result.errors.map(e => `  - ${e.path}: ${e.message}`).join('\n');
    throw new Error(`Invalid domain configuration:\n${errors}`);
  }

  if (result.warnings.length > 0) {
    const warnings = result.warnings.map(w => `  - ${w.path}: ${w.message}`).join('\n');
    console.warn(`Domain configuration warnings:\n${warnings}`);
  }

  return config;
}
