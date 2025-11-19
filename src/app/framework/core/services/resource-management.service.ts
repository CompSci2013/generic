import { Injectable, OnDestroy, Inject, Optional } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { BehaviorSubject, Subject, Observable, throwError } from 'rxjs';
import {
  map,
  distinctUntilChanged,
  takeUntil,
  take,
  filter,
  tap,
  catchError,
} from 'rxjs/operators';
import { UrlStateService } from './url-state.service';
import {
  ResourceState,
  ResourceManagementConfig,
  ApiResponse,
} from '../models';

/**
 * Generic Resource Management Service
 * The heart of the framework - orchestrates URL → Filters → API → Data flow
 *
 * This service implements the URL-first paradigm and provides complete state management
 * for any domain through pluggable adapters.
 *
 * **IMPORTANT**: This is a base class NOT meant to be injected directly via Angular DI.
 * Domain-specific services should extend this class and add @Injectable() decorator.
 * The config parameter is NOT injected - it's passed manually in the super() call.
 *
 * @template TFilters - Domain-specific filter type
 * @template TData - Domain-specific data/result type
 * @template TStatistics - Optional statistics type
 *
 * Key Features:
 * - URL as single source of truth (URL-first paradigm)
 * - Pluggable API adapters (domain-agnostic)
 * - Pluggable filter mappers (domain-agnostic)
 * - Reactive state management (RxJS)
 * - Automatic URL synchronization
 * - Error handling and loading states
 *
 * @example
 * ```typescript
 * // Product domain - extend this base class
 * @Injectable({ providedIn: 'root' })
 * export class ProductService extends ResourceManagementService<ProductFilters, Product, ProductStats> {
 *   constructor(
 *     urlState: UrlStateService,
 *     router: Router,
 *     route: ActivatedRoute
 *   ) {
 *     super(urlState, router, route, {
 *       filterMapper: new ProductFilterMapper(),
 *       apiAdapter: new ProductApiAdapter(),
 *       cacheKeyBuilder: new ProductCacheKeyBuilder(),
 *       defaultFilters: { category: '', page: 1, size: 20 }
 *     });
 *   }
 * }
 *
 * // Subscribe to state
 * productService.data$.subscribe(products => console.log(products));
 * productService.statistics$.subscribe(stats => console.log(stats));
 *
 * // Update filters (automatically syncs to URL and fetches data)
 * productService.updateFilters({ category: 'electronics' });
 * ```
 */
