import { Injectable, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import {
  PopOutConfig,
  PopOutWindowRef,
  PopOutWindowOptions,
  PopOutMessage,
  PopOutMessageType,
  PopOutContext
} from '../models/popout-config';

/**
 * Service for managing pop-out windows and cross-window communication.
 *
 * This service provides:
 * - Opening and managing pop-out windows
 * - BroadcastChannel-based communication between windows
 * - State synchronization across windows
 * - Window lifecycle management
 *
 * State synchronization happens automatically via URL (F3 integration).
 * This service handles window management and messaging.
 *
 * @example
 * ```typescript
 * // Open a pop-out window
 * const windowRef = popOutService.openPopOut({
 *   id: 'table-detail',
 *   title: 'Data Details',
 *   route: '/detail',
 *   queryParams: { id: '123' }
 * });
 *
 * // Send state to all pop-outs
 * popOutService.syncState({ filters: {...}, page: 1 });
 *
 * // Listen for messages from other windows
 * popOutService.messages$.subscribe(msg => {
 *   console.log('Received:', msg);
 * });
 * ```
 */
@Injectable({
  providedIn: 'root'
})
export class PopoutContextService implements OnDestroy {
  /**
   * BroadcastChannel for cross-window communication.
   * Uses 'popout-channel' as the channel name.
   */
  private broadcastChannel: BroadcastChannel | null = null;

  /**
   * Map of opened pop-out windows.
   */
  private openWindows = new Map<string, PopOutWindowRef>();

  /**
   * Current window context.
   */
  private contextSubject = new BehaviorSubject<PopOutContext>({
    isPopOut: this.isPopOutWindow(),
    windowId: this.generateWindowId(),
    route: ''
  });

  /**
   * Subject for incoming messages.
   */
  private messageSubject = new Subject<PopOutMessage>();

  /**
   * Observable stream of the current window context.
   */
  public context$: Observable<PopOutContext> = this.contextSubject.asObservable();

  /**
   * Observable stream of incoming messages from other windows.
   */
  public messages$: Observable<PopOutMessage> = this.messageSubject.asObservable();

  /**
   * Interval for checking if windows are still open.
   */
  private checkWindowsInterval: any;

  constructor(private router: Router) {
    this.initializeBroadcastChannel();
    this.startWindowMonitoring();
    this.updateContextRoute();
  }

  ngOnDestroy(): void {
    this.closeAll();
    this.closeBroadcastChannel();
    if (this.checkWindowsInterval) {
      clearInterval(this.checkWindowsInterval);
    }
  }

  /**
   * Opens a new pop-out window.
   *
   * @param config - Configuration for the pop-out window
   * @returns Reference to the opened window, or null if opening failed
   */
  openPopOut(config: PopOutConfig): PopOutWindowRef | null {
    const options = this.buildWindowOptions(config.windowOptions);
    const url = this.buildUrl(config.route, config.queryParams);

    // Open the window
    const newWindow = window.open(url, config.id, options);

    if (!newWindow) {
      console.error('PopOutContextService: Failed to open window. Popup blocked?');
      return null;
    }

    // Create window reference
    const windowRef: PopOutWindowRef = {
      id: config.id,
      window: newWindow,
      route: config.route,
      openedAt: new Date(),
      isOpen: true
    };

    // Store reference
    this.openWindows.set(config.id, windowRef);

    // Notify other windows
    this.sendMessage({
      type: PopOutMessageType.WINDOW_OPENED,
      sourceWindowId: this.getWindowId(),
      payload: { windowId: config.id, route: config.route }
    });

    return windowRef;
  }

  /**
   * Closes a specific pop-out window.
   *
   * @param windowId - ID of the window to close
   */
  closePopOut(windowId: string): void {
    const windowRef = this.openWindows.get(windowId);
    if (windowRef && windowRef.isOpen) {
      // Notify before closing
      this.sendMessage({
        type: PopOutMessageType.WINDOW_CLOSING,
        sourceWindowId: this.getWindowId(),
        payload: { windowId }
      });

      // Close the window
      windowRef.window.close();
      windowRef.isOpen = false;

      // Remove from map
      this.openWindows.delete(windowId);
    }
  }

  /**
   * Closes all opened pop-out windows.
   */
  closeAll(): void {
    const windowIds = Array.from(this.openWindows.keys());
    windowIds.forEach(id => this.closePopOut(id));
  }

  /**
   * Synchronizes state to all pop-out windows.
   *
   * Note: State synchronization typically happens via URL (F3).
   * This method is for explicit state updates if needed.
   *
   * @param state - State to synchronize
   */
  syncState<TState>(state: TState): void {
    this.sendMessage({
      type: PopOutMessageType.STATE_SYNC,
      sourceWindowId: this.getWindowId(),
      payload: state
    });
  }

  /**
   * Sends a custom message to other windows.
   *
   * @param message - Message to send
   */
  sendMessage<TPayload = any>(message: Omit<PopOutMessage<TPayload>, 'timestamp'>): void {
    if (!this.broadcastChannel) {
      console.warn('PopOutContextService: BroadcastChannel not available');
      return;
    }

    const fullMessage: PopOutMessage<TPayload> = {
      ...message,
      timestamp: Date.now()
    };

    try {
      this.broadcastChannel.postMessage(fullMessage);
    } catch (error) {
      console.error('PopOutContextService: Error sending message', error);
    }
  }

  /**
   * Gets the current window context.
   *
   * @returns Current context
   */
  getContext(): PopOutContext {
    return this.contextSubject.value;
  }

  /**
   * Gets the current window ID.
   *
   * @returns Window ID
   */
  getWindowId(): string {
    return this.contextSubject.value.windowId;
  }

  /**
   * Checks if the current window is a pop-out.
   *
   * @returns True if pop-out, false if parent
   */
  isPopOut(): boolean {
    return this.contextSubject.value.isPopOut;
  }

  /**
   * Gets all currently opened pop-out window references.
   *
   * @returns Array of window references
   */
  getOpenWindows(): PopOutWindowRef[] {
    return Array.from(this.openWindows.values()).filter(ref => ref.isOpen);
  }

  /**
   * Initializes the BroadcastChannel for cross-window communication.
   */
  private initializeBroadcastChannel(): void {
    if (typeof BroadcastChannel === 'undefined') {
      console.warn('PopOutContextService: BroadcastChannel not supported in this browser');
      return;
    }

    try {
      this.broadcastChannel = new BroadcastChannel('popout-channel');

      this.broadcastChannel.onmessage = (event: MessageEvent<PopOutMessage>) => {
        const message = event.data;

        // Don't process our own messages
        if (message.sourceWindowId === this.getWindowId()) {
          return;
        }

        // Emit message to subscribers
        this.messageSubject.next(message);

        // Handle specific message types
        this.handleMessage(message);
      };
    } catch (error) {
      console.error('PopOutContextService: Error initializing BroadcastChannel', error);
    }
  }

  /**
   * Closes the BroadcastChannel.
   */
  private closeBroadcastChannel(): void {
    if (this.broadcastChannel) {
      this.broadcastChannel.close();
      this.broadcastChannel = null;
    }
  }

  /**
   * Handles incoming messages.
   *
   * @param message - The message to handle
   */
  private handleMessage(message: PopOutMessage): void {
    switch (message.type) {
      case PopOutMessageType.WINDOW_CLOSING:
        // Clean up reference if we're tracking this window
        const windowId = message.payload?.windowId;
        if (windowId && this.openWindows.has(windowId)) {
          this.openWindows.delete(windowId);
        }
        break;

      case PopOutMessageType.REQUEST_STATE:
        // Parent can respond with current state
        // Implementation depends on state management strategy
        break;

      default:
        // Other message types handled by subscribers
        break;
    }
  }

  /**
   * Builds window.open() options string from configuration.
   *
   * @param options - Window options
   * @returns Formatted options string
   */
  private buildWindowOptions(options?: PopOutWindowOptions): string {
    const defaults: PopOutWindowOptions = {
      width: 1200,
      height: 800,
      menubar: false,
      toolbar: false,
      location: false,
      status: false,
      resizable: true,
      scrollbars: true
    };

    const finalOptions = { ...defaults, ...options };

    // Calculate centered position if not specified
    if (finalOptions.left === undefined) {
      finalOptions.left = Math.max(0, (window.screen.width - finalOptions.width!) / 2);
    }
    if (finalOptions.top === undefined) {
      finalOptions.top = Math.max(0, (window.screen.height - finalOptions.height!) / 2);
    }

    // Build options string
    const parts: string[] = [];
    Object.entries(finalOptions).forEach(([key, value]) => {
      parts.push(`${key}=${value === true ? 'yes' : value === false ? 'no' : value}`);
    });

    return parts.join(',');
  }

  /**
   * Builds a full URL with query parameters.
   *
   * @param route - Route path
   * @param queryParams - Query parameters
   * @returns Full URL string
   */
  private buildUrl(route: string, queryParams?: Record<string, any>): string {
    const baseUrl = window.location.origin;
    const url = new URL(route, baseUrl);

    if (queryParams) {
      Object.entries(queryParams).forEach(([key, value]) => {
        url.searchParams.set(key, String(value));
      });
    }

    return url.toString();
  }

  /**
   * Determines if the current window is a pop-out.
   *
   * @returns True if pop-out
   */
  private isPopOutWindow(): boolean {
    // A window is a pop-out if it was opened by another window
    return window.opener !== null;
  }

  /**
   * Generates a unique window ID.
   *
   * @returns Unique window ID
   */
  private generateWindowId(): string {
    return `window-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Updates the context with the current route.
   */
  private updateContextRoute(): void {
    const currentRoute = this.router.url;
    this.contextSubject.next({
      ...this.contextSubject.value,
      route: currentRoute
    });
  }

  /**
   * Starts monitoring opened windows to detect when they're closed.
   */
  private startWindowMonitoring(): void {
    this.checkWindowsInterval = setInterval(() => {
      this.openWindows.forEach((ref, id) => {
        if (ref.isOpen && ref.window.closed) {
          ref.isOpen = false;
          this.openWindows.delete(id);
        }
      });
    }, 1000); // Check every second
  }
}
