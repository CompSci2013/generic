import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  OnChanges,
  SimpleChanges,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { TableColumn } from '../base-data-table/models/table-column';
import {
  TablePickerConfig,
  TablePickerSelectionEvent,
} from './models/table-picker-config';

/**
 * Table-based picker component with checkbox selection
 *
 * Features:
 * - Table display with configurable columns
 * - Checkbox selection (multi-select)
 * - Apply/Clear buttons
 * - URL state synchronization
 * - Efficient selection state (Set-based)
 *
 * Based on specification from autos-prime-ng project
 *
 * @template T - The type of items in the picker
 *
 * @example
 * ```html
 * <app-table-picker
 *   [config]="dataSourcePickerConfig"
 *   [preSelectedKeys]="selectedDataSources"
 *   (selectionApply)="onPickerApply($event)"
 *   (selectionClear)="onPickerClear()">
 * </app-table-picker>
 * ```
 */
@Component({
  selector: 'app-table-picker',
  templateUrl: './table-picker.component.html',
  styleUrls: ['./table-picker.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TablePickerComponent<T> implements OnInit, OnChanges, OnDestroy {
  /**
   * Picker configuration
   */
  @Input() config!: TablePickerConfig<T>;

  /**
   * Pre-selected keys (from URL or parent state)
   * These will be auto-selected when data loads
   */
  @Input() preSelectedKeys: string[] = [];

  /**
   * Emitted when user clicks Apply button
   */
  @Output() selectionApply = new EventEmitter<TablePickerSelectionEvent<T>>();

  /**
   * Emitted when user clicks Clear button
   */
  @Output() selectionClear = new EventEmitter<void>();

  /**
   * Table data
   */
  data: T[] = [];

  /**
   * Table columns (with checkbox column prepended)
   */
  columns: TableColumn<T>[] = [];

  /**
   * Loading state
   */
  loading = false;

  /**
   * Selected row keys (efficient O(1) lookups)
   */
  selectedRows = new Set<string>();

  /**
   * Pending keys to select after data loads
   */
  private pendingHydration: string[] = [];

  /**
   * Whether data has been loaded
   */
  private dataLoaded = false;

  /**
   * Cleanup subject
   */
  private destroy$ = new Subject<void>();

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    // Initialize columns (add checkbox column)
    this.initializeColumns();

    // Store pending hydration keys
    if (this.preSelectedKeys && this.preSelectedKeys.length > 0) {
      this.pendingHydration = [...this.preSelectedKeys];
    }

    // Load data
    this.loadData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // React to changes in preSelectedKeys (URL-first paradigm)
    if (changes['preSelectedKeys'] && !changes['preSelectedKeys'].firstChange) {
      const newKeys = changes['preSelectedKeys'].currentValue || [];

      // If data is already loaded, immediately update selection
      if (this.dataLoaded) {
        this.syncSelectionFromKeys(newKeys);
      } else {
        // Otherwise, queue for hydration after data loads
        this.pendingHydration = [...newKeys];
      }
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Initialize table columns (prepend checkbox column)
   */
  private initializeColumns(): void {
    // Checkbox selection column
    const checkboxColumn: TableColumn<T> = {
      field: '__checkbox' as any,
      header: '',
      width: '50px',
      sortable: false,
      filterable: false,
    };

    // Combine checkbox column with config columns
    this.columns = [checkboxColumn, ...this.config.columns];
  }

  /**
   * Load picker data
   */
  private loadData(): void {
    // Use static data if provided
    if (this.config.data) {
      this.data = this.config.data;
      this.onDataLoaded();
      return;
    }

    // Use loadData function if provided
    if (this.config.loadData) {
      this.loading = true;
      this.cdr.markForCheck();

      this.config
        .loadData()
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (data) => {
            this.data = data;
            this.loading = false;
            this.onDataLoaded();
            this.cdr.markForCheck();
          },
          error: (error) => {
            console.error('Error loading picker data:', error);
            this.loading = false;
            this.data = [];
            this.cdr.markForCheck();
          },
        });
    }
  }

  /**
   * Called when data has finished loading
   * Hydrates pre-selected keys
   */
  private onDataLoaded(): void {
    this.dataLoaded = true;

    // Hydrate pre-selected keys
    if (this.pendingHydration.length > 0) {
      this.hydrateSelections();
    }
  }

  /**
   * Hydrate selections from pending keys
   */
  private hydrateSelections(): void {
    this.syncSelectionFromKeys(this.pendingHydration);
    this.pendingHydration = [];
  }

  /**
   * Sync selection state from array of keys (URL-first)
   * This is the single source of truth for selection updates
   */
  private syncSelectionFromKeys(keys: string[]): void {
    // Clear existing selections
    this.selectedRows.clear();

    // Add new selections
    keys.forEach((key) => {
      this.selectedRows.add(key);
    });

    this.cdr.markForCheck();
  }

  /**
   * Check if a row is selected
   */
  isRowSelected(row: T): boolean {
    const key = this.config.selection.keyGenerator(row);
    return this.selectedRows.has(key);
  }

  /**
   * Handle row selection change
   */
  onRowSelectionChange(row: T, event: any): void {
    const key = this.config.selection.keyGenerator(row);
    const checked = event.target.checked || event.checked;

    if (checked) {
      this.selectedRows.add(key);
    } else {
      this.selectedRows.delete(key);
    }

    this.cdr.markForCheck();
  }

  /**
   * Handle Apply button click
   */
  onApply(): void {
    // Get selected items from data
    const selectedItems = this.data.filter((row) => {
      const key = this.config.selection.keyGenerator(row);
      return this.selectedRows.has(key);
    });

    // Serialize to URL value
    const urlValue = this.config.selection.serializer(selectedItems);

    // Emit selection event
    const event: TablePickerSelectionEvent<T> = {
      pickerId: this.config.id,
      selections: selectedItems,
      selectedKeys: Array.from(this.selectedRows),
      urlParam: this.config.selection.urlParam,
      urlValue: urlValue,
    };

    this.selectionApply.emit(event);
  }

  /**
   * Handle Clear button click
   */
  onClear(): void {
    this.selectedRows.clear();
    this.selectionClear.emit();
    this.cdr.markForCheck();
  }

  /**
   * Get count of selected items
   */
  get selectedCount(): number {
    return this.selectedRows.size;
  }

  /**
   * Get display text for selected count
   */
  get selectedCountText(): string {
    const count = this.selectedCount;
    if (count === 0) {
      return '0 items selected';
    } else if (count === 1) {
      return '1 item selected';
    } else {
      return `${count} items selected`;
    }
  }

  /**
   * Check if Apply button should be enabled
   */
  get canApply(): boolean {
    return this.selectedCount > 0;
  }

  /**
   * Check if Clear button should be enabled
   */
  get canClear(): boolean {
    return this.selectedCount > 0;
  }

  /**
   * Get page size from config
   */
  get pageSize(): number {
    return this.config.pagination?.defaultPageSize || 20;
  }

  /**
   * Get page size options from config
   */
  get pageSizeOptions(): number[] {
    return this.config.pagination?.pageSizeOptions || [10, 20, 50, 100];
  }

  /**
   * Get cell value for display (handles formatter if provided)
   */
  getCellValue(row: T, column: TableColumn<T>): any {
    const field = column.field as string;
    const value = (row as any)[field];

    // Apply formatter if provided
    if (column.formatter) {
      return column.formatter(value, row);
    }

    return value;
  }
}