@Injectable()
export class ResourceManagementService<TFilters, TData, TStatistics = void>
  implements OnDestroy
{
  private destroy$ = new Subject<void>();

  // ========== PRIVATE STATE ==========
  private stateSubject: BehaviorSubject<
    ResourceState<TFilters, TData, TStatistics>
  >;

  // ========== PUBLIC OBSERVABLES ==========
  /** Complete state observable */
  public state$: Observable<ResourceState<TFilters, TData, TStatistics>>;

  /** Current filters */
  public filters$: Observable<TFilters>;

  /** Data results */
  public data$: Observable<TData[]>;

  /** Loading indicator */
  public loading$: Observable<boolean>;

  /** Error message */
  public error$: Observable<string | null>;

  /** Total results count */
  public totalResults$: Observable<number>;

  /** Optional statistics */
  public statistics$: Observable<TStatistics | undefined>;

  private config: ResourceManagementConfig<TFilters, TData, TStatistics>;

  constructor(
    private urlState: UrlStateService,
    private router: Router,
    private route: ActivatedRoute,
    @Optional() @Inject('RESOURCE_CONFIG') config?: ResourceManagementConfig<TFilters, TData, TStatistics>
  ) {
    if (!config) {
      throw new Error('ResourceManagementService requires a configuration object. Pass it in super() call when extending this class.');
    }
    this.config = config;
    // Initialize state with default filters
    this.stateSubject = new BehaviorSubject<
      ResourceState<TFilters, TData, TStatistics>
    >({
      filters: config.defaultFilters,
      results: [],
      loading: false,
      error: null,
      totalResults: 0,
    });

    this.state$ = this.stateSubject.asObservable();

    // Create derived observables with distinctUntilChanged for efficiency
    this.filters$ = this.state$.pipe(
      map((state) => state.filters),
      distinctUntilChanged(
        (a, b) => JSON.stringify(a) === JSON.stringify(b)
      )
    );

    this.data$ = this.state$.pipe(
      map((state) => state.results),
      distinctUntilChanged()
    );

    this.loading$ = this.state$.pipe(
      map((state) => state.loading),
      distinctUntilChanged()
    );

    this.error$ = this.state$.pipe(
      map((state) => state.error),
      distinctUntilChanged()
    );

    this.totalResults$ = this.state$.pipe(
      map((state) => state.totalResults),
      distinctUntilChanged()
    );

    this.statistics$ = this.state$.pipe(
      map((state) => state.statistics),
      distinctUntilChanged(
        (a, b) => JSON.stringify(a) === JSON.stringify(b)
      )
    );

    // Initialize from URL and watch for changes
    console.log('[ResourceManagement] Initializing for:', this.router.url);
    this.initializeFromUrl();
    this.watchUrlChanges();
  }

  // ========== INITIALIZATION ==========

  /**
   * Initialize state from current URL parameters
   * Auto-fetches data if configured
   */
  private initializeFromUrl(): void {
    const params = this.route.snapshot.queryParams;
    const filters = this.config.filterMapper.paramsToFilters(params);

    console.log('[ResourceManagement] Initializing from URL:', filters);

    this.updateState({ filters });

    // Auto-fetch data on initialization (default: true)
    if (this.config.autoFetchOnInit !== false) {
      console.log('[ResourceManagement] Auto-fetching data on initialization');
      this.fetchData()
        .pipe(take(1))
        .subscribe({
          next: () =>
            console.log('[ResourceManagement] Initial data loaded successfully'),
          error: (err) => {
            console.error(
              '[ResourceManagement] Failed to load initial data:',
              err
            );
            this.updateState({
              error: this.formatError(err),
              loading: false,
            });
          },
        });
    }
  }

  /**
   * Watch URL changes and update state accordingly
   * Implements URL-first paradigm
   */
  private watchUrlChanges(): void {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        const params = this.route.snapshot.queryParams;
        const filters = this.config.filterMapper.paramsToFilters(params);
        const currentFilters = this.stateSubject.value.filters;

        // Check if filters changed
        const filtersChanged =
          JSON.stringify(filters) !== JSON.stringify(currentFilters);

        if (filtersChanged) {
          console.log('[ResourceManagement] Filters changed from URL:', filters);
          this.updateState({ filters });

          // Fetch data for new filters
          console.log('[ResourceManagement] Fetching data for new filters');
          this.fetchData().subscribe({
            next: () => console.log('[ResourceManagement] Data fetched'),
            error: (err) =>
              console.error('[ResourceManagement] Fetch failed:', err),
          });
        }
      });
  }

  /**
   * Update internal state (immutable)
   */
  private updateState(
    updates: Partial<ResourceState<TFilters, TData, TStatistics>>
  ): void {
    const current = this.stateSubject.value;
    this.stateSubject.next({ ...current, ...updates });
  }

  // ========== PUBLIC METHODS ==========

  /**
   * Update filters and sync to URL
   * This triggers URL change, which triggers data fetch via watchUrlChanges
   *
   * Implements URL-first paradigm: Update URL, let watcher handle state + fetch
   */
  updateFilters(filters: Partial<TFilters>): void {
    const currentFilters = this.stateSubject.value.filters;

    // Merge filters
    const newFilters = { ...currentFilters, ...filters };

    console.log('[ResourceManagement] updateFilters():', filters);
    console.log('[ResourceManagement] Result filters:', newFilters);

    // Convert to URL params and update URL
    const params = this.config.filterMapper.filtersToParams(newFilters);

    this.urlState.replaceParams(params).subscribe();

    console.log(
      '[ResourceManagement] URL updated - watchUrlChanges() will handle state + fetch'
    );
  }

  /**
   * Clear all filters and reset to default state
   */
  clearFilters(): void {
    console.log('[ResourceManagement] clearFilters() - resetting all filters');

    const params = this.config.filterMapper.filtersToParams(
      this.config.defaultFilters
    );

    this.urlState.replaceParams(params).subscribe();

    console.log(
      '[ResourceManagement] URL updated - watchUrlChanges() will handle state + fetch'
    );
  }

  /**
   * Refresh data with current filters
   * Forces a new API call even if data is cached
   */
  refresh(): void {
    console.log('[ResourceManagement] refresh() - forcing data reload');
    this.fetchData()
      .pipe(take(1))
      .subscribe({
        next: () => console.log('[ResourceManagement] Data refreshed'),
        error: (err) =>
          console.error('[ResourceManagement] Refresh failed:', err),
      });
  }

  /**
   * Get current filter state (synchronous snapshot)
   */
  getCurrentFilters(): TFilters {
    return this.stateSubject.value.filters;
  }

  /**
   * Get current complete state (synchronous snapshot)
   */
  getCurrentState(): ResourceState<TFilters, TData, TStatistics> {
    return this.stateSubject.value;
  }

  // ========== API INTEGRATION ==========

  /**
   * Fetch data from API using current filters
   * Updates state with results, statistics, loading, and error
   */
  fetchData(): Observable<ApiResponse<TData, TStatistics>> {
    const filters = this.getCurrentFilters();

    console.log('[ResourceManagement] Fetching data with filters:', filters);

    // Set loading state
    this.updateState({ loading: true, error: null });

    // Fetch data via adapter
    return this.config.apiAdapter.fetchData(filters).pipe(
      tap((response: ApiResponse<TData, TStatistics>) => {
        console.log('[ResourceManagement] Data fetched successfully:', {
          resultsCount: response.results?.length,
          total: response.total,
          hasStatistics: !!response.statistics,
        });

        // Update state with results
        this.updateState({
          results: response.results || [],
          totalResults: response.total || 0,
          statistics: response.statistics,
          loading: false,
          error: null,
          pagination: {
            page: response.page,
            size: response.size,
            totalPages: response.totalPages,
          },
        });
      }),
      catchError((error) => {
        console.error('[ResourceManagement] Fetch failed:', error);

        // Update state with error
        this.updateState({
          results: [],
          totalResults: 0,
          loading: false,
          error: this.formatError(error),
        });

        return throwError(() => error);
      })
    );
  }

  /**
   * Fetch related data (if supported by adapter)
   * Used for populating pickers, dropdowns, etc.
   */
  fetchRelatedData(page: number = 1, size: number = 1000): Observable<any> {
    if (!this.config.apiAdapter.fetchRelatedData) {
      throw new Error('fetchRelatedData not implemented by API adapter');
    }

    return this.config.apiAdapter.fetchRelatedData(page, size);
  }

  /**
   * Fetch instances of a specific resource (if supported by adapter)
   * Used for detail views, drill-down, etc.
   */
  fetchInstances(resourceId: string, count: number = 8): Observable<any> {
    if (!this.config.apiAdapter.fetchInstances) {
      throw new Error('fetchInstances not implemented by API adapter');
    }

    return this.config.apiAdapter.fetchInstances(resourceId, count);
  }

  // ========== HELPER METHODS ==========

  /**
   * Format error message for display
   */
  private formatError(error: any): string {
    if (error.status === 0) {
      return 'Network error. Please check your connection.';
    }
    if (error.status === 404) {
      return 'No data found matching your criteria.';
    }
    if (error.status >= 500) {
      return 'Server error. Please try again later.';
    }
    return error.message || 'An unexpected error occurred.';
  }

  // ========== CLEANUP ==========

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
