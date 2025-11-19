import { Injectable } from '@angular/core';
import {
  DomainConfig,
  ConfigValidationResult,
  ConfigValidationError,
  ConfigValidationWarning
} from '../models/domain-config';

/**
 * Configuration Validator Service
 *
 * Validates domain configurations to ensure they meet framework requirements.
 * Provides detailed error messages and warnings for misconfigured domains.
 *
 * @example
 * ```typescript
 * const result = configValidator.validate(domainConfig);
 * if (!result.isValid) {
 *   console.error('Invalid configuration:', result.errors);
 * }
 * ```
 */
@Injectable({
  providedIn: 'root'
})
export class ConfigValidatorService {
  constructor() {}

  /**
   * Validate a domain configuration
   *
   * @param config - Domain configuration to validate
   * @returns Validation result with errors and warnings
   */
  validate<TFilters, TData, TStatistics>(
    config: DomainConfig<TFilters, TData, TStatistics>
  ): ConfigValidationResult {
    const errors: ConfigValidationError[] = [];
    const warnings: ConfigValidationWarning[] = [];

    // Validate domain info
    this.validateDomainInfo(config, errors, warnings);

    // Validate API config
    this.validateApiConfig(config, errors, warnings);

    // Validate models
    this.validateModels(config, errors, warnings);

    // Validate adapters
    this.validateAdapters(config, errors, warnings);

    // Validate UI config
    this.validateUiConfig(config, errors, warnings);

    // Validate feature flags
    this.validateFeatureFlags(config, errors, warnings);

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate domain information
   */
  private validateDomainInfo(
    config: DomainConfig,
    errors: ConfigValidationError[],
    warnings: ConfigValidationWarning[]
  ): void {
    if (!config.domain) {
      errors.push({
        path: 'domain',
        message: 'Domain information is required',
        severity: 'error'
      });
      return;
    }

    if (!config.domain.name || typeof config.domain.name !== 'string') {
      errors.push({
        path: 'domain.name',
        message: 'Domain name is required and must be a string',
        severity: 'error'
      });
    } else if (!/^[a-z0-9-]+$/.test(config.domain.name)) {
      errors.push({
        path: 'domain.name',
        message: 'Domain name must be lowercase alphanumeric with hyphens only',
        severity: 'error'
      });
    }

    if (!config.domain.label || typeof config.domain.label !== 'string') {
      errors.push({
        path: 'domain.label',
        message: 'Domain label is required and must be a string',
        severity: 'error'
      });
    }

    if (!config.domain.description) {
      warnings.push({
        path: 'domain.description',
        message: 'Domain description is recommended for documentation',
        severity: 'warning'
      });
    }

    if (!config.domain.version) {
      warnings.push({
        path: 'domain.version',
        message: 'Domain version is recommended for tracking changes',
        severity: 'warning'
      });
    }
  }

  /**
   * Validate API configuration
   */
  private validateApiConfig(
    config: DomainConfig,
    errors: ConfigValidationError[],
    warnings: ConfigValidationWarning[]
  ): void {
    if (!config.api) {
      errors.push({
        path: 'api',
        message: 'API configuration is required',
        severity: 'error'
      });
      return;
    }

    if (!config.api.baseUrl || typeof config.api.baseUrl !== 'string') {
      errors.push({
        path: 'api.baseUrl',
        message: 'API base URL is required and must be a string',
        severity: 'error'
      });
    } else {
      try {
        new URL(config.api.baseUrl);
      } catch {
        errors.push({
          path: 'api.baseUrl',
          message: 'API base URL must be a valid URL',
          severity: 'error'
        });
      }
    }

    if (!config.api.endpoints) {
      errors.push({
        path: 'api.endpoints',
        message: 'API endpoints configuration is required',
        severity: 'error'
      });
      return;
    }

    if (!config.api.endpoints.search || typeof config.api.endpoints.search !== 'string') {
      errors.push({
        path: 'api.endpoints.search',
        message: 'Search endpoint is required and must be a string',
        severity: 'error'
      });
    }

    if (!config.api.endpoints.statistics) {
      warnings.push({
        path: 'api.endpoints.statistics',
        message: 'Statistics endpoint is recommended for analytics features',
        severity: 'warning'
      });
    }

    if (!config.api.endpoints.detail) {
      warnings.push({
        path: 'api.endpoints.detail',
        message: 'Detail endpoint is recommended for row expansion',
        severity: 'warning'
      });
    }

    if (config.api.timeout !== undefined && (typeof config.api.timeout !== 'number' || config.api.timeout <= 0)) {
      errors.push({
        path: 'api.timeout',
        message: 'API timeout must be a positive number',
        severity: 'error'
      });
    }
  }

  /**
   * Validate domain models
   */
  private validateModels(
    config: DomainConfig,
    errors: ConfigValidationError[],
    warnings: ConfigValidationWarning[]
  ): void {
    if (!config.models) {
      errors.push({
        path: 'models',
        message: 'Domain models configuration is required',
        severity: 'error'
      });
      return;
    }

    if (!config.models.filterModel) {
      errors.push({
        path: 'models.filterModel',
        message: 'Filter model is required',
        severity: 'error'
      });
    } else if (typeof config.models.filterModel !== 'function') {
      errors.push({
        path: 'models.filterModel',
        message: 'Filter model must be a constructor/class',
        severity: 'error'
      });
    }

    if (!config.models.dataModel) {
      errors.push({
        path: 'models.dataModel',
        message: 'Data model is required',
        severity: 'error'
      });
    } else if (typeof config.models.dataModel !== 'function') {
      errors.push({
        path: 'models.dataModel',
        message: 'Data model must be a constructor/class',
        severity: 'error'
      });
    }

    if (!config.models.statisticsModel) {
      warnings.push({
        path: 'models.statisticsModel',
        message: 'Statistics model is recommended for analytics features',
        severity: 'warning'
      });
    } else if (typeof config.models.statisticsModel !== 'function') {
      errors.push({
        path: 'models.statisticsModel',
        message: 'Statistics model must be a constructor/class',
        severity: 'error'
      });
    }
  }

  /**
   * Validate domain adapters
   */
  private validateAdapters(
    config: DomainConfig,
    errors: ConfigValidationError[],
    warnings: ConfigValidationWarning[]
  ): void {
    if (!config.adapters) {
      errors.push({
        path: 'adapters',
        message: 'Domain adapters configuration is required',
        severity: 'error'
      });
      return;
    }

    // Validate API adapter
    if (!config.adapters.apiAdapter) {
      errors.push({
        path: 'adapters.apiAdapter',
        message: 'API adapter is required',
        severity: 'error'
      });
    } else {
      if (typeof config.adapters.apiAdapter.fetchData !== 'function') {
        errors.push({
          path: 'adapters.apiAdapter.fetchData',
          message: 'API adapter must have fetchData method',
          severity: 'error'
        });
      }

      if (config.adapters.apiAdapter.fetchStatistics && typeof config.adapters.apiAdapter.fetchStatistics !== 'function') {
        errors.push({
          path: 'adapters.apiAdapter.fetchStatistics',
          message: 'fetchStatistics must be a function if provided',
          severity: 'error'
        });
      }

      if (config.adapters.apiAdapter.fetchDetail && typeof config.adapters.apiAdapter.fetchDetail !== 'function') {
        errors.push({
          path: 'adapters.apiAdapter.fetchDetail',
          message: 'fetchDetail must be a function if provided',
          severity: 'error'
        });
      }
    }

    // Validate URL mapper
    if (!config.adapters.urlMapper) {
      errors.push({
        path: 'adapters.urlMapper',
        message: 'URL mapper is required',
        severity: 'error'
      });
    } else {
      if (typeof config.adapters.urlMapper.toUrlParams !== 'function') {
        errors.push({
          path: 'adapters.urlMapper.toUrlParams',
          message: 'URL mapper must have toUrlParams method',
          severity: 'error'
        });
      }

      if (typeof config.adapters.urlMapper.fromUrlParams !== 'function') {
        errors.push({
          path: 'adapters.urlMapper.fromUrlParams',
          message: 'URL mapper must have fromUrlParams method',
          severity: 'error'
        });
      }

      if (typeof config.adapters.urlMapper.getDefaultFilters !== 'function') {
        errors.push({
          path: 'adapters.urlMapper.getDefaultFilters',
          message: 'URL mapper must have getDefaultFilters method',
          severity: 'error'
        });
      }
    }

    // Validate cache key builder
    if (!config.adapters.cacheKeyBuilder) {
      warnings.push({
        path: 'adapters.cacheKeyBuilder',
        message: 'Cache key builder is recommended for performance',
        severity: 'warning'
      });
    } else {
      if (typeof config.adapters.cacheKeyBuilder.buildKey !== 'function') {
        errors.push({
          path: 'adapters.cacheKeyBuilder.buildKey',
          message: 'Cache key builder must have buildKey method',
          severity: 'error'
        });
      }
    }
  }

  /**
   * Validate UI configuration
   */
  private validateUiConfig(
    config: DomainConfig,
    errors: ConfigValidationError[],
    warnings: ConfigValidationWarning[]
  ): void {
    if (!config.ui) {
      errors.push({
        path: 'ui',
        message: 'UI configuration is required',
        severity: 'error'
      });
      return;
    }

    if (!config.ui.tableColumns || !Array.isArray(config.ui.tableColumns)) {
      errors.push({
        path: 'ui.tableColumns',
        message: 'Table columns must be an array',
        severity: 'error'
      });
    } else if (config.ui.tableColumns.length === 0) {
      errors.push({
        path: 'ui.tableColumns',
        message: 'At least one table column is required',
        severity: 'error'
      });
    } else {
      // Validate each column
      config.ui.tableColumns.forEach((column, index) => {
        if (!column.field) {
          errors.push({
            path: `ui.tableColumns[${index}].field`,
            message: 'Column field is required',
            severity: 'error'
          });
        }

        if (!column.header) {
          errors.push({
            path: `ui.tableColumns[${index}].header`,
            message: 'Column header is required',
            severity: 'error'
          });
        }
      });
    }

    if (config.ui.pickers && !Array.isArray(config.ui.pickers)) {
      errors.push({
        path: 'ui.pickers',
        message: 'Pickers must be an array if provided',
        severity: 'error'
      });
    }

    if (config.ui.filters && !Array.isArray(config.ui.filters)) {
      errors.push({
        path: 'ui.filters',
        message: 'Filters must be an array if provided',
        severity: 'error'
      });
    }

    if (config.ui.charts && !Array.isArray(config.ui.charts)) {
      errors.push({
        path: 'ui.charts',
        message: 'Charts must be an array if provided',
        severity: 'error'
      });
    }

    if (config.ui.panels && !Array.isArray(config.ui.panels)) {
      errors.push({
        path: 'ui.panels',
        message: 'Panels must be an array if provided',
        severity: 'error'
      });
    }

    if (config.ui.defaultPageSize !== undefined) {
      if (typeof config.ui.defaultPageSize !== 'number' || config.ui.defaultPageSize <= 0) {
        errors.push({
          path: 'ui.defaultPageSize',
          message: 'Default page size must be a positive number',
          severity: 'error'
        });
      }
    }

    if (config.ui.pageSizeOptions !== undefined) {
      if (!Array.isArray(config.ui.pageSizeOptions) || config.ui.pageSizeOptions.length === 0) {
        errors.push({
          path: 'ui.pageSizeOptions',
          message: 'Page size options must be a non-empty array',
          severity: 'error'
        });
      }
    }
  }

  /**
   * Validate feature flags
   */
  private validateFeatureFlags(
    config: DomainConfig,
    errors: ConfigValidationError[],
    warnings: ConfigValidationWarning[]
  ): void {
    if (!config.features) {
      warnings.push({
        path: 'features',
        message: 'Feature flags configuration is recommended',
        severity: 'warning'
      });
      return;
    }

    // Check for common feature flags
    const commonFlags = [
      'highlighting',
      'popOuts',
      'rowExpansion',
      'columnManagement',
      'statistics',
      'export',
      'urlState',
      'localStoragePersistence'
    ];

    for (const flag of commonFlags) {
      if ((config.features as any)[flag] !== undefined && typeof (config.features as any)[flag] !== 'boolean') {
        errors.push({
          path: `features.${flag}`,
          message: `Feature flag '${flag}' must be a boolean`,
          severity: 'error'
        });
      }
    }
  }

  /**
   * Validate configuration and throw on error
   * Useful for initialization
   */
  validateOrThrow<TFilters, TData, TStatistics>(
    config: DomainConfig<TFilters, TData, TStatistics>
  ): void {
    const result = this.validate(config);

    if (!result.isValid) {
      const errorMessages = result.errors.map(e => `${e.path}: ${e.message}`).join('\n');
      throw new Error(`Invalid domain configuration:\n${errorMessages}`);
    }
  }

  /**
   * Get configuration summary
   */
  getSummary<TFilters, TData, TStatistics>(
    config: DomainConfig<TFilters, TData, TStatistics>
  ): string {
    const lines: string[] = [];

    lines.push(`Domain: ${config.domain?.name || 'Unknown'} (${config.domain?.label || 'N/A'})`);
    lines.push(`API Base URL: ${config.api?.baseUrl || 'Not configured'}`);
    lines.push(`Table Columns: ${config.ui?.tableColumns?.length || 0}`);
    lines.push(`Pickers: ${config.ui?.pickers?.length || 0}`);
    lines.push(`Filters: ${config.ui?.filters?.length || 0}`);
    lines.push(`Charts: ${config.ui?.charts?.length || 0}`);
    lines.push(`Panels: ${config.ui?.panels?.length || 0}`);

    const enabledFeatures = Object.entries(config.features || {})
      .filter(([_, value]) => value === true)
      .map(([key]) => key);

    lines.push(`Enabled Features: ${enabledFeatures.length > 0 ? enabledFeatures.join(', ') : 'None'}`);

    return lines.join('\n');
  }
}
