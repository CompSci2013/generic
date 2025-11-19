import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  TemplateRef,
  ChangeDetectorRef,
  OnDestroy,
} from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { TableColumn } from './models/table-column';
import {
  SortEvent,
  PageEvent,
  RowSelectEvent,
  RowExpandEvent,
  RowCollapseEvent,
} from './models/table-event';
import { DetailConfig, DetailState } from './models/detail-config';

/**
 * Generic base table component that works with any data type
 *
 * Features:
 * - Fully generic with type parameter TData
 * - Configuration-driven columns
 * - Sorting support (server-side)
 * - Pagination support
 * - Row selection
 * - Row expansion with lazy loading
 * - Nested detail tables
 * - Detail data caching
 * - Loading state
 * - Responsive design
 * - Accessibility built-in
 *
 * @template TData - The type of data displayed in the table
 * @template TDetail - The type of detail data (for row expansion)
 *
 * @example
 * ```typescript
 * interface Product {
 *   id: number;
 *   name: string;
 *   price: number;
 * }
 *
 * columns: TableColumn<Product>[] = [
 *   { field: 'id', header: 'ID', sortable: true },
 *   { field: 'name', header: 'Name', sortable: true },
 *   { field: 'price', header: 'Price', sortable: true,
 *     formatter: (value) => `$${value.toFixed(2)}` }
 * ];
 *
 * <base-data-table
 *   [data]="products"
 *   [columns]="columns"
 *   [totalRecords]="total"
 *   [loading]="isLoading"
 *   (sortChange)="onSort($event)"
 *   (pageChange)="onPageChange($event)">
 * </base-data-table>
 * ```
 */
