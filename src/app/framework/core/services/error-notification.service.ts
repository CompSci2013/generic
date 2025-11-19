import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';
import {
  ErrorInfo,
  ErrorNotificationOptions,
  ErrorCategory,
  ErrorSeverity,
} from '../models/error-info';

/**
 * Service for displaying error notifications to users
 * Domain-agnostic error notification using PrimeNG Toast
 *
 * Features:
 * - User-friendly error messages
 * - Categorized error display
 * - Customizable notification styling
 * - Success and info messages
 * - Sticky and auto-dismiss options
 *
 * @example
 * ```typescript
 * // Show error notification
 * errorService.showError({
 *   message: 'Failed to load data',
 *   severity: 'error',
 *   life: 5000
 * });
 *
 * // Show from ErrorInfo
 * errorService.showErrorInfo(errorInfo);
 *
 * // Show success message
 * errorService.showSuccess('Data saved successfully');
 * ```
 */
@Injectable({
  providedIn: 'root',
})
export class ErrorNotificationService {
  constructor(private messageService: MessageService) {}

  /**
   * Show an error notification
   */
  showError(options: ErrorNotificationOptions): void {
    this.messageService.add({
      severity: options.severity || 'error',
      summary: options.title || 'Error',
      detail: options.message,
      life: options.life ?? 5000,
      closable: options.closable !== false,
      data: options.data,
    });
  }

  /**
   * Show error from ErrorInfo object
   */
  showErrorInfo(errorInfo: ErrorInfo): void {
    const severity = this.mapSeverityToToast(errorInfo.severity);
    const title = this.getCategoryTitle(errorInfo.category);

    this.showError({
      title,
      message: errorInfo.message,
      severity,
      life: errorInfo.severity === ErrorSeverity.CRITICAL ? 0 : 5000,
      data: errorInfo,
    });
  }

  /**
   * Show success notification
   */
  showSuccess(message: string, title = 'Success'): void {
    this.messageService.add({
      severity: 'success',
      summary: title,
      detail: message,
      life: 3000,
    });
  }

  /**
   * Show info notification
   */
  showInfo(message: string, title = 'Information'): void {
    this.messageService.add({
      severity: 'info',
      summary: title,
      detail: message,
      life: 5000,
    });
  }

  /**
   * Show warning notification
   */
  showWarning(message: string, title = 'Warning'): void {
    this.messageService.add({
      severity: 'warn',
      summary: title,
      detail: message,
      life: 5000,
    });
  }

  /**
   * Clear all notifications
   */
  clear(): void {
    this.messageService.clear();
  }

  /**
   * Clear a specific notification by key
   */
  clearByKey(key: string): void {
    this.messageService.clear(key);
  }

  /**
   * Map ErrorSeverity to PrimeNG severity
   */
  private mapSeverityToToast(
    severity: ErrorSeverity
  ): 'success' | 'info' | 'warn' | 'error' {
    switch (severity) {
      case ErrorSeverity.INFO:
        return 'info';
      case ErrorSeverity.WARNING:
        return 'warn';
      case ErrorSeverity.ERROR:
      case ErrorSeverity.CRITICAL:
        return 'error';
      default:
        return 'error';
    }
  }

  /**
   * Get user-friendly title for error category
   */
  private getCategoryTitle(category: ErrorCategory): string {
    switch (category) {
      case ErrorCategory.NETWORK:
        return 'Network Error';
      case ErrorCategory.SERVER:
        return 'Server Error';
      case ErrorCategory.VALIDATION:
        return 'Validation Error';
      case ErrorCategory.AUTHENTICATION:
        return 'Authentication Error';
      case ErrorCategory.AUTHORIZATION:
        return 'Authorization Error';
      case ErrorCategory.NOT_FOUND:
        return 'Not Found';
      case ErrorCategory.TIMEOUT:
        return 'Timeout Error';
      case ErrorCategory.UNKNOWN:
      default:
        return 'Error';
    }
  }
}
