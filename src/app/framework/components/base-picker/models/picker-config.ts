import { Observable } from 'rxjs';

/**
 * Configuration for cascading (hierarchical) picker relationships
 */
export interface CascadingConfig<TParent, TChild> {
  /**
   * Field in child item that references parent
   */
  parentField: keyof TChild;

  /**
   * Function to load child items based on parent selection
   */
  loadChildren: (parent: TParent) => Observable<TChild[]>;
}

/**
 * Configuration for a generic picker component
 * Fully generic - works with any item type
 *
 * @template TItem - The type of items in the picker
 */
export interface PickerConfig<TItem> {
  /**
   * Unique identifier for this picker
   */
  id: string;

  /**
   * Display label for the picker
   */
  label: string;

  /**
   * Placeholder text when no selection
   */
  placeholder?: string;

  /**
   * API endpoint for fetching items (if using API)
   */
  apiEndpoint?: string;

  /**
   * Static list of items (alternative to API)
   */
  items?: TItem[];

  /**
   * Field to use as the display label
   * Can be a field name or a function that returns the display string
   */
  displayField: keyof TItem | ((item: TItem) => string);

  /**
   * Field to use as the unique value/key
   */
  valueField: keyof TItem;

  /**
   * Fields to search when filtering
   */
  searchFields?: (keyof TItem)[];

  /**
   * Whether multiple items can be selected
   * @default false
   */
  multiSelect?: boolean;

  /**
   * Whether to show search/filter input
   * @default true
   */
  searchable?: boolean;

  /**
   * Whether to enable lazy loading of items
   * @default false
   */
  lazyLoad?: boolean;

  /**
   * Number of items to load per page (for lazy loading)
   * @default 20
   */
  pageSize?: number;

  /**
   * Custom function to load items
   * Provides full control over data fetching
   */
  loadItems?: (query?: string, page?: number) => Observable<TItem[]>;

  /**
   * Cascading configuration for hierarchical pickers
   */
  cascading?: CascadingConfig<any, TItem>;

  /**
   * Whether the picker is disabled
   * @default false
   */
  disabled?: boolean;

  /**
   * Whether the picker is required
   * @default false
   */
  required?: boolean;

  /**
   * Custom CSS class for the picker
   */
  styleClass?: string;

  /**
   * Width of the picker dropdown
   */
  dropdownWidth?: string;

  /**
   * Maximum height of the dropdown list
   */
  maxHeight?: string;

  /**
   * Whether to show clear button
   * @default true
   */
  showClear?: boolean;

  /**
   * Custom template for rendering items in the list
   */
  itemTemplate?: any;

  /**
   * Custom template for rendering selected item(s)
   */
  selectedItemTemplate?: any;
}
