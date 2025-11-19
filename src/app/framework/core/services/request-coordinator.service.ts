import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, throwError, of, timer } from 'rxjs';
import {
  shareReplay,
  catchError,
  finalize,
  retry,
  tap,
  map,
} from 'rxjs/operators';
import { RequestConfig } from '../models/request-config';
import { RequestState } from '../models/request-state';

/**
 * Cached response entry
 */
interface CachedResponse<T> {
  data: T;
  timestamp: number;
  config: RequestConfig;
}

/**
 * Service for coordinating API requests with caching, deduplication, and retry logic.
 *
 * Features:
 * - Response caching with configurable TTL
 * - Request deduplication (prevents parallel identical requests)
 * - Automatic retry with exponential backoff
 * - Global and per-request loading states
 * - Cache invalidation
 * - Request cancellation
 *
 * @example
 * ```typescript
 * // Execute a request with caching
 * this.coordinator.execute(
 *   'my-request-key',
 *   () => this.apiService.get('/endpoint'),
 *   { cacheTime: 30000, retryAttempts: 3 }
 * ).subscribe(data => {
 *   console.log('Data:', data);
 * });
 * ```
 */
@Injectable({
  providedIn: 'root',
})
export class RequestCoordinatorService {
  /**
   * Active in-flight requests for deduplication
   * Maps request keys to their Observable streams
   */
  private activeRequests = new Map<string, Observable<any>>();

  /**
   * Response cache storage
   * Maps request keys to cached responses with metadata
   */
  private responseCache = new Map<string, CachedResponse<any>>();

  /**
   * Loading states for individual requests
   * Maps request keys to BehaviorSubjects tracking their state
   */
  private loadingStates = new Map<string, BehaviorSubject<RequestState>>();

  /**
   * Counter for global loading state
   * Increments when a request starts, decrements when it finishes
   */
  private globalLoadingSubject = new BehaviorSubject<number>(0);

  /**
   * Observable stream of the global loading counter
   */
  public globalLoading$ = this.globalLoadingSubject.asObservable();

  constructor() {}

  /**
   * Execute a request with coordination features (caching, deduplication, retry)
   *
   * @template T - The type of data returned by the request
   * @param key - Unique identifier for this request type
   * @param requestFn - Function that returns the Observable request
   * @param config - Configuration for caching, deduplication, and retry behavior
   * @returns Observable stream of the request response
   *
   * @example
   * ```typescript
   * // Basic usage
   * coordinator.execute(
   *   'fetch-items',
   *   () => apiService.get('/items')
   * ).subscribe(items => console.log(items));
   *
   * // With caching and retry
   * coordinator.execute(
   *   'fetch-items',
   *   () => apiService.get('/items'),
   *   { cacheTime: 60000, retryAttempts: 3, retryDelay: 2000 }
   * ).subscribe(items => console.log(items));
   * ```
   */
  execute<T>(
    key: string,
    requestFn: () => Observable<T>,
    config: RequestConfig = {}
  ): Observable<T> {
    const {
      cacheTime = 0,
      deduplication = true,
      retryAttempts = 2,
      retryDelay = 1000,
    } = config;

    // Check cache first
    if (cacheTime > 0) {
      const cached = this.getCachedResponse<T>(key, cacheTime);
      if (cached !== null) {
        return of(cached);
      }
    }

    // Check for in-flight request (deduplication)
    if (deduplication && this.activeRequests.has(key)) {
      return this.activeRequests.get(key)!;
    }

    // Create loading state if not exists
    if (!this.loadingStates.has(key)) {
      this.loadingStates.set(
        key,
        new BehaviorSubject<RequestState>({
          loading: false,
          error: null,
          lastUpdated: null,
        })
      );
    }

    // Start loading
    this.setLoadingState(key, true);
    this.incrementGlobalLoading();

    // Create and execute request with retry logic
    const request$ = requestFn().pipe(
      // Retry with exponential backoff
      retry({
        count: retryAttempts,
        delay: (error, retryCount) => {
          const delayTime = retryDelay * Math.pow(2, retryCount - 1);
          console.warn(
            `[RequestCoordinator] Retrying request "${key}" (attempt ${retryCount}/${retryAttempts}) after ${delayTime}ms`,
            error
          );
          return timer(delayTime);
        },
      }),
      // Share for deduplication with refCount to prevent memory leaks
      shareReplay({ bufferSize: 1, refCount: true }),
      // Cache successful responses
      tap((response) => {
        if (cacheTime > 0) {
          this.cacheResponse(key, response, config);
        }
        this.setLoadingSuccess(key);
      }),
      // Error handling
      catchError((error) => {
        console.error(
          `[RequestCoordinator] Request failed for key: "${key}"`,
          error
        );
        this.setLoadingError(key, error);
        return throwError(() => error);
      }),
      // Cleanup
      finalize(() => {
        this.activeRequests.delete(key);
        this.setLoadingState(key, false);
        this.decrementGlobalLoading();
      })
    );

    // Cache the in-flight request for deduplication
    if (deduplication) {
      this.activeRequests.set(key, request$);
    }

    return request$;
  }

