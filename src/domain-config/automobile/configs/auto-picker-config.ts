/**
 * Picker configuration interface.
 * This matches the generic PickerConfig interface from the framework.
 */
export interface PickerConfig {
  /** Unique picker identifier */
  id: string;
  /** Display label */
  label: string;
  /** Allow multiple selections */
  multiSelect: boolean;
  /** Enable search/filter functionality */
  searchable: boolean;
  /** API endpoint for options (relative to base URL) */
  apiEndpoint: string;
  /** Optional dependency on another picker */
  dependsOn?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Show select all option (for multi-select) */
  showSelectAll?: boolean;
  /** Maximum selections allowed (for multi-select) */
  maxSelections?: number;
  /** Custom option display formatter */
  optionFormatter?: (option: any) => string;
}

/**
 * Picker configurations for automobile filters.
 *
 * Defines the filter pickers for automobile search.
 * This configuration will be used by the generic picker component system (F7).
 *
 * NOTE: Domain-specific configuration - uses automobile filter fields.
 */
export const AUTO_PICKER_CONFIGS: PickerConfig[] = [
  {
    id: 'manufacturers',
    label: 'Manufacturers',
    multiSelect: true,
    searchable: true,
    apiEndpoint: '/vehicles/manufacturers',
    placeholder: 'Select manufacturers...',
    showSelectAll: true
  },
  {
    id: 'models',
    label: 'Models',
    multiSelect: true,
    searchable: true,
    apiEndpoint: '/vehicles/models',
    dependsOn: 'manufacturers', // Filtered by selected manufacturers
    placeholder: 'Select models...',
    showSelectAll: true
  },
  {
    id: 'bodyClass',
    label: 'Body Class',
    multiSelect: true,
    searchable: false,
    apiEndpoint: '/vehicles/body-classes',
    placeholder: 'Select body classes...',
    showSelectAll: true
  },
  {
    id: 'dataSource',
    label: 'Data Source',
    multiSelect: true,
    searchable: false,
    apiEndpoint: '/vehicles/data-sources',
    placeholder: 'Select data sources...',
    showSelectAll: true
  },
  {
    id: 'yearRange',
    label: 'Year Range',
    multiSelect: false,
    searchable: false,
    apiEndpoint: '/vehicles/year-range',
    placeholder: 'Select year range...'
  }
];