@Component({
  selector: 'app-base-data-table',
  templateUrl: './base-data-table.component.html',
  styleUrls: ['./base-data-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BaseDataTableComponent<TData, TDetail = any> implements OnDestroy {
  /**
   * Array of data to display in the table
   */
  @Input() data: TData[] = [];

  /**
   * Column definitions for the table
   */
  @Input() columns: TableColumn<TData>[] = [];

  /**
   * Total number of records (for pagination)
   */
  @Input() totalRecords = 0;

  /**
   * Loading state indicator
   */
  @Input() loading = false;

  /**
   * Number of rows to display per page
   * @default 20
   */
  @Input() rows = 20;

  /**
   * Whether to show pagination controls
   * @default true
   */
  @Input() paginator = true;

  /**
   * Available page size options
   * @default [10, 20, 50, 100]
   */
  @Input() rowsPerPageOptions = [10, 20, 50, 100];

  /**
   * Whether rows are selectable
   * @default false
   */
  @Input() selectable = false;

  /**
   * Selection mode: single or multiple
   * @default 'single'
   */
  @Input() selectionMode: 'single' | 'multiple' = 'single';

  /**
   * Currently selected row(s)
   */
  @Input() selection?: TData | TData[];

  /**
   * Whether rows can be expanded
   * @default false
   */
  @Input() expandable = false;

  /**
   * Expanded rows (for PrimeNG p-table)
   */
  @Input() expandedRows: { [key: string]: boolean } = {};

  /**
   * Custom template for expanded row content
   * @deprecated Use detailConfig.detailTemplate instead
   */
  @Input() expansionTemplate?: TemplateRef<any>;

  /**
   * Detail configuration for row expansion with lazy loading
   */
  @Input() detailConfig?: DetailConfig<TData, TDetail>;

  /**
   * CSS class to apply to the table
   */
  @Input() styleClass = '';

  /**
   * Maximum height of the table (enables scrolling)
   */
  @Input() scrollHeight?: string;

  /**
   * Whether to show grid lines
   * @default true
   */
  @Input() showGridlines = true;

  /**
   * Whether to stripe rows
   * @default false
   */
  @Input() stripedRows = false;

  /**
   * Whether to highlight row on hover
   * @default true
   */
  @Input() rowHover = true;

  /**
   * Data key for row identification (used for selection and expansion)
   * Should be a unique field in TData
   */
  @Input() dataKey?: string;

  /**
   * Emitted when a column is sorted
   */
  @Output() sortChange = new EventEmitter<SortEvent>();

  /**
   * Emitted when pagination changes
   */
  @Output() pageChange = new EventEmitter<PageEvent>();

  /**
   * Emitted when a row is selected
   */
  @Output() rowSelect = new EventEmitter<RowSelectEvent<TData>>();

  /**
   * Emitted when selection changes
   */
  @Output() selectionChange = new EventEmitter<TData | TData[]>();

  /**
   * Emitted when a row is expanded
   */
  @Output() rowExpand = new EventEmitter<RowExpandEvent<TData>>();

  /**
   * Emitted when a row is collapsed
   */
  @Output() rowCollapse = new EventEmitter<RowCollapseEvent<TData>>();

  /**
   * Internal cache of detail data by parent ID
   */
  private detailCache = new Map<string | number, DetailState<TDetail>>();

  /**
   * Subject for component destruction
   */
  private destroy$ = new Subject<void>();

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Handle sort event from PrimeNG table
   */
  onSort(event: SortEvent): void {
    this.sortChange.emit(event);
  }

  /**
   * Handle page event from PrimeNG table
   */
  onPage(event: PageEvent): void {
    this.pageChange.emit(event);
  }

  /**
   * Handle row selection event
   */
  onRowSelect(event: any): void {
    this.rowSelect.emit({
      data: event.data,
      originalEvent: event.originalEvent,
    });
    this.selectionChange.emit(this.selection);
  }

  /**
   * Handle row expansion event
   */
  onRowExpand(event: any): void {
    // Load detail data if config is provided
    if (this.detailConfig) {
      this.loadDetailData(event.data);
    }

    this.rowExpand.emit({
      data: event.data,
      originalEvent: event.originalEvent,
    });
  }

  /**
   * Handle row collapse event
   */
  onRowCollapse(event: any): void {
    this.rowCollapse.emit({
      data: event.data,
      originalEvent: event.originalEvent,
    });
  }

  /**
   * Get visible columns (columns where visible !== false)
   */
  getVisibleColumns(): TableColumn<TData>[] {
    return this.columns.filter((col) => col.visible !== false);
  }

  /**
   * Get the value from a row for a specific column
   */
  getCellValue(row: TData, column: TableColumn<TData>): any {
    const field = column.field as string;
    const value = (row as any)[field];

    // Apply formatter if provided
    if (column.formatter) {
      return column.formatter(value, row);
    }

    return value;
  }

  /**
   * Get the text alignment class for a column
   */
  getAlignClass(column: TableColumn<TData>): string {
    if (!column.align) {
      return '';
    }
    return `text-${column.align}`;
  }

  /**
   * Track by function for ngFor performance
   */
  trackByField(_index: number, column: TableColumn<TData>): string {
    return column.field as string;
  }

  /**
   * Load detail data for a parent row
   */
  private loadDetailData(parent: TData): void {
    if (!this.detailConfig) {
      return;
    }

    const parentId = this.getParentId(parent);

    // Check cache if caching is enabled
    if (this.detailConfig.cacheDetails !== false) {
      const cached = this.detailCache.get(parentId);
      if (cached && !cached.loading) {
        // Already loaded
        return;
      }
    }

    // Set loading state
    this.detailCache.set(parentId, {
      items: [],
      loading: true,
    });
    this.cdr.markForCheck();

    // Load detail data
    this.detailConfig.loadDetails(parent)
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          console.error('Error loading detail data:', error);
          if (this.detailConfig?.onLoadError) {
            this.detailConfig.onLoadError(parent, error);
          }
          return of([]);
        })
      )
      .subscribe(details => {
        this.detailCache.set(parentId, {
          items: details,
          loading: false,
          loadedAt: new Date(),
        });

        if (this.detailConfig?.onLoadSuccess) {
          this.detailConfig.onLoadSuccess(parent, details);
        }

        this.cdr.markForCheck();
      });
  }

  /**
   * Get unique ID for a parent row
   */
  private getParentId(parent: TData): string | number {
    if (this.detailConfig?.getParentId) {
      return this.detailConfig.getParentId(parent);
    }

    // Fallback to dataKey
    const key = this.dataKey || 'id';
    return (parent as any)[key];
  }

  /**
   * Get detail state for a parent row
   */
  getDetailState(parent: TData): DetailState<TDetail> | undefined {
    const parentId = this.getParentId(parent);
    return this.detailCache.get(parentId);
  }

  /**
   * Check if details are loading for a parent row
   */
  isDetailLoading(parent: TData): boolean {
    const state = this.getDetailState(parent);
    return state?.loading === true;
  }

  /**
   * Get detail items for a parent row
   */
  getDetailItems(parent: TData): TDetail[] {
    const state = this.getDetailState(parent);
    return state?.items || [];
  }

  /**
   * Get detail columns from config
   */
  getDetailColumns(): TableColumn<TDetail>[] {
    return this.detailConfig?.detailColumns || [];
  }

  /**
   * Check if using nested table display mode
   */
  isNestedTableMode(): boolean {
    return this.detailConfig?.displayMode !== 'custom';
  }

  /**
   * Get detail template from config
   */
  getDetailTemplate(): TemplateRef<any> | undefined {
    return this.detailConfig?.detailTemplate || this.expansionTemplate;
  }

  /**
   * Get loading message for details
   */
  getDetailLoadingMessage(): string {
    return this.detailConfig?.loadingMessage || 'Loading...';
  }

  /**
   * Get empty message for details
   */
  getDetailEmptyMessage(): string {
    return this.detailConfig?.emptyMessage || 'No details available';
  }

  /**
   * Clear detail cache
   */
  clearDetailCache(): void {
    this.detailCache.clear();
    this.cdr.markForCheck();
  }

  /**
   * Clear detail cache for specific parent
   */
  clearDetailCacheFor(parent: TData): void {
    const parentId = this.getParentId(parent);
    this.detailCache.delete(parentId);
    this.cdr.markForCheck();
  }

  /**
   * Get detail scroll height (handle undefined)
   */
  getDetailScrollHeight(): string {
    return this.detailConfig?.scrollHeight || '';
  }

  /**
   * Get detail table class (handle undefined)
   */
  getDetailTableClass(): string {
    const baseClass = this.detailConfig?.detailTableClass || '';
    const gridlines = this.detailConfig?.showGridlines !== false ? 'p-datatable-gridlines' : '';
    const striped = this.detailConfig?.stripedRows === true ? 'p-datatable-striped' : '';
    return [baseClass, gridlines, striped].filter(c => c).join(' ');
  }

  /**
   * Get detail rows per page options (handle undefined)
   */
  getDetailRowsPerPageOptions(): number[] {
    return this.detailConfig?.detailRowsPerPageOptions || [10, 20, 50];
  }
}
