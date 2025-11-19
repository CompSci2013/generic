import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

/**
 * API Error Interceptor
 * Provides centralized error handling for all HTTP requests
 *
 * Features:
 * - Automatic retry for failed requests (configurable)
 * - Structured error logging
 * - Error transformation for consistent error handling
 * - Network error detection
 *
 * This interceptor is domain-agnostic and works with any API backend.
 */
@Injectable()
export class ApiErrorInterceptor implements HttpInterceptor {

  constructor() {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      // Retry failed requests up to 2 times (excluding 4xx client errors)
      retry({
        count: 2,
        delay: (error: HttpErrorResponse, retryCount: number) => {
          // Don't retry client errors (4xx)
          if (error.status >= 400 && error.status < 500) {
            throw error;
          }
          // Exponential backoff: 1s, 2s
          return new Observable(subscriber => {
            setTimeout(() => {
              subscriber.next();
              subscriber.complete();
            }, retryCount * 1000);
          });
        }
      }),

      // Handle errors
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'An unknown error occurred';
        let errorCode = 'UNKNOWN_ERROR';

        if (error.error instanceof ErrorEvent) {
          // Client-side or network error
          errorMessage = `Network error: ${error.error.message}`;
          errorCode = 'NETWORK_ERROR';
          console.error('Client-side error:', error.error);
        } else {
          // Backend error
          errorMessage = error.error?.message || `Server error: ${error.status} ${error.statusText}`;
          errorCode = error.error?.code || `HTTP_${error.status}`;
          console.error(
            `Backend error: ${error.status} ${error.statusText}`,
            `URL: ${request.url}`,
            `Error body:`, error.error
          );
        }

        // Log structured error for debugging
        const structuredError = {
          code: errorCode,
          message: errorMessage,
          status: error.status,
          url: request.url,
          method: request.method,
          timestamp: new Date().toISOString()
        };

        console.error('HTTP Error:', structuredError);

        // Return error with consistent structure
        return throwError(() => ({
          ...structuredError,
          originalError: error
        }));
      })
    );
  }
}
