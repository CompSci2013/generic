import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Subject } from 'rxjs';
import {
  ColumnState,
  ColumnConfiguration,
  ColumnManagerConfig,
  ColumnVisibilityChangeEvent,
  ColumnOrderChangeEvent,
  ColumnWidthChangeEvent,
  ColumnResetEvent
} from '../../core/models/column-management';
import { TableColumn } from '../base-data-table/models/table-column';

/**
 * Generic Column Manager Component
 *
 * Provides UI for managing table columns:
 * - Toggle column visibility
 * - Reorder columns via drag-drop
 * - Adjust column widths
 * - Persist column state to localStorage
 * - Reset to default configuration
 *
 * Works with any data type through generic configuration.
 *
 * @example
 * ```html
 * <app-column-manager
 *   [columns]="tableColumns"
 *   [config]="columnManagerConfig"
 *   (visibilityChange)="onColumnVisibilityChange($event)"
 *   (orderChange)="onColumnOrderChange($event)"
 *   (widthChange)="onColumnWidthChange($event)"
 *   (reset)="onColumnReset($event)">
 * </app-column-manager>
 * ```
 */
@Component({
  selector: 'app-column-manager',
  templateUrl: './column-manager.component.html',
  styleUrls: ['./column-manager.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ColumnManagerComponent implements OnInit, OnDestroy {
  /**
   * Table columns to manage
   */
  @Input() columns: TableColumn<any>[] = [];

  /**
   * Column manager configuration
   */
  @Input() config!: ColumnManagerConfig;

  /**
   * Emitted when column visibility changes
   */
  @Output() visibilityChange = new EventEmitter<ColumnVisibilityChangeEvent>();

  /**
   * Emitted when column order changes
   */
  @Output() orderChange = new EventEmitter<ColumnOrderChangeEvent>();

  /**
   * Emitted when column width changes
   */
  @Output() widthChange = new EventEmitter<ColumnWidthChangeEvent>();

  /**
   * Emitted when configuration is reset
   */
  @Output() configReset = new EventEmitter<ColumnResetEvent>();

  /**
   * Emitted when any column state changes
   */
  @Output() stateChange = new EventEmitter<ColumnState[]>();

  /**
   * Internal column states
   */
  columnStates: ColumnState[] = [];

  /**
   * Default column states (for reset)
   */
  private defaultColumnStates: ColumnState[] = [];

  /**
   * Subject for component destruction
   */
  private destroy$ = new Subject<void>();

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.initializeColumnStates();
    this.loadPersistedState();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Initialize column states from input columns
   */
  private initializeColumnStates(): void {
    this.defaultColumnStates = this.columns.map((col, index) => ({
      field: String(col.field),
      header: col.header,
      visible: col.visible !== false,
      order: index,
      width: col.width,
      minWidth: col.minWidth,
      locked: col.locked || false
    }));

    // Copy as current state
    this.columnStates = JSON.parse(JSON.stringify(this.defaultColumnStates));
  }

  /**
   * Load persisted state from localStorage
   */
  private loadPersistedState(): void {
    if (this.config.persistState === false) {
      return;
    }

    const storageKey = this.getStorageKey();
    const storedJson = localStorage.getItem(storageKey);

    if (storedJson) {
      try {
        const storedConfig: ColumnConfiguration = JSON.parse(storedJson);
        this.applyStoredConfiguration(storedConfig);
      } catch (error) {
        console.error('Error loading column configuration:', error);
      }
    }
  }

  /**
   * Apply stored configuration to current state
   */
  private applyStoredConfiguration(storedConfig: ColumnConfiguration): void {
    // Create a map of stored states by field
    const storedStatesMap = new Map<string, ColumnState>();
    storedConfig.columns.forEach(state => {
      storedStatesMap.set(state.field, state);
    });

    // Apply stored states to current columns
    this.columnStates = this.columnStates.map(state => {
      const storedState = storedStatesMap.get(state.field);
      if (storedState) {
        // Merge stored state with default state
        return {
          ...state,
          visible: storedState.visible,
          order: storedState.order,
          width: storedState.width,
          minWidth: storedState.minWidth
        };
      }
      return state;
    });

    // Sort by order
    this.columnStates.sort((a, b) => a.order - b.order);
  }

  /**
   * Persist current state to localStorage
   */
  private persistState(): void {
    if (this.config.persistState === false) {
      return;
    }

    const storageKey = this.getStorageKey();
    const configuration: ColumnConfiguration = {
      columns: this.columnStates,
      version: '1.0',
      lastModified: new Date()
    };

    try {
      localStorage.setItem(storageKey, JSON.stringify(configuration));
    } catch (error) {
      console.error('Error persisting column configuration:', error);
    }
  }

  /**
   * Get storage key for persistence
   */
  private getStorageKey(): string {
    return this.config.storageKey || `column-manager-${this.config.id}`;
  }

  /**
   * Handle column visibility toggle
   */
  onToggleVisibility(columnState: ColumnState): void {
    if (columnState.locked) {
      return;
    }

    // Check minimum visible columns
    const visibleCount = this.columnStates.filter(s => s.visible).length;
    const minVisible = this.config.minVisibleColumns || 1;

    if (columnState.visible && visibleCount <= minVisible) {
      // Cannot hide - would go below minimum
      return;
    }

    // Toggle visibility
    columnState.visible = !columnState.visible;

    // Emit event
    this.visibilityChange.emit({
      field: columnState.field,
      visible: columnState.visible,
      columnStates: [...this.columnStates]
    });

    this.emitStateChange();
    this.persistState();
    this.cdr.markForCheck();
  }

  /**
   * Handle column drag-drop reorder
   */
  onDrop(event: CdkDragDrop<ColumnState[]>): void {
    if (this.config.allowReorder === false) {
      return;
    }

    // Check if moving a locked column
    const movedColumn = this.columnStates[event.previousIndex];
    if (movedColumn.locked) {
      return;
    }

    const previousOrder = this.columnStates.map(s => s.field);

    // Reorder array
    moveItemInArray(this.columnStates, event.previousIndex, event.currentIndex);

    // Update order values
    this.columnStates.forEach((state, index) => {
      state.order = index;
    });

    const newOrder = this.columnStates.map(s => s.field);

    // Emit event
    this.orderChange.emit({
      previousOrder,
      newOrder,
      columnStates: [...this.columnStates]
    });

    this.emitStateChange();
    this.persistState();
    this.cdr.markForCheck();
  }

  /**
   * Handle column width change
   */
  onWidthChange(columnState: ColumnState, newWidth: string): void {
    if (this.config.allowResize === false) {
      return;
    }

    const previousWidth = columnState.width;
    columnState.width = newWidth;

    // Emit event
    this.widthChange.emit({
      field: columnState.field,
      previousWidth,
      newWidth,
      columnStates: [...this.columnStates]
    });

    this.emitStateChange();
    this.persistState();
    this.cdr.markForCheck();
  }

  /**
   * Reset to default configuration
   */
  onReset(): void {
    const previousStates = [...this.columnStates];

    // Reset to default states
    this.columnStates = JSON.parse(JSON.stringify(this.defaultColumnStates));

    // Emit event
    this.configReset.emit({
      previousStates,
      newStates: [...this.columnStates]
    });

    this.emitStateChange();
    this.persistState();
    this.cdr.markForCheck();
  }

  /**
   * Show all columns
   */
  showAll(): void {
    this.columnStates.forEach(state => {
      if (!state.locked) {
        state.visible = true;
      }
    });

    this.emitStateChange();
    this.persistState();
    this.cdr.markForCheck();
  }

  /**
   * Hide all unlocked columns (respecting minimum)
   */
  hideAll(): void {
    const minVisible = this.config.minVisibleColumns || 1;
    let visibleCount = 0;

    this.columnStates.forEach(state => {
      if (state.locked) {
        if (state.visible) {
          visibleCount++;
        }
      } else {
        if (visibleCount < minVisible) {
          state.visible = true;
          visibleCount++;
        } else {
          state.visible = false;
        }
      }
    });

    this.emitStateChange();
    this.persistState();
    this.cdr.markForCheck();
  }

  /**
   * Get visible columns only
   */
  getVisibleColumns(): ColumnState[] {
    return this.columnStates.filter(state => state.visible);
  }

  /**
   * Get hidden columns only
   */
  getHiddenColumns(): ColumnState[] {
    return this.columnStates.filter(state => !state.visible);
  }

  /**
   * Check if can hide column
   */
  canHideColumn(columnState: ColumnState): boolean {
    if (columnState.locked) {
      return false;
    }

    const visibleCount = this.columnStates.filter(s => s.visible).length;
    const minVisible = this.config.minVisibleColumns || 1;

    return visibleCount > minVisible;
  }

  /**
   * Emit state change event
   */
  private emitStateChange(): void {
    this.stateChange.emit([...this.columnStates]);
  }

  /**
   * Track by function for ngFor
   */
  trackByField(_index: number, columnState: ColumnState): string {
    return columnState.field;
  }

  /**
   * Get title
   */
  get title(): string {
    return this.config.title || 'Manage Columns';
  }

  /**
   * Check if reordering is allowed
   */
  get allowReorder(): boolean {
    return this.config.allowReorder !== false;
  }

  /**
   * Check if visibility toggle is allowed
   */
  get allowToggleVisibility(): boolean {
    return this.config.allowToggleVisibility !== false;
  }

  /**
   * Check if resize is allowed
   */
  get allowResize(): boolean {
    return this.config.allowResize !== false;
  }

  /**
   * Check if reset button should be shown
   */
  get showReset(): boolean {
    return this.config.showReset !== false;
  }

  /**
   * Get visible column count
   */
  get visibleCount(): number {
    return this.columnStates.filter(s => s.visible).length;
  }

  /**
   * Get total column count
   */
  get totalCount(): number {
    return this.columnStates.length;
  }
}
