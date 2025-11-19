import { Injectable } from '@angular/core';
import { AutoSearchFilters, DEFAULT_AUTO_FILTERS } from '../models';

/**
 * Maps automobile filters to/from URL query parameters.
 *
 * This implements the URL-first paradigm: URL is the source of truth.
 * Filters are derived from URL, and filter changes update the URL.
 *
 * URL Parameter Mapping (short names to keep URLs concise):
 * - mfr: manufacturers (comma-separated)
 * - mdl: models (comma-separated)
 * - yMin/yMax: year range (numeric)
 * - bc: bodyClass (comma-separated)
 * - ds: dataSource (comma-separated)
 * - vins: VIN list (comma-separated)
 * - p: page (numeric)
 * - sz: size (numeric)
 * - sort: sortField (string)
 * - dir: sortOrder ('asc' | 'desc')
 *
 * NOTE: This is domain-specific configuration code.
 */
@Injectable({
  providedIn: 'root'
})
export class AutoFilterUrlMapper {
  /**
   * Converts filters to URL query parameters.
   *
   * Only includes non-default values to keep URLs clean and shareable.
   *
   * @param filters - Search filter parameters
   * @returns Record of URL query parameters
   */
  filtersToParams(filters: AutoSearchFilters): Record<string, any> {
    const params: Record<string, any> = {};

    // Add array parameters (only if not empty)
    if (filters.manufacturers?.length) {
      params['mfr'] = filters.manufacturers.join(',');
    }
    if (filters.models?.length) {
      params['mdl'] = filters.models.join(',');
    }
    if (filters.bodyClass?.length) {
      params['bc'] = filters.bodyClass.join(',');
    }
    if (filters.dataSource?.length) {
      params['ds'] = filters.dataSource.join(',');
    }
    if (filters.vins?.length) {
      params['vins'] = filters.vins.join(',');
    }

    // Add numeric parameters (only if defined)
    if (filters.yearMin !== undefined) {
      params['yMin'] = filters.yearMin.toString();
    }
    if (filters.yearMax !== undefined) {
      params['yMax'] = filters.yearMax.toString();
    }

    // Always include pagination (required for consistent behavior)
    params['p'] = filters.page.toString();
    params['sz'] = filters.size.toString();

    // Add sort parameters (only if non-default)
    if (filters.sortField && filters.sortField !== DEFAULT_AUTO_FILTERS.sortField) {
      params['sort'] = filters.sortField;
    }
    if (filters.sortOrder && filters.sortOrder !== DEFAULT_AUTO_FILTERS.sortOrder) {
      params['dir'] = filters.sortOrder;
    }

    return params;
  }

  /**
   * Converts URL query parameters to filters.
   *
   * Returns a partial filter object. The caller should merge this with
   * DEFAULT_AUTO_FILTERS to get a complete filter set.
   *
   * @param params - URL query parameters
   * @returns Partial filter object derived from URL
   */
  paramsToFilters(params: Record<string, any>): Partial<AutoSearchFilters> {
    const filters: Partial<AutoSearchFilters> = {};

    // Parse array parameters (split by comma, filter empty strings)
    if (params['mfr']) {
      filters.manufacturers = this.parseArrayParam(params['mfr']);
    }
    if (params['mdl']) {
      filters.models = this.parseArrayParam(params['mdl']);
    }
    if (params['bc']) {
      filters.bodyClass = this.parseArrayParam(params['bc']);
    }
    if (params['ds']) {
      filters.dataSource = this.parseArrayParam(params['ds']);
    }
    if (params['vins']) {
      filters.vins = this.parseArrayParam(params['vins']);
    }

    // Parse numeric parameters
    if (params['yMin']) {
      const parsed = parseInt(params['yMin'], 10);
      if (!isNaN(parsed)) {
        filters.yearMin = parsed;
      }
    }
    if (params['yMax']) {
      const parsed = parseInt(params['yMax'], 10);
      if (!isNaN(parsed)) {
        filters.yearMax = parsed;
      }
    }
    if (params['p']) {
      const parsed = parseInt(params['p'], 10);
      if (!isNaN(parsed) && parsed > 0) {
        filters.page = parsed;
      }
    }
    if (params['sz']) {
      const parsed = parseInt(params['sz'], 10);
      if (!isNaN(parsed) && parsed > 0) {
        filters.size = parsed;
      }
    }

    // Parse sort parameters
    if (params['sort']) {
      filters.sortField = params['sort'];
    }
    if (params['dir'] && (params['dir'] === 'asc' || params['dir'] === 'desc')) {
      filters.sortOrder = params['dir'] as 'asc' | 'desc';
    }

    return filters;
  }

  /**
   * Parses a comma-separated string into an array.
   * Filters out empty strings.
   *
   * @param value - Comma-separated string
   * @returns Array of non-empty strings
   */
  private parseArrayParam(value: string): string[] {
    return value.split(',').filter((v: string) => v.trim().length > 0);
  }
}
