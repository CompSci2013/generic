import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AutoApiAdapter } from '../../../domain-config/automobile/adapters/auto-api-adapter';
import { AutoFilterUrlMapper } from '../../../domain-config/automobile/adapters/auto-filter-url-mapper';
import { AutoSearchFilters, AutoData, DEFAULT_AUTO_FILTERS } from '../../../domain-config/automobile/models';
import { AUTO_TABLE_COLUMNS } from '../../../domain-config/automobile/configs/auto-table-config';
import { TableColumn } from '../../framework/components/base-data-table/models/table-column';
import { SortEvent, PageEvent } from '../../framework/components/base-data-table/models/table-event';

/**
 * Discover Component - Main feature for searching and browsing automobile data
 *
 * This component demonstrates the three-layer architecture:
 * 1. Uses generic framework components (base-data-table)
 * 2. Configured with domain-specific configs (AUTO_TABLE_COLUMNS)
 * 3. Integrates with domain adapters (AutoApiAdapter, AutoFilterUrlMapper)
 *
 * Features:
 * - URL-first state management (URL is source of truth)
 * - Server-side pagination and sorting
 * - Reactive data fetching
 * - Type-safe throughout
 */
@Component({
  selector: 'app-discover',
  templateUrl: './discover.component.html',
  styleUrls: ['./discover.component.scss']
})
export class DiscoverComponent implements OnInit, OnDestroy {
  // Table configuration from domain config
  columns: TableColumn<AutoData>[] = AUTO_TABLE_COLUMNS;

  // Current data state
  data: AutoData[] = [];
  totalRecords = 0;
  loading = false;

  // Current filter state (derived from URL)
  filters: AutoSearchFilters = { ...DEFAULT_AUTO_FILTERS };

  // Cleanup
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiAdapter: AutoApiAdapter,
    private urlMapper: AutoFilterUrlMapper
  ) {}

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
    // Convert URL params to filters
    const urlFilters = this.urlMapper.paramsToFilters(params);

    // Merge with defaults to ensure all required fields
    this.filters = {
      ...DEFAULT_AUTO_FILTERS,
      ...urlFilters
    };

    // Fetch data based on new filters
    this.fetchData();
  }

  /**
   * Fetch automobile data from API
   */
  private fetchData(): void {
    this.loading = true;

    this.apiAdapter.fetchData(this.filters)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.data = response.data;
          this.totalRecords = response.total;
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
    const updatedFilters: AutoSearchFilters = {
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
    const updatedFilters: AutoSearchFilters = {
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
  private updateUrl(filters: AutoSearchFilters): void {
    const params = this.urlMapper.filtersToParams(filters);

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
    return (this.filters.page - 1) * this.filters.size;
  }
}
