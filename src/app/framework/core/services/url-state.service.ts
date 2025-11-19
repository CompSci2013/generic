import { Injectable, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, NavigationExtras, Params } from '@angular/router';
import { BehaviorSubject, Observable, Subject, from, of } from 'rxjs';
import { map, distinctUntilChanged, takeUntil, catchError } from 'rxjs/operators';
import { UrlSerializer } from '../utils';

/**
 * Generic URL State Management Service
 * Domain-agnostic service for bidirectional URL state synchronization
 *
 * Implements the URL-first paradigm: All application state derives from URL.
 * This ensures bookmarkable URLs, proper browser back/forward behavior,
 * and state persistence across page refreshes.
 *
 * Features:
 * - Type-safe generic parameter handling
 * - Bidirectional sync (URL ↔ Application State)
 * - Browser history integration (back/forward)
 * - Observable-based reactive API
 * - Memory leak prevention (OnDestroy cleanup)
 * - Cross-route parameter persistence
 *
 * @example
 * ```typescript
 * // Define your parameter shape
 * interface MyFilters {
 *   search: string;
 *   category: string;
 *   page: number;
 * }
 *
 * // Read parameters
 * this.urlState.watchParams<MyFilters>().subscribe(params => {
 *   console.log('Current filters:', params);
 * });
 *
 * // Update parameters
 * this.urlState.setParams<MyFilters>({ page: 2, search: 'test' });
 *
 * // Clear all parameters
 * this.urlState.clearParams();
 * ```
 */
@Injectable({
  providedIn: 'root'
})
export class UrlStateService implements OnDestroy {
  /** Subject for cleanup on service destruction */
  private destroy$ = new Subject<void>();

  /** Internal state: current query parameters */
  private queryParamsSubject = new BehaviorSubject<Params>({});

  /** Public observable of query parameters */
  public queryParams$ = this.queryParamsSubject.asObservable();

  /** URL serializer utility */
  private serializer = new UrlSerializer();

  /** Parameters that persist across all route changes */
  private persistentParams: string[] = [];

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {
    // Subscribe to Angular Router's query param changes
    // Automatically sync URL changes to internal state
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe((params) => {
        this.queryParamsSubject.next(params);
      });
  }

  /**
   * Cleanup when service is destroyed
   * Prevents memory leaks from subscriptions
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ============================================================================
  // READ METHODS: Get parameters from URL
  // ============================================================================

  /**
   * Get all query parameters as a typed object (snapshot)
   * Returns current state synchronously
   *
   * @template TParams - Shape of the parameters object
   * @returns Current query parameters
   */
  getParams<TParams = Params>(): TParams {
    return this.queryParamsSubject.value as TParams;
  }

  /**
   * Watch query parameters as an Observable
   * Emits whenever URL parameters change
   *
   * @template TParams - Shape of the parameters object
   * @returns Observable of query parameters
   */
  watchParams<TParams = Params>(): Observable<TParams> {
    return this.queryParams$.pipe(
      map(params => params as TParams),
      distinctUntilChanged()
    );
  }

  /**
   * Get a specific query parameter value
   * Returns Observable that emits on parameter changes
   *
   * @param key - Parameter name
   * @returns Observable of parameter value or null
   */
  getParam(key: string): Observable<string | null> {
    return this.queryParams$.pipe(
      map((params) => params[key] as string || null),
      distinctUntilChanged()
    );
  }

  /**
   * Get a specific query parameter value (snapshot)
   * Returns current value synchronously
   *
   * @param key - Parameter name
   * @returns Current parameter value or null
   */
  getParamSnapshot(key: string): string | null {
    return this.queryParamsSubject.value[key] as string || null;
  }

  /**
   * Get parameter as array
   * Automatically splits comma-separated values
   *
   * @param key - Parameter name
   * @returns Observable of string array
   */
  getParamAsArray(key: string): Observable<string[]> {
    return this.getParam(key).pipe(
      map(value => value ? this.serializer.decodeArray(value) : [])
    );
  }

  /**
   * Get parameter as number
   *
   * @param key - Parameter name
   * @param defaultValue - Default value if parameter is missing or invalid
   * @returns Observable of number
   */
  getParamAsNumber(key: string, defaultValue: number = 0): Observable<number> {
    return this.getParam(key).pipe(
      map(value => value ? this.serializer.decodeNumber(value, defaultValue) : defaultValue)
    );
  }

