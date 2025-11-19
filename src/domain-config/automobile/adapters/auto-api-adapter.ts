import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from '../../../app/framework/core/services';
import { AutoSearchFilters, AutoData, AutoStatistics, AutoDataResponse, VinInstance } from '../models';

/**
 * API adapter for automobile domain.
 * Implements the contract between the generic framework and the automobile API.
 *
 * This adapter:
 * - Maps domain models to API endpoints
 * - Transforms filters into API request parameters
 * - Provides type-safe API calls for automobile data
 *
 * NOTE: This is domain-specific configuration code, so domain-specific
 * naming (manufacturer, vin, bodyClass) is correct and intentional.
 */
@Injectable({
  providedIn: 'root'
})
export class AutoApiAdapter {
  private baseUrl = 'http://autos.minilab/api/v1';

  constructor(private api: ApiService) {}

  /**
   * Fetches automobile data based on filters.
   *
   * @param filters - Search filter parameters
   * @returns Observable of paginated automobile data response
   */
  fetchData(filters: AutoSearchFilters): Observable<AutoDataResponse> {
    const endpoint = `${this.baseUrl}/vehicles/details`;
    return this.api.get<any>(endpoint, this.prepareParams(filters)).pipe(
      map(response => ({
        data: response.results.map((item: any) => ({
          id: item.vehicle_id,
          manufacturer: item.manufacturer,
          model: item.model,
          year: item.year,
          bodyClass: item.body_class,
          vinCount: item.instance_count,
          dataSource: item.data_source
        })),
        total: response.total,
        page: response.page,
        size: response.size,
        hasMore: response.page < response.totalPages
      }))
    );
  }

  /**
   * Fetches statistics for the current filter set.
   *
   * @param filters - Search filter parameters
   * @returns Observable of statistical distributions
   */
  fetchStatistics(filters: AutoSearchFilters): Observable<AutoStatistics> {
    const endpoint = `${this.baseUrl}/vehicles/statistics`;
    return this.api.get<AutoStatistics>(endpoint, this.prepareParams(filters)).pipe(
      map(response => response.statistics || response.results[0])
    );
  }

  /**
   * Fetches VIN instances for a specific vehicle group.
   *
   * @param vehicleId - Unique identifier for the vehicle group
   * @returns Observable of VIN instances
   */
  fetchVinInstances(vehicleId: string): Observable<VinInstance[]> {
    const endpoint = `${this.baseUrl}/vehicles/${vehicleId}/vins`;
    return this.api.get<VinInstance>(endpoint).pipe(
      map(response => response.results)
    );
  }

  /**
   * Prepares API parameters from filters.
   *
   * Note: This is internal API format, separate from URL params (handled by D3).
   * Only includes non-empty/non-default values to keep API requests clean.
   *
   * @param filters - Search filter parameters
   * @returns Record of API request parameters
   */
  private prepareParams(filters: AutoSearchFilters): Record<string, any> {
    const params: Record<string, any> = {};

    // Add filter parameters (only if defined and not empty)
    if (filters.manufacturers?.length) {
      params['manufacturers'] = filters.manufacturers;
    }
    if (filters.models?.length) {
      params['models'] = filters.models;
    }
    if (filters.yearMin !== undefined) {
      params['yearMin'] = filters.yearMin;
    }
    if (filters.yearMax !== undefined) {
      params['yearMax'] = filters.yearMax;
    }
    if (filters.bodyClass?.length) {
      params['bodyClass'] = filters.bodyClass;
    }
    if (filters.dataSource?.length) {
      params['dataSource'] = filters.dataSource;
    }
    if (filters.vins?.length) {
      params['vins'] = filters.vins;
    }

    // Always include pagination parameters
    params['page'] = filters.page;
    params['size'] = filters.size;

    // Add sort parameters if defined
    if (filters.sortField) {
      params['sortField'] = filters.sortField;
    }
    if (filters.sortOrder) {
      params['sortOrder'] = filters.sortOrder;
    }

    return params;
  }
}
