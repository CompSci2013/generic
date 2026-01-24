import { Observable } from 'rxjs';
import { TableColumn } from '../../base-data-table/models/table-column';

/**
 * Configuration for table-based picker component
 * Based on specification from autos-prime-ng project
 *
 * @template T - The type of items in the picker table
 */
export interface TablePickerConfig<T> {
  /** Unique identifier for this picker */
  id: string;

  /** Display name shown in picker header */
  displayName: string;

  /** Table column definitions */
  columns: TableColumn<T>[];

  /** Selection configuration */
  selection: {
    /** URL parameter name for this picker */
    urlParam: string;

    /** Convert selected items to URL string */
    serializer: (items: T[]) => string;

    /** Convert URL string to selected items */
    deserializer: (urlValue: string) => Partial<T>[];

    /** Generate unique key for a row */
    keyGenerator: (item: T) => string;

    /** Parse key back to item (for hydration) */
    keyParser: (key: string) => Partial<T>;
  };

  /** Pagination configuration */
  pagination?: {
    /** Client-side or server-side pagination */
    mode: 'client' | 'server';

    /** Default page size */
    defaultPageSize?: number;

    /** Available page size options */
    pageSizeOptions?: number[];
  };

  /** Optional: Function to load data */
  loadData?: () => Observable<T[]>;

  /** Optional: Static data (alternative to loadData) */
  data?: T[];

  /** Optional: Caching configuration */
  caching?: {
    enabled: boolean;
    ttl?: number;  // milliseconds
  };
}

/**
 * Selection event emitted when user applies selection
 */
export interface TablePickerSelectionEvent<T> {
  /** Picker ID */
  pickerId: string;

  /** Selected items */
  selections: T[];

  /** Selected keys (for efficient lookups) */
  selectedKeys: string[];

  /** URL parameter name */
  urlParam: string;

  /** Serialized URL value */
  urlValue: string;
}
