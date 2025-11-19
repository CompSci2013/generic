/**
 * State information for a coordinated request
 */
export interface RequestState {
  /**
   * Whether the request is currently loading
   */
  loading: boolean;

  /**
   * Error from the last request, if any
   */
  error: Error | null;

  /**
   * Timestamp of the last successful update (milliseconds since epoch)
   */
  lastUpdated: number | null;
}
