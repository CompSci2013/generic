import { TemplateRef } from '@angular/core';

/**
 * Defines the structure and behavior of a table column
 * Fully generic - works with any data type
 */
export interface TableColumn<TData> {
  /**
   * Unique identifier for the column
   * Should match a property key in TData or be a custom identifier for template columns
   */
  field: keyof TData | string;

  /**
   * Display label for column header
   */
  header: string;

  /**
   * Whether column supports sorting
   * @default false
   */
  sortable?: boolean;

  /**
   * Whether column can be hidden by user
   * @default true
   */
  hideable?: boolean;

  /**
   * Whether column is currently visible
   * @default true
   */
  visible?: boolean;

  /**
   * Column width (CSS value: '100px', '20%', 'auto', etc.)
   */
  width?: string;

  /**
   * Minimum width to prevent column from being too narrow
   */
  minWidth?: string;

  /**
   * Text alignment in cells
   * @default 'left'
   */
  align?: 'left' | 'center' | 'right';

  /**
   * Custom template for rendering cell content
   * If provided, this template will be used instead of default rendering
   */
  template?: TemplateRef<any>;

  /**
   * Simple formatter function for cell values
   * Used when no template is provided
   * @param value - The value from the data row
   * @param row - The complete data row
   * @returns Formatted string or number for display
   */
  formatter?: (value: any, row: TData) => string | number;

  /**
   * CSS class to apply to cells in this column
   */
  cssClass?: string;

  /**
   * Whether this column can be filtered
   * @default false
   */
  filterable?: boolean;
}
