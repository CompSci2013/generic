import { ErrorHandler, Injectable, Injector } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ErrorNotificationService } from '../services/error-notification.service';
import {
  ErrorInfo,
  ErrorCategory,
  ErrorSeverity,
} from '../models/error-info';

/**
 * Global error handler for uncaught exceptions
 * Categorizes and logs errors, displays user-friendly messages
 *
 * Features:
 * - Catches all uncaught exceptions
 * - Categorizes errors (network, server, validation, etc.)
 * - Displays user-friendly error notifications
 * - Logs detailed error information
 * - Domain-agnostic error handling
 *
 * Usage:
 * ```typescript
 * // In app.module.ts providers:
 * { provide: ErrorHandler, useClass: GlobalErrorHandler }
 * ```
 *
 * @example
 * ```typescript
 * // Errors are automatically caught and handled
 * throw new Error('Something went wrong');
 * // → User sees friendly notification
 * // → Error is logged to console
 * ```
 */
@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  constructor(private injector: Injector) {}

  handleError(error: Error | HttpErrorResponse): void {
    const errorInfo = this.categorizeError(error);

    // Log error to console
    this.logError(errorInfo);

    // Show notification to user (using Injector to avoid circular dependency)
    const notifier = this.injector.get(ErrorNotificationService);
    notifier.showErrorInfo(errorInfo);
  }

  /**
   * Categorize an error and create ErrorInfo
   */
  private categorizeError(error: Error | HttpErrorResponse): ErrorInfo {
    // HTTP error response
    if (error instanceof HttpErrorResponse) {
      return this.categorizeHttpError(error);
    }

    // Regular JavaScript error
    return this.categorizeJavaScriptError(error);
  }

  /**
   * Categorize HTTP errors
   */
  private categorizeHttpError(error: HttpErrorResponse): ErrorInfo {
    let category: ErrorCategory;
    let severity: ErrorSeverity;
    let message: string;
    let retryable = false;

    // Network error (no response from server)
    if (error.status === 0) {
      category = ErrorCategory.NETWORK;
      severity = ErrorSeverity.ERROR;
      message = 'Unable to connect to server. Please check your internet connection.';
      retryable = true;
    }
    // Timeout
    else if (error.status === 408 || error.statusText === 'timeout') {
      category = ErrorCategory.TIMEOUT;
      severity = ErrorSeverity.WARNING;
      message = 'Request timed out. Please try again.';
      retryable = true;
    }
    // Client errors (400-499)
    else if (error.status >= 400 && error.status < 500) {
      switch (error.status) {
        case 400:
          category = ErrorCategory.VALIDATION;
          severity = ErrorSeverity.WARNING;
          message = error.error?.message || 'Invalid request. Please check your input.';
          break;
        case 401:
          category = ErrorCategory.AUTHENTICATION;
          severity = ErrorSeverity.ERROR;
          message = 'Authentication required. Please log in.';
          break;
        case 403:
          category = ErrorCategory.AUTHORIZATION;
          severity = ErrorSeverity.ERROR;
          message = 'You do not have permission to access this resource.';
          break;
        case 404:
          category = ErrorCategory.NOT_FOUND;
          severity = ErrorSeverity.WARNING;
          message = 'The requested resource was not found.';
          break;
        default:
          category = ErrorCategory.SERVER;
          severity = ErrorSeverity.ERROR;
          message = error.error?.message || `Client error occurred (${error.status}).`;
      }
    }
    // Server errors (500-599)
    else if (error.status >= 500) {
      category = ErrorCategory.SERVER;
      severity = ErrorSeverity.CRITICAL;
      message = 'Server error occurred. Please try again later.';
      retryable = true;
    }
    // Unknown
    else {
      category = ErrorCategory.UNKNOWN;
      severity = ErrorSeverity.ERROR;
      message = 'An unexpected error occurred.';
    }

    return {
      category,
      severity,
      message,
      details: error.message,
      statusCode: error.status,
      timestamp: new Date(),
      originalError: error,
      retryable,
      stack: error.error?.stack,
      context: {
        url: error.url,
        headers: error.headers,
      },
    };
  }

  /**
   * Categorize JavaScript errors
   */
  private categorizeJavaScriptError(error: Error): ErrorInfo {
    let category: ErrorCategory = ErrorCategory.UNKNOWN;
    let severity: ErrorSeverity = ErrorSeverity.ERROR;
    let message = 'An unexpected error occurred.';

    // Check error type
    if (error.name === 'TypeError') {
      message = 'A type error occurred. Please refresh the page.';
    } else if (error.name === 'ReferenceError') {
      message = 'A reference error occurred. Please refresh the page.';
    } else if (error.name === 'RangeError') {
      message = 'A range error occurred. Please check your input.';
      category = ErrorCategory.VALIDATION;
      severity = ErrorSeverity.WARNING;
    } else if (error.message) {
      message = `Error: ${error.message}`;
    }

    return {
      category,
      severity,
      message,
      details: error.message,
      timestamp: new Date(),
      originalError: error,
      retryable: false,
      stack: error.stack,
    };
  }

  /**
   * Log error to console with detailed information
   */
  private logError(errorInfo: ErrorInfo): void {
    const logLevel = this.getLogLevel(errorInfo.severity);

    console.group(`[${errorInfo.category.toUpperCase()}] ${errorInfo.message}`);
    console[logLevel]('Severity:', errorInfo.severity);
    console[logLevel]('Timestamp:', errorInfo.timestamp.toISOString());

    if (errorInfo.statusCode) {
      console[logLevel]('Status Code:', errorInfo.statusCode);
    }

    if (errorInfo.details) {
      console[logLevel]('Details:', errorInfo.details);
    }

    if (errorInfo.stack) {
      console[logLevel]('Stack Trace:', errorInfo.stack);
    }

    if (errorInfo.context) {
      console[logLevel]('Context:', errorInfo.context);
    }

    if (errorInfo.originalError) {
      console[logLevel]('Original Error:', errorInfo.originalError);
    }

    console.groupEnd();
  }

  /**
   * Get console log level based on severity
   */
  private getLogLevel(severity: ErrorSeverity): 'log' | 'warn' | 'error' {
    switch (severity) {
      case ErrorSeverity.INFO:
        return 'log';
      case ErrorSeverity.WARNING:
        return 'warn';
      case ErrorSeverity.ERROR:
      case ErrorSeverity.CRITICAL:
        return 'error';
      default:
        return 'error';
    }
  }
}
