import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse
} from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, finalize } from 'rxjs/operators';

/**
 * Loading Interceptor
 * Tracks active HTTP requests and provides a global loading state
 *
 * This interceptor maintains a count of active requests and exposes
 * an observable that components can subscribe to for loading indicators.
 *
 * Features:
 * - Global loading state management
 * - Per-request tracking
 * - Automatic cleanup on request completion
 * - Domain-agnostic implementation
 *
 * Usage:
 * ```typescript
 * export class SomeComponent {
 *   loading$ = LoadingInterceptor.loading$;
 * }
 * ```
 */
@Injectable()
export class LoadingInterceptor implements HttpInterceptor {
  /** Number of active HTTP requests */
  private activeRequests = 0;

  /** Observable that emits true when requests are in progress, false when idle */
  private static loadingSubject = new BehaviorSubject<boolean>(false);

  /** Public observable for components to subscribe to loading state */
  public static loading$ = LoadingInterceptor.loadingSubject.asObservable();

  constructor() {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Increment active request count
    this.incrementActiveRequests();

    return next.handle(request).pipe(
      tap((event: HttpEvent<any>) => {
        // Optional: You can add request timing logging here
        if (event instanceof HttpResponse) {
          // Request completed successfully
        }
      }),
      finalize(() => {
        // Decrement active request count when request completes (success or error)
        this.decrementActiveRequests();
      })
    );
  }

  /**
   * Increment the active request count and update loading state
   */
  private incrementActiveRequests(): void {
    this.activeRequests++;
    if (this.activeRequests === 1) {
      LoadingInterceptor.loadingSubject.next(true);
    }
  }

  /**
   * Decrement the active request count and update loading state
   */
  private decrementActiveRequests(): void {
    this.activeRequests--;
    if (this.activeRequests === 0) {
      LoadingInterceptor.loadingSubject.next(false);
    }
  }

  /**
   * Get the current loading state (synchronous)
   * @returns true if any requests are in progress
   */
  public static isLoading(): boolean {
    return LoadingInterceptor.loadingSubject.value;
  }

  /**
   * Reset the loading state (useful for testing or error recovery)
   */
  public static reset(): void {
    LoadingInterceptor.loadingSubject.next(false);
  }
}
