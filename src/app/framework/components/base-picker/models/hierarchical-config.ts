import { Observable } from 'rxjs';
import { PickerConfig } from './picker-config';

/**
 * Configuration for a single level in a hierarchical picker
 * Each level can have its own picker configuration
 *
 * @template TItem - The type of items at this level
 */
export interface HierarchyLevel<TItem> {
  /**
   * Unique identifier for this level
   */
  id: string;

  /**
   * Label for this level (e.g., "Country", "State", "City")
   */
  label: string;

  /**
   * Picker configuration for this level
   */
  pickerConfig: PickerConfig<TItem>;

  /**
   * Function to load items for this level based on parent selection
   * If undefined, items must be provided via pickerConfig.items
   */
  loadItems?: (parentValue?: any) => Observable<TItem[]>;

  /**
   * Field in items of THIS level that references the parent level
   * Used for filtering when parent changes
   */
  parentReferenceField?: keyof TItem;

  /**
   * Whether this level is the root level (no parent)
   * @default false
   */
  isRoot?: boolean;
}

/**
 * Selection result for a hierarchical picker
 * Contains selections from all levels
 */
export interface HierarchySelection {
  /**
   * Map of level ID to selected value(s)
   * Key: level.id
   * Value: selected item(s) at that level
   */
  selections: Map<string, any>;

  /**
   * Array of selections in level order (root to leaf)
   */
  selectionPath: any[];

  /**
   * The final/deepest selection (leaf node)
   */
  leafSelection: any;

  /**
   * Whether all required levels have selections
   */
  isComplete: boolean;
}

/**
 * Configuration for a hierarchical (N-level cascading) picker
 *
 * Supports any number of levels: country → state → city,
 * manufacturer → model → trim, category → subcategory → item, etc.
 *
 * @example
 * ```typescript
 * // 3-level hierarchy: Country → State → City
 * const config: HierarchicalPickerConfig = {
 *   id: 'location-picker',
 *   label: 'Select Location',
 *   levels: [
 *     {
 *       id: 'country',
 *       label: 'Country',
 *       pickerConfig: {
 *         id: 'country-picker',
 *         label: 'Country',
 *         displayField: 'name',
 *         valueField: 'code',
 *         searchFields: ['name'],
 *         multiSelect: false
 *       },
 *       loadItems: () => countryService.getCountries(),
 *       isRoot: true
 *     },
 *     {
 *       id: 'state',
 *       label: 'State',
 *       pickerConfig: {
 *         id: 'state-picker',
 *         label: 'State',
 *         displayField: 'name',
 *         valueField: 'code',
 *         searchFields: ['name'],
 *         multiSelect: false
 *       },
 *       loadItems: (countryCode) => stateService.getStatesByCountry(countryCode),
 *       parentReferenceField: 'countryCode'
 *     },
 *     {
 *       id: 'city',
 *       label: 'City',
 *       pickerConfig: {
 *         id: 'city-picker',
 *         label: 'City',
 *         displayField: 'name',
 *         valueField: 'id',
 *         searchFields: ['name'],
 *         multiSelect: false
 *       },
 *       loadItems: (stateCode) => cityService.getCitiesByState(stateCode),
 *       parentReferenceField: 'stateCode'
 *     }
 *   ],
 *   allowPartialSelection: false,
 *   clearable: true
 * };
 * ```
 */
export interface HierarchicalPickerConfig {
  /**
   * Unique identifier for this hierarchical picker
   */
  id: string;

  /**
   * Display label for the hierarchical picker
   */
  label: string;

  /**
   * Description or help text
   */
  description?: string;

  /**
   * Array of hierarchy levels in order (root to leaf)
   * Minimum 2 levels required
   */
  levels: HierarchyLevel<any>[];

  /**
   * Whether to allow partial selection (selection stops before leaf level)
   * @default false
   */
  allowPartialSelection?: boolean;

  /**
   * Whether to show a clear/reset button
   * @default true
   */
  clearable?: boolean;

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
   * Custom CSS class
   */
  styleClass?: string;

  /**
   * Orientation of level pickers
   * @default 'vertical'
   */
  orientation?: 'vertical' | 'horizontal';

  /**
   * Whether to show level labels
   * @default true
   */
  showLabels?: boolean;

  /**
   * Whether to show breadcrumb trail of selections
   * @default true
   */
  showBreadcrumb?: boolean;

  /**
   * Whether to auto-select if only one option available at a level
   * @default false
   */
  autoSelectSingle?: boolean;

  /**
   * Whether to disable parent levels after selection (prevent changing once selected)
   * @default false
   */
  lockParentLevels?: boolean;
}

/**
 * Internal state for tracking hierarchical picker selections
 */
export interface HierarchyState {
  /**
   * Map of level ID to current items available at that level
   */
  levelItems: Map<string, any[]>;

  /**
   * Map of level ID to current selection at that level
   */
  levelSelections: Map<string, any>;

  /**
   * Map of level ID to loading state
   */
  levelLoading: Map<string, boolean>;

  /**
   * Index of the currently active level (0-based)
   */
  activeLevel: number;

  /**
   * Whether the hierarchy selection is complete
   */
  isComplete: boolean;
}
