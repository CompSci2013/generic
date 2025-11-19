import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { DOMAIN_CONFIG } from '../../framework/core/services/config-loader.service';
import { DomainConfig } from '../../framework/core/models/domain-config';
import { TableColumn } from '../../framework/components/base-data-table/models/table-column';
import { SortEvent, PageEvent } from '../../framework/components/base-data-table/models/table-event';

/**
 * Generic Discover Component
 *
 * **DOMAIN-AGNOSTIC** - Works with any domain configuration!
 *
 * This component demonstrates the A2 milestone: Feature components that inject
 * DOMAIN_CONFIG instead of hardcoding domain-specific types.
 *
 * Key changes from automobile-specific version:
 * - Injects DOMAIN_CONFIG instead of importing AutoApiAdapter, etc.
 * - Uses generic types TFilters, TData, TStatistics
 * - Gets columns, adapters from injected configuration
 * - Would work with agriculture, real estate, etc. with zero code changes!
 *
 * @template TFilters - Domain filter type (injected from config)
 * @template TData - Domain data type (injected from config)
 * @template TStatistics - Domain statistics type (injected from config)
 */
@Component({
  selector: 'app-discover',
  templateUrl: './discover.component.html',
  styleUrls: ['./discover.component.scss']
})
export class DiscoverComponent<TFilters = any, TData = any, TStatistics = any> implements OnInit, OnDestroy {
  // Table configuration from INJECTED domain config
  columns: TableColumn<TData>[] = [];

  // Domain label from injected config
  domainLabel = '';

  // Current data state
  data: TData[] = [];
  totalRecords = 0;
  loading = false;

  // Current filter state (derived from URL)
  filters: TFilters = {} as TFilters;

  // Page size from config
  pageSize = 20;

  // Cleanup
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    @Inject(DOMAIN_CONFIG) private domainConfig: DomainConfig<TFilters, TData, TStatistics>
  ) {
    // Initialize from domain configuration
    this.columns = this.domainConfig.ui.tableColumns as TableColumn<TData>[];
    this.domainLabel = this.domainConfig.domain.label;
    this.pageSize = this.domainConfig.ui.defaultPageSize || 20;
  }

  ngOnInit(): void {
    // Subscribe to URL changes (URL-first paradigm)
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        this.onUrlChange(params);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Handle URL parameter changes
   * URL is the source of truth - derive filters and fetch data
   */
  private onUrlChange(params: any): void {
    // Use URL mapper from domain config
    const urlMapper = this.domainConfig.adapters.urlMapper;

    // Convert URL params to filters (domain-specific logic via adapter)
    const urlFilters = (urlMapper as any).paramsToFilters ?
      (urlMapper as any).paramsToFilters(params) :
      (urlMapper as any).fromUrlParams(params);

    // Merge with defaults
    this.filters = {
      ...(urlFilters as TFilters)
    };

    // Fetch data based on new filters
    this.fetchData();
  }

  /**
   * Fetch data from API using domain-specific adapter
   */
  private fetchData(): void {
    this.loading = true;

    // Use API adapter from domain config
    const apiAdapter = this.domainConfig.adapters.apiAdapter;

    apiAdapter.fetchData(this.filters)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          // Handle both array and paginated responses
          if (Array.isArray(response)) {
            this.data = response;
            this.totalRecords = response.length;
          } else {
            this.data = response.data || response.results || [];
            this.totalRecords = response.total || this.data.length;
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error fetching data:', error);
          this.loading = false;
          this.data = [];
          this.totalRecords = 0;
        }
      });
  }

  /**
   * Handle sort change from table
   * Updates URL with new sort parameters
   */
  onSort(event: SortEvent): void {
    const updatedFilters: any = {
      ...this.filters,
      sortField: event.field as string,
      sortOrder: event.order === 1 ? 'asc' : 'desc',
      page: 1 // Reset to first page on sort
    };

    this.updateUrl(updatedFilters);
  }

  /**
   * Handle page change from table
   * Updates URL with new pagination parameters
   */
  onPageChange(event: PageEvent): void {
    const updatedFilters: any = {
      ...this.filters,
      page: (event.first / event.rows) + 1, // Convert 0-based to 1-based
      size: event.rows
    };

    this.updateUrl(updatedFilters);
  }

  /**
   * Update URL with new filters
   * This triggers the URL change handler which fetches new data
   */
  private updateUrl(filters: TFilters): void {
    // Use URL mapper from domain config
    const urlMapper = this.domainConfig.adapters.urlMapper;

    const params = (urlMapper as any).filtersToParams ?
      (urlMapper as any).filtersToParams(filters) :
      (urlMapper as any).toUrlParams(filters);

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: params,
      queryParamsHandling: 'merge'
    });
  }

  /**
   * Get current page index for PrimeNG table (0-based)
   */
  get currentPage(): number {
    const filters = this.filters as any;
    const page = filters.page || 1;
    const size = filters.size || this.pageSize;
    return (page - 1) * size;
  }
}
