/**
 * Error severity levels
 */
export enum ErrorSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical',
}

/**
 * Error categories for classification
 */
export enum ErrorCategory {
  NETWORK = 'network',
  SERVER = 'server',
  VALIDATION = 'validation',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  NOT_FOUND = 'not_found',
  TIMEOUT = 'timeout',
  UNKNOWN = 'unknown',
}

/**
 * Information about an error
 * Domain-agnostic error representation
 */
export interface ErrorInfo {
  /**
   * Error category
   */
  category: ErrorCategory;

  /**
   * Error severity
   */
  severity: ErrorSeverity;

  /**
   * User-friendly error message
   */
  message: string;

  /**
   * Technical error details (for logging)
   */
  details?: string;

  /**
   * HTTP status code (if applicable)
   */
  statusCode?: number;

  /**
   * Timestamp when error occurred
   */
  timestamp: Date;

  /**
   * Original error object
   */
  originalError?: Error | any;

  /**
   * Additional context data
   */
  context?: Record<string, any>;

  /**
   * Whether the error can be retried
   */
  retryable?: boolean;

  /**
   * Stack trace
   */
  stack?: string;
}

/**
 * Notification options for displaying errors to users
 */
export interface ErrorNotificationOptions {
  /**
   * Notification title
   */
  title?: string;

  /**
   * Notification message
   */
  message: string;

  /**
   * Severity level for styling
   */
  severity?: 'success' | 'info' | 'warn' | 'error';

  /**
   * Duration in milliseconds (0 for sticky)
   * @default 5000
   */
  life?: number;

  /**
   * Whether notification is closable
   * @default true
   */
  closable?: boolean;

  /**
   * Additional data to include
   */
  data?: any;
}
