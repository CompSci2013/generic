/**
 * Event emitted when a column is sorted
 */
export interface SortEvent {
  /**
   * Field name that was sorted
   */
  field: string;

  /**
   * Sort order: 1 for ascending, -1 for descending, 0 for no sort
   */
  order: 1 | -1 | 0;
}

/**
 * Event emitted when pagination changes
 */
export interface PageEvent {
  /**
   * Zero-indexed position of the first record
   */
  first: number;

  /**
   * Number of records per page
   */
  rows: number;

  /**
   * Current page number (zero-indexed)
   */
  page: number;

  /**
   * Total number of pages
   */
  pageCount: number;
}

/**
 * Event emitted when a row is selected
 */
export interface RowSelectEvent<TData> {
  /**
   * The selected row data
   */
  data: TData;

  /**
   * Original event that triggered the selection
   */
  originalEvent?: Event;
}

/**
 * Event emitted when a row is unselected
 */
export interface RowUnselectEvent<TData> {
  /**
   * The unselected row data
   */
  data: TData;

  /**
   * Original event that triggered the unselection
   */
  originalEvent?: Event;
}

/**
 * Event emitted when a row is expanded
 */
export interface RowExpandEvent<TData> {
  /**
   * The expanded row data
   */
  data: TData;

  /**
   * Original event that triggered the expansion
   */
  originalEvent?: Event;
}

/**
 * Event emitted when a row is collapsed
 */
export interface RowCollapseEvent<TData> {
  /**
   * The collapsed row data
   */
  data: TData;

  /**
   * Original event that triggered the collapse
   */
  originalEvent?: Event;
}
