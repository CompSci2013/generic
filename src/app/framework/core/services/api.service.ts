import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { ApiResponse, ApiRequest, ApiErrorResponse } from '../models';

/**
 * Generic API Service
 * Domain-agnostic HTTP service for making API requests with full type safety
 *
 * This service provides methods for making HTTP requests to any backend API
 * and works with any data type through TypeScript generics.
 *
 * @example
 * ```typescript
 * // Simple GET request
 * interface Product { id: string; name: string; price: number; }
 * this.apiService.get<Product>('/api/products').subscribe(response => {
 *   console.log(response.results); // Product[]
 * });
 *
 * // GET with query parameters
 * this.apiService.get<Product>('/api/products', { category: 'electronics', page: 1 });
 *
 * // POST request
 * this.apiService.post<Product>('/api/products', { name: 'New Product', price: 99.99 });
 * ```
 */
@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private http: HttpClient) { }

  /**
   * Perform a generic GET request with pagination support
   *
   * @template TData - Type of data items in the response
   * @template TStatistics - Optional statistics type
   * @param endpoint - API endpoint path (relative or absolute)
   * @param params - Optional query parameters
   * @param baseUrl - Optional base URL override
   * @returns Observable of ApiResponse with typed data
   */
  get<TData, TStatistics = void>(
    endpoint: string,
    params?: Record<string, any>,
    baseUrl?: string
  ): Observable<ApiResponse<TData, TStatistics>> {
    const httpParams = this.buildHttpParams(params);
    const url = this.buildUrl(endpoint, baseUrl);

    return this.http.get<ApiResponse<TData, TStatistics>>(url, { params: httpParams })
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Perform a generic POST request
   *
   * @template TResponse - Type of the response data
   * @param endpoint - API endpoint path
   * @param body - Request body
   * @param baseUrl - Optional base URL override
   * @returns Observable of the response
   */
  post<TResponse>(
    endpoint: string,
    body: any,
    baseUrl?: string
  ): Observable<TResponse> {
    const url = this.buildUrl(endpoint, baseUrl);

    return this.http.post<TResponse>(url, body)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Perform a generic PUT request
   *
   * @template TResponse - Type of the response data
   * @param endpoint - API endpoint path
   * @param body - Request body
   * @param baseUrl - Optional base URL override
   * @returns Observable of the response
   */
  put<TResponse>(
    endpoint: string,
    body: any,
    baseUrl?: string
  ): Observable<TResponse> {
    const url = this.buildUrl(endpoint, baseUrl);

    return this.http.put<TResponse>(url, body)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Perform a generic PATCH request
   *
   * @template TResponse - Type of the response data
   * @param endpoint - API endpoint path
   * @param body - Request body
   * @param baseUrl - Optional base URL override
   * @returns Observable of the response
   */
  patch<TResponse>(
    endpoint: string,
    body: any,
    baseUrl?: string
  ): Observable<TResponse> {
    const url = this.buildUrl(endpoint, baseUrl);

    return this.http.patch<TResponse>(url, body)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Perform a generic DELETE request
   *
   * @template TResponse - Type of the response data
   * @param endpoint - API endpoint path
   * @param baseUrl - Optional base URL override
   * @returns Observable of the response
   */
  delete<TResponse>(
    endpoint: string,
    baseUrl?: string
  ): Observable<TResponse> {
    const url = this.buildUrl(endpoint, baseUrl);

    return this.http.delete<TResponse>(url)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Execute a configured API request
   * Provides a flexible way to make requests with full configuration
   *
   * @template TResponse - Type of the response data
   * @param request - Configured API request object
   * @returns Observable of the response
   */
  execute<TResponse>(request: ApiRequest): Observable<TResponse> {
    const method = request.method || 'GET';
    const url = this.buildUrl(request.endpoint, request.baseUrl);
    const httpParams = this.buildHttpParams(request.params);
    const headers = new HttpHeaders(request.headers || {});

    switch (method) {
      case 'GET':
        return this.http.get<TResponse>(url, { params: httpParams, headers })
          .pipe(catchError(this.handleError));

      case 'POST':
        return this.http.post<TResponse>(url, request.body, { params: httpParams, headers })
          .pipe(catchError(this.handleError));

      case 'PUT':
        return this.http.put<TResponse>(url, request.body, { params: httpParams, headers })
          .pipe(catchError(this.handleError));

      case 'PATCH':
        return this.http.patch<TResponse>(url, request.body, { params: httpParams, headers })
          .pipe(catchError(this.handleError));

      case 'DELETE':
        return this.http.delete<TResponse>(url, { params: httpParams, headers })
          .pipe(catchError(this.handleError));

      default:
        return throwError(() => new Error(`Unsupported HTTP method: ${method}`));
    }
  }

  /**
   * Build HttpParams from a key-value object
   * Handles undefined/null values and array serialization
   *
   * @param params - Parameters object
   * @returns HttpParams instance
   */
  private buildHttpParams(params?: Record<string, any>): HttpParams {
    let httpParams = new HttpParams();

    if (!params) {
      return httpParams;
    }

    Object.keys(params).forEach(key => {
      const value = params[key];

      // Skip undefined and null values
      if (value === undefined || value === null) {
        return;
      }

      // Handle array values (serialize as comma-separated or multiple params)
      if (Array.isArray(value)) {
        // Join arrays as comma-separated strings
        httpParams = httpParams.set(key, value.join(','));
      }
      // Handle object values (stringify)
      else if (typeof value === 'object') {
        httpParams = httpParams.set(key, JSON.stringify(value));
      }
      // Handle primitive values
      else {
        httpParams = httpParams.set(key, value.toString());
      }
    });

    return httpParams;
  }

  /**
   * Build the full URL from endpoint and optional base URL
   *
   * @param endpoint - API endpoint
   * @param baseUrl - Optional base URL
   * @returns Full URL string
   */
  private buildUrl(endpoint: string, baseUrl?: string): string {
    // If endpoint is already a full URL, return as-is
    if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
      return endpoint;
    }

    // If baseUrl provided, use it
    if (baseUrl) {
      return `${baseUrl.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`;
    }

    // Otherwise, use endpoint as-is (assumes environment.apiUrl is configured in interceptors)
    return endpoint;
  }

  /**
   * Generic error handler
   * Transforms HTTP errors into structured ApiErrorResponse
   *
   * @param error - HTTP error response
   * @returns Observable error
   */
  private handleError(error: any): Observable<never> {
    const apiError: ApiErrorResponse = {
      status: error.status || 500,
      message: error.error?.message || error.message || 'An unexpected error occurred',
      code: error.error?.code,
      details: error.error?.details,
      timestamp: new Date().toISOString()
    };

    console.error('API Error:', apiError);
    return throwError(() => apiError);
  }
}
