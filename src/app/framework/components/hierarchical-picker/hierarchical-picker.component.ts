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
import { Subject, of } from 'rxjs';
import { takeUntil, catchError } from 'rxjs/operators';
import {
  HierarchicalPickerConfig,
  HierarchyLevel,
  HierarchySelection,
  HierarchyState
} from '../base-picker/models/hierarchical-config';

/**
 * Generic Hierarchical (Cascading) Picker Component
 *
 * Supports N-level cascading selections where each level depends on the previous.
 * Completely generic and works with any data types.
 *
 * Features:
 * - N-level cascading (2+ levels)
 * - Lazy loading of child items
 * - Auto-select single options
 * - Breadcrumb trail
 * - Partial or complete selection modes
 * - Vertical or horizontal layout
 * - Parent level locking
 *
 * Use cases:
 * - Country → State → City
 * - Manufacturer → Model → Trim
 * - Category → Subcategory → Product
 * - Department → Team → Employee
 *
 * @example
 * ```html
 * <app-hierarchical-picker
 *   [config]="locationConfig"
 *   (selectionChange)="onLocationSelect($event)">
 * </app-hierarchical-picker>
 * ```
 */
@Component({
  selector: 'app-hierarchical-picker',
  templateUrl: './hierarchical-picker.component.html',
  styleUrls: ['./hierarchical-picker.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HierarchicalPickerComponent implements OnInit, OnDestroy {
  /**
   * Hierarchical picker configuration
   */
  @Input() config!: HierarchicalPickerConfig;

  /**
   * Initial selection (optional)
   * Provides initial values for each level
   */
  @Input() initialSelection?: Map<string, any>;

  /**
   * Emitted when selection changes at any level
   */
  @Output() selectionChange = new EventEmitter<HierarchySelection>();

  /**
   * Emitted when a specific level's selection changes
   */
  @Output() levelSelectionChange = new EventEmitter<{
    level: HierarchyLevel<any>;
    value: any;
    levelIndex: number;
  }>();

  /**
   * Internal state
   */
  state: HierarchyState = {
    levelItems: new Map(),
    levelSelections: new Map(),
    levelLoading: new Map(),
    activeLevel: 0,
    isComplete: false
  };

  /**
   * Subject for component destruction
   */
  private destroy$ = new Subject<void>();

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.validateConfig();
    this.initializeState();
    this.loadRootLevel();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Validate configuration
   */
  private validateConfig(): void {
    if (!this.config.levels || this.config.levels.length < 2) {
      throw new Error('HierarchicalPickerConfig must have at least 2 levels');
    }

    // Ensure first level is marked as root
    if (this.config.levels[0]) {
      this.config.levels[0].isRoot = true;
    }
  }

  /**
   * Initialize component state
   */
  private initializeState(): void {
    // Initialize loading states
    this.config.levels.forEach(level => {
      this.state.levelLoading.set(level.id, false);
      this.state.levelItems.set(level.id, []);
    });

    // Apply initial selection if provided
    if (this.initialSelection) {
      this.state.levelSelections = new Map(this.initialSelection);
    }
  }

  /**
   * Load items for the root level
   */
  private loadRootLevel(): void {
    const rootLevel = this.config.levels[0];
    if (!rootLevel) {
      return;
    }

    this.loadLevelItems(rootLevel, 0);
  }

  /**
   * Load items for a specific level
   */
  private loadLevelItems(level: HierarchyLevel<any>, levelIndex: number, parentValue?: any): void {
    // Check if items are provided statically
    if (level.pickerConfig.items && level.pickerConfig.items.length > 0) {
      this.state.levelItems.set(level.id, level.pickerConfig.items);
      this.checkAutoSelect(level, levelIndex);
      this.cdr.markForCheck();
      return;
    }

    // Load items dynamically
    if (!level.loadItems) {
      console.warn(`Level ${level.id} has no items and no loadItems function`);
      return;
    }

    this.state.levelLoading.set(level.id, true);
    this.cdr.markForCheck();

    level.loadItems(parentValue)
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          console.error(`Error loading items for level ${level.id}:`, error);
          return of([]);
        })
      )
      .subscribe(items => {
        this.state.levelItems.set(level.id, items);
        this.state.levelLoading.set(level.id, false);
        this.checkAutoSelect(level, levelIndex);
        this.cdr.markForCheck();
      });
  }

  /**
   * Check if should auto-select when only one option available
   */
  private checkAutoSelect(level: HierarchyLevel<any>, levelIndex: number): void {
    if (!this.config.autoSelectSingle) {
      return;
    }

    const items = this.state.levelItems.get(level.id) || [];
    if (items.length === 1) {
      this.onLevelSelectionChange(level, levelIndex, items[0]);
    }
  }

  /**
   * Handle selection change at a specific level
   */
  onLevelSelectionChange(level: HierarchyLevel<any>, levelIndex: number, value: any): void {
    // Store selection
    this.state.levelSelections.set(level.id, value);

    // Clear selections for all child levels
    this.clearChildLevelSelections(levelIndex);

    // Update active level
    this.state.activeLevel = levelIndex + 1;

    // Emit level-specific change event
    this.levelSelectionChange.emit({
      level,
      value,
      levelIndex
    });

    // Load next level if exists
    const nextLevel = this.config.levels[levelIndex + 1];
    if (nextLevel && value) {
      const parentValue = this.getItemValue(level, value);
      this.loadLevelItems(nextLevel, levelIndex + 1, parentValue);
    }

    // Update completion state
    this.updateCompletionState();

    // Emit overall selection change
    this.emitSelectionChange();
  }

  /**
   * Clear selections for all levels after the specified index
   */
  private clearChildLevelSelections(fromIndex: number): void {
    for (let i = fromIndex + 1; i < this.config.levels.length; i++) {
      const level = this.config.levels[i];
      if (level) {
        this.state.levelSelections.delete(level.id);
        this.state.levelItems.set(level.id, []);
      }
    }
  }

  /**
   * Update completion state based on current selections
   */
  private updateCompletionState(): void {
    const requiredLevels = this.config.allowPartialSelection
      ? 1  // At least one level must be selected
      : this.config.levels.length;  // All levels must be selected

    const selectedCount = this.state.levelSelections.size;
    this.state.isComplete = selectedCount >= requiredLevels;
  }

  /**
   * Emit selection change event
   */
  private emitSelectionChange(): void {
    const selectionPath: any[] = [];

    for (const level of this.config.levels) {
      const selection = this.state.levelSelections.get(level.id);
      if (selection !== undefined) {
        selectionPath.push(selection);
      }
    }

    const leafSelection = selectionPath.length > 0
      ? selectionPath[selectionPath.length - 1]
      : null;

    const hierarchySelection: HierarchySelection = {
      selections: new Map(this.state.levelSelections),
      selectionPath,
      leafSelection,
      isComplete: this.state.isComplete
    };

    this.selectionChange.emit(hierarchySelection);
  }

  /**
   * Get value from an item for a given level
   */
  private getItemValue(level: HierarchyLevel<any>, item: any): any {
    if (!item) {
      return null;
    }
    return item[level.pickerConfig.valueField];
  }

  /**
   * Clear all selections and reset to initial state
   */
  clear(): void {
    this.state.levelSelections.clear();
    this.state.activeLevel = 0;
    this.state.isComplete = false;

    // Clear items for non-root levels
    for (let i = 1; i < this.config.levels.length; i++) {
      const level = this.config.levels[i];
      if (level) {
        this.state.levelItems.set(level.id, []);
      }
    }

    this.emitSelectionChange();
    this.cdr.markForCheck();
  }

  /**
   * Get items for a specific level
   */
  getLevelItems(level: HierarchyLevel<any>): any[] {
    return this.state.levelItems.get(level.id) || [];
  }

  /**
   * Get selected value for a specific level
   */
  getLevelSelection(level: HierarchyLevel<any>): any {
    return this.state.levelSelections.get(level.id);
  }

  /**
   * Check if a level is loading
   */
  isLevelLoading(level: HierarchyLevel<any>): boolean {
    return this.state.levelLoading.get(level.id) || false;
  }

  /**
   * Check if a level is disabled
   */
  isLevelDisabled(level: HierarchyLevel<any>, levelIndex: number): boolean {
    if (this.config.disabled) {
      return true;
    }

    // Root level is never disabled (unless whole picker is disabled)
    if (level.isRoot) {
      return false;
    }

    // Child levels are disabled if parent not selected
    const parentLevel = this.config.levels[levelIndex - 1];
    if (parentLevel) {
      const parentSelection = this.state.levelSelections.get(parentLevel.id);
      if (!parentSelection) {
        return true;
      }
    }

    // If lockParentLevels is true, disable levels that already have selections
    if (this.config.lockParentLevels && levelIndex < this.state.activeLevel) {
      return true;
    }

    return false;
  }

  /**
   * Get breadcrumb trail as array of labels
   */
  getBreadcrumb(): string[] {
    const breadcrumb: string[] = [];

    for (const level of this.config.levels) {
      const selection = this.state.levelSelections.get(level.id);
      if (selection) {
        const label = this.getItemLabel(level, selection);
        breadcrumb.push(label);
      }
    }

    return breadcrumb;
  }

  /**
   * Get display label for an item at a specific level
   */
  private getItemLabel(level: HierarchyLevel<any>, item: any): string {
    if (!item) {
      return '';
    }

    const displayField = level.pickerConfig.displayField;

    if (typeof displayField === 'function') {
      return displayField(item);
    }

    const value = item[displayField];
    return value !== null && value !== undefined ? String(value) : '';
  }

  /**
   * Get orientation class
   */
  get orientationClass(): string {
    return `orientation-${this.config.orientation || 'vertical'}`;
  }

  /**
   * Check if should show labels
   */
  get showLabels(): boolean {
    return this.config.showLabels !== false;
  }

  /**
   * Check if should show breadcrumb
   */
  get showBreadcrumb(): boolean {
    return this.config.showBreadcrumb !== false && this.getBreadcrumb().length > 0;
  }

  /**
   * Check if clearable
   */
  get isClearable(): boolean {
    return this.config.clearable !== false && this.state.levelSelections.size > 0;
  }

  /**
   * Track by function for ngFor
   */
  trackByLevelId(_index: number, level: HierarchyLevel<any>): string {
    return level.id;
  }

  /**
   * Get option label field as string for PrimeNG dropdown
   */
  getOptionLabelField(level: HierarchyLevel<any>): string {
    const displayField = level.pickerConfig.displayField;
    if (typeof displayField === 'function') {
      // PrimeNG doesn't support function for optionLabel, so we'll use a field
      // The actual display will be handled by the item template
      return 'name'; // fallback field
    }
    return String(displayField);
  }

  /**
   * Get data key field as string for PrimeNG dropdown
   */
  getDataKeyField(level: HierarchyLevel<any>): string {
    return String(level.pickerConfig.valueField);
  }

  /**
   * Get filter by fields as string for PrimeNG dropdown
   */
  getFilterByFields(level: HierarchyLevel<any>): string {
    const searchFields = level.pickerConfig.searchFields;
    if (searchFields && searchFields.length > 0) {
      return searchFields.map(f => String(f)).join(',');
    }

    const displayField = level.pickerConfig.displayField;
    if (typeof displayField === 'function') {
      return 'name'; // fallback
    }
    return String(displayField);
  }

  /**
   * Get style class (handle undefined)
   */
  getStyleClass(level: HierarchyLevel<any>): string {
    return level.pickerConfig.styleClass || '';
  }
}
