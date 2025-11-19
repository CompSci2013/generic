/**
 * Configuration options for opening a pop-out window.
 */
export interface PopOutWindowOptions {
  /** Window width in pixels. Default: 1200 */
  width?: number;

  /** Window height in pixels. Default: 800 */
  height?: number;

  /** Window position from left edge in pixels. Default: centered */
  left?: number;

  /** Window position from top edge in pixels. Default: centered */
  top?: number;

  /** Whether to show menubar. Default: false */
  menubar?: boolean;

  /** Whether to show toolbar. Default: false */
  toolbar?: boolean;

  /** Whether to show location bar. Default: false */
  location?: boolean;

  /** Whether to show status bar. Default: false */
  status?: boolean;

  /** Whether window is resizable. Default: true */
  resizable?: boolean;

  /** Whether to show scrollbars. Default: true */
  scrollbars?: boolean;
}

/**
 * Configuration for a pop-out window.
 */
export interface PopOutConfig {
  /** Unique identifier for this pop-out window */
  id: string;

  /** Window title */
  title: string;

  /** Route path to navigate to in the pop-out window */
  route: string;

  /** Query parameters to pass to the route */
  queryParams?: Record<string, any>;

  /** Window display options */
  windowOptions?: PopOutWindowOptions;
}

/**
 * Represents a reference to an opened pop-out window.
 */
export interface PopOutWindowRef {
  /** Unique identifier for this pop-out */
  id: string;

  /** Native window object reference */
  window: Window;

  /** Route path being displayed */
  route: string;

  /** Timestamp when window was opened */
  openedAt: Date;

  /** Whether the window is still open */
  isOpen: boolean;
}

/**
 * Message types for cross-window communication via BroadcastChannel.
 */
export enum PopOutMessageType {
  /** Synchronize state from parent to child */
  STATE_SYNC = 'STATE_SYNC',

  /** Notify that a window is closing */
  WINDOW_CLOSING = 'WINDOW_CLOSING',

  /** Notify that a window has opened */
  WINDOW_OPENED = 'WINDOW_OPENED',

  /** Request state from parent */
  REQUEST_STATE = 'REQUEST_STATE',

  /** Generic event notification */
  EVENT = 'EVENT'
}

/**
 * Message structure for cross-window communication.
 *
 * @template TPayload - The type of data in the message payload
 */
export interface PopOutMessage<TPayload = any> {
  /** Message type */
  type: PopOutMessageType;

  /** Window ID that sent the message */
  sourceWindowId: string;

  /** Optional target window ID (null = broadcast to all) */
  targetWindowId?: string | null;

  /** Message payload */
  payload: TPayload;

  /** Timestamp when message was sent */
  timestamp: number;
}

/**
 * Context information about the current window (parent or pop-out).
 */
export interface PopOutContext {
  /** Whether this window is a pop-out (true) or parent (false) */
  isPopOut: boolean;

  /** Unique ID for this window */
  windowId: string;

  /** ID of the parent window (if this is a pop-out) */
  parentWindowId?: string;

  /** Route path of this window */
  route: string;
}