  /**
   * Get the loading state Observable for a specific request
   *
   * @param key - The unique key for the request
   * @returns Observable stream of the request's loading state
   *
   * @example
   * ```typescript
   * coordinator.getLoadingState$('fetch-items')
   *   .subscribe(state => {
   *     console.log('Loading:', state.loading);
   *     console.log('Error:', state.error);
   *     console.log('Last Updated:', state.lastUpdated);
   *   });
   * ```
   */
  getLoadingState$(key: string): Observable<RequestState> {
    if (!this.loadingStates.has(key)) {
      this.loadingStates.set(
        key,
        new BehaviorSubject<RequestState>({
          loading: false,
          error: null,
          lastUpdated: null,
        })
      );
    }
    return this.loadingStates.get(key)!.asObservable();
  }

  /**
   * Get the global loading state as a boolean
   *
   * @returns Observable stream of whether any requests are loading
   *
   * @example
   * ```typescript
   * coordinator.getGlobalLoading$()
   *   .subscribe(isLoading => {
   *     console.log('Any requests loading?', isLoading);
   *   });
   * ```
   */
  getGlobalLoading$(): Observable<boolean> {
    return this.globalLoading$.pipe(map((count) => count > 0));
  }

  /**
   * Check if any requests are currently loading (synchronous)
   *
   * @returns True if any requests are in progress
   *
   * @example
   * ```typescript
   * if (coordinator.isAnyLoading()) {
   *   console.log('Requests in progress...');
   * }
   * ```
   */
  isAnyLoading(): boolean {
    return this.globalLoadingSubject.value > 0;
  }

  /**
   * Cancel all active requests
   * Useful during navigation or component destruction
   *
   * @example
   * ```typescript
   * // In a component's ngOnDestroy
   * ngOnDestroy() {
   *   this.coordinator.cancelAll();
   * }
   * ```
   */
  cancelAll(): void {
    this.activeRequests.clear();
    this.loadingStates.forEach((state) => {
      state.next({
        loading: false,
        error: null,
        lastUpdated: state.value.lastUpdated,
      });
    });
    this.globalLoadingSubject.next(0);
  }

  /**
   * Clear cached responses for a specific key or all keys
   *
   * @param key - Optional key to clear specific cache entry. If not provided, clears all cache.
   *
   * @example
   * ```typescript
   * // Clear specific cache
   * coordinator.clearCache('fetch-items');
   *
   * // Clear all cache
   * coordinator.clearCache();
   * ```
   */
  clearCache(key?: string): void {
    if (key) {
      this.responseCache.delete(key);
    } else {
      this.responseCache.clear();
    }
  }

  /**
   * Invalidate cache entries matching a pattern
   *
   * @param pattern - String pattern to match against cache keys (supports wildcards with *)
   *
   * @example
   * ```typescript
   * // Clear all caches starting with 'fetch-'
   * coordinator.invalidateCache('fetch-*');
   *
   * // Clear all caches containing 'items'
   * coordinator.invalidateCache('*items*');
   * ```
   */
  invalidateCache(pattern: string): void {
    const regex = new RegExp(
      '^' + pattern.replace(/\*/g, '.*').replace(/\?/g, '.') + '$'
    );
    const keysToDelete: string[] = [];

    this.responseCache.forEach((_, key) => {
      if (regex.test(key)) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach((key) => this.responseCache.delete(key));
  }

  // ========== PRIVATE METHODS ==========

  /**
   * Retrieve a cached response if valid
   * @private
   */
  private getCachedResponse<T>(key: string, cacheTime: number): T | null {
    const cached = this.responseCache.get(key);
    if (!cached) {
      return null;
    }

    const age = Date.now() - cached.timestamp;
    if (age > cacheTime) {
      this.responseCache.delete(key);
      return null;
    }

    return cached.data;
  }

  /**
   * Store a response in cache
   * @private
   */
  private cacheResponse<T>(key: string, data: T, config: RequestConfig): void {
    this.responseCache.set(key, {
      data,
      timestamp: Date.now(),
      config,
    });
  }

  /**
   * Update loading state for a request
   * @private
   */
  private setLoadingState(key: string, loading: boolean): void {
    const state = this.loadingStates.get(key);
    if (state) {
      state.next({
        ...state.value,
        loading,
        error: loading ? null : state.value.error,
      });
    }
  }

  /**
   * Mark a request as failed
   * @private
   */
  private setLoadingError(key: string, error: Error): void {
    const state = this.loadingStates.get(key);
    if (state) {
      state.next({
        loading: false,
        error,
        lastUpdated: Date.now(),
      });
    }
  }

  /**
   * Mark a request as successful
   * @private
   */
  private setLoadingSuccess(key: string): void {
    const state = this.loadingStates.get(key);
    if (state) {
      state.next({
        loading: false,
        error: null,
        lastUpdated: Date.now(),
      });
    }
  }

  /**
   * Increment global loading counter
   * @private
   */
  private incrementGlobalLoading(): void {
    this.globalLoadingSubject.next(this.globalLoadingSubject.value + 1);
  }

  /**
   * Decrement global loading counter
   * @private
   */
  private decrementGlobalLoading(): void {
    const current = this.globalLoadingSubject.value;
    this.globalLoadingSubject.next(Math.max(0, current - 1));
  }
}
