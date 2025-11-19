/**
 * Generic Column Management Models
 * Domain-agnostic column visibility, ordering, and sizing configuration
 */

/**
 * Column state for a single column
 */
export interface ColumnState {
  /**
   * Column identifier (field name)
   */
  field: string;

  /**
   * Column header/label
   */
  header: string;

  /**
   * Whether the column is visible
   * @default true
   */
  visible: boolean;

  /**
   * Display order (0-based index)
   */
  order: number;

  /**
   * Column width in pixels or percentage
   */
  width?: string;

  /**
   * Minimum width in pixels
   */
  minWidth?: string;

  /**
   * Whether the column is locked/pinned
   * Locked columns cannot be hidden or reordered
   * @default false
   */
  locked?: boolean;

  /**
   * Additional metadata
   */
  metadata?: Record<string, any>;
}

/**
 * Complete column configuration state
 */
export interface ColumnConfiguration {
  /**
   * Array of column states
   */
  columns: ColumnState[];

  /**
   * Configuration version (for migration)
   */
  version?: string;

  /**
   * Last modified timestamp
   */
  lastModified?: Date;
}

/**
 * Column manager configuration
 */
export interface ColumnManagerConfig {
  /**
   * Unique identifier for this column configuration
   * Used for persistence (e.g., 'vehicle-table-columns')
   */
  id: string;

  /**
   * Display title for column manager
   * @default 'Manage Columns'
   */
  title?: string;

  /**
   * Whether to enable column visibility toggles
   * @default true
   */
  allowToggleVisibility?: boolean;

  /**
   * Whether to enable column reordering
   * @default true
   */
  allowReorder?: boolean;

  /**
   * Whether to enable column width adjustment
   * @default true
   */
  allowResize?: boolean;

  /**
   * Whether to persist column state
   * @default true
   */
  persistState?: boolean;

  /**
   * Storage key for persistence
   * If not provided, will use id
   */
  storageKey?: string;

  /**
   * Minimum number of visible columns
   * Prevents hiding all columns
   * @default 1
   */
  minVisibleColumns?: number;

  /**
   * Whether to show reset button
   * @default true
   */
  showReset?: boolean;

  /**
   * Custom CSS class
   */
  styleClass?: string;
}

/**
 * Column manager event - column visibility changed
 */
export interface ColumnVisibilityChangeEvent {
  /**
   * The column field that changed
   */
  field: string;

  /**
   * New visibility state
   */
  visible: boolean;

  /**
   * All column states after change
   */
  columnStates: ColumnState[];
}

/**
 * Column manager event - column order changed
 */
export interface ColumnOrderChangeEvent {
  /**
   * Previous order of columns (by field)
   */
  previousOrder: string[];

  /**
   * New order of columns (by field)
   */
  newOrder: string[];

  /**
   * All column states after change
   */
  columnStates: ColumnState[];
}

/**
 * Column manager event - column width changed
 */
export interface ColumnWidthChangeEvent {
  /**
   * The column field that changed
   */
  field: string;

  /**
   * Previous width
   */
  previousWidth?: string;

  /**
   * New width
   */
  newWidth: string;

  /**
   * All column states after change
   */
  columnStates: ColumnState[];
}

/**
 * Column manager event - configuration reset
 */
export interface ColumnResetEvent {
  /**
   * Previous column states
   */
  previousStates: ColumnState[];

  /**
   * New (default) column states
   */
  newStates: ColumnState[];
}

/**
 * Column preset - saved column configuration
 */
export interface ColumnPreset {
  /**
   * Preset identifier
   */
  id: string;

  /**
   * Preset name/label
   */
  name: string;

  /**
   * Preset description
   */
  description?: string;

  /**
   * Column states for this preset
   */
  columnStates: ColumnState[];

  /**
   * Whether this is the default preset
   */
  isDefault?: boolean;

  /**
   * Creation timestamp
   */
  createdAt?: Date;
}

/**
 * Column group - for organizing columns
 */
export interface ColumnGroup {
  /**
   * Group identifier
   */
  id: string;

  /**
   * Group label
   */
  label: string;

  /**
   * Column fields in this group
   */
  columns: string[];

  /**
   * Whether the group is expanded in UI
   * @default true
   */
  expanded?: boolean;
}