  /**
   * Get parameter as boolean
   *
   * @param key - Parameter name
   * @param defaultValue - Default value if parameter is missing
   * @returns Observable of boolean
   */
  getParamAsBoolean(key: string, defaultValue: boolean = false): Observable<boolean> {
    return this.getParam(key).pipe(
      map(value => value ? this.serializer.decodeBoolean(value, defaultValue) : defaultValue)
    );
  }

  /**
   * Get parameter as object
   * Parses JSON-encoded parameter
   *
   * @param key - Parameter name
   * @returns Observable of parsed object or null
   */
  getParamAsObject<T = any>(key: string): Observable<T | null> {
    return this.getParam(key).pipe(
      map(value => value ? this.serializer.decodeObject<T>(value) : null)
    );
  }

  // ============================================================================
  // WRITE METHODS: Update parameters in URL
  // ============================================================================

  /**
   * Set or update query parameters (merges with existing)
   * Core method for updating URL state
   *
   * @template TParams - Shape of the parameters object
   * @param params - Parameters to set or update
   * @returns Observable indicating navigation success
   *
   * @example
   * ```typescript
   * this.urlState.setParams({ page: 2, filter: 'active' });
   * // Merges with existing params
   * ```
   */
  setParams<TParams = Params>(params: Partial<TParams>): Observable<boolean> {
    return from(
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: params as Params,
        queryParamsHandling: 'merge' // Merge with existing params
      })
    ).pipe(
      catchError((error) => {
        console.error('[UrlStateService] Navigation failed:', error);
        return of(false);
      })
    );
  }

  /**
   * Replace ALL query parameters (does not merge)
   * Removes existing params and sets only the provided ones
   *
   * @template TParams - Shape of the parameters object
   * @param params - New parameters (replaces all existing)
   * @returns Observable indicating navigation success
   */
  replaceParams<TParams = Params>(params: TParams): Observable<boolean> {
    return from(
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: params as Params
        // No queryParamsHandling = replace behavior
      })
    ).pipe(
      catchError((error) => {
        console.error('[UrlStateService] Navigation failed:', error);
        return of(false);
      })
    );
  }

  /**
   * Remove a specific query parameter
   *
   * @param key - Parameter name to remove
   * @returns Observable indicating navigation success
   */
  clearParam(key: string): Observable<boolean> {
    const currentParams = { ...this.queryParamsSubject.value };
    delete currentParams[key];
    return this.replaceParams(currentParams);
  }

  /**
   * Remove ALL query parameters
   * Resets to clean URL with no query string
   *
   * @returns Observable indicating navigation success
   */
  clearParams(): Observable<boolean> {
    return this.replaceParams({});
  }

  // ============================================================================
  // CROSS-ROUTE PERSISTENCE
  // ============================================================================

  /**
   * Navigate to a new route while preserving specified parameters
   *
   * @param commands - Route path segments (same as router.navigate)
   * @param paramsToPreserve - Array of param names to keep from current URL
   * @param extras - Additional navigation options
   * @returns Promise indicating navigation success
   *
   * @example
   * ```typescript
   * // Current URL: /search?filter=active&page=2
   * this.urlState.navigateWithPersistence(
   *   ['/details', itemId],
   *   ['filter']  // Keep filter param
   * );
   * // New URL: /details/123?filter=active
   * ```
   */
  navigateWithPersistence(
    commands: any[],
    paramsToPreserve: string[],
    extras?: NavigationExtras
  ): Promise<boolean> {
    const currentParams = this.queryParamsSubject.value;

    // Extract only the params we want to preserve
    const preservedParams = paramsToPreserve.reduce((acc, key) => {
      if (currentParams[key] !== undefined) {
        acc[key] = currentParams[key];
      }
      return acc;
    }, {} as Params);

    // Merge preserved params with any new params from extras
    return this.router.navigate(commands, {
      ...extras,
      queryParams: {
        ...preservedParams,
        ...extras?.queryParams
      }
    });
  }

  /**
   * Navigate to a new route preserving all configured persistent params
   *
   * @param commands - Route path segments
   * @param extras - Additional navigation options
   * @returns Promise indicating navigation success
   */
  navigateWithGlobalPersistence(
    commands: any[],
    extras?: NavigationExtras
  ): Promise<boolean> {
    return this.navigateWithPersistence(commands, this.persistentParams, extras);
  }

  /**
   * Configure which parameters persist across ALL route changes
   * Call this early in app initialization
   *
   * @param params - Array of parameter names to persist globally
   */
  setPersistentParams(params: string[]): void {
    this.persistentParams = params;
  }

  /**
   * Get list of currently configured persistent parameters
   *
   * @returns Array of persistent parameter names
   */
  getPersistentParams(): string[] {
    return [...this.persistentParams];
  }
}
