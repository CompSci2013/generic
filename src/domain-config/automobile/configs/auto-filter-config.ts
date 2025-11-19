/**
 * Filter definition interface.
 * This matches the generic FilterDefinition<T> interface from the framework.
 */
export interface FilterDefinition<T> {
  /** Unique filter identifier */
  id: string;
  /** Display label */
  label: string;
  /** Filter type */
  type: 'multi-select' | 'single-select' | 'range' | 'date-range' | 'search' | 'boolean';
  /** Filter options (for select types) */
  options?: Array<{ label: string; value: any }>;
  /** Default value */
  defaultValue?: any;
  /** Placeholder text */
  placeholder?: string;
  /** Validation function */
  validator?: (value: any) => boolean;
  /** Custom value formatter for display */
  formatter?: (value: any) => string;
  /** Help text */
  helpText?: string;
}

/**
 * Filter definitions for automobile search.
 *
 * Defines all available filters for automobile data.
 * This configuration will be used by the generic filter framework (F11).
 *
 * NOTE: Domain-specific configuration - uses automobile filter fields.
 * Options arrays are initially empty and will be populated dynamically from API.
 */
export const AUTO_FILTER_DEFINITIONS: FilterDefinition<any>[] = [
  {
    id: 'manufacturers',
    label: 'Manufacturers',
    type: 'multi-select',
    options: [], // Populated from API
    placeholder: 'Select manufacturers...',
    helpText: 'Filter by vehicle manufacturer'
  },
  {
    id: 'models',
    label: 'Models',
    type: 'multi-select',
    options: [], // Populated from API (dependent on manufacturers)
    placeholder: 'Select models...',
    helpText: 'Filter by vehicle model'
  },
  {
    id: 'yearRange',
    label: 'Year Range',
    type: 'range',
    defaultValue: { min: 2000, max: new Date().getFullYear() },
    placeholder: 'Select year range...',
    helpText: 'Filter by model year',
    formatter: (value: { min: number; max: number }) => {
      return `${value.min} - ${value.max}`;
    }
  },
  {
    id: 'bodyClass',
    label: 'Body Class',
    type: 'multi-select',
    options: [], // Populated from API
    placeholder: 'Select body classes...',
    helpText: 'Filter by vehicle body class (Sedan, SUV, etc.)'
  },
  {
    id: 'dataSource',
    label: 'Data Source',
    type: 'multi-select',
    options: [], // Populated from API
    placeholder: 'Select data sources...',
    helpText: 'Filter by data source (NHTSA, CARFAX, etc.)'
  },
  {
    id: 'vinSearch',
    label: 'VIN Search',
    type: 'search',
    placeholder: 'Enter VIN(s)...',
    helpText: 'Search by Vehicle Identification Number (exact match)',
    validator: (value: string) => {
      // Basic VIN validation: 17 alphanumeric characters (excluding I, O, Q)
      if (!value || value.trim() === '') return true;
      const vinPattern = /^[A-HJ-NPR-Z0-9]{17}$/i;
      const vins = value.split(',').map(v => v.trim());
      return vins.every(vin => vinPattern.test(vin));
    },
    formatter: (value: string) => {
      if (!value) return '';
      const vins = value.split(',').map(v => v.trim());
      if (vins.length === 1) return vins[0];
      return `${vins.length} VINs`;
    }
  }
];
