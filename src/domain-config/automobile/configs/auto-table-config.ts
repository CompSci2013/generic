import { AutoData } from '../models';

/**
 * Table column configuration interface.
 * This matches the generic TableColumn<T> interface from the framework.
 */
export interface TableColumn<T> {
  /** Field name from data model */
  field: keyof T;
  /** Display header text */
  header: string;
  /** Whether column is sortable */
  sortable?: boolean;
  /** Whether column is filterable */
  filterable?: boolean;
  /** Column width (CSS value) */
  width?: string;
  /** Text alignment */
  align?: 'left' | 'right' | 'center';
  /** Custom formatter function */
  formatter?: (value: any) => string;
}

/**
 * Table column configuration for automobile data.
 *
 * Defines how AutoData fields are displayed in the table component.
 * This configuration will be used by the generic base table component (F6).
 *
 * NOTE: Domain-specific configuration - uses automobile field names.
 */
export const AUTO_TABLE_COLUMNS: TableColumn<AutoData>[] = [
  {
    field: 'manufacturer',
    header: 'Manufacturer',
    sortable: true,
    filterable: true,
    width: '200px',
    align: 'left'
  },
  {
    field: 'model',
    header: 'Model',
    sortable: true,
    filterable: true,
    width: '200px',
    align: 'left'
  },
  {
    field: 'year',
    header: 'Year',
    sortable: true,
    filterable: true,
    width: '100px',
    align: 'center'
  },
  {
    field: 'bodyClass',
    header: 'Body Class',
    sortable: true,
    filterable: true,
    width: '150px',
    align: 'left'
  },
  {
    field: 'vinCount',
    header: 'VIN Count',
    sortable: true,
    filterable: false,
    width: '120px',
    align: 'right',
    formatter: (value: number) => value != null ? value.toLocaleString() : '0'
  },
  {
    field: 'dataSource',
    header: 'Data Source',
    sortable: true,
    filterable: true,
    width: '150px',
    align: 'left'
  }
];
