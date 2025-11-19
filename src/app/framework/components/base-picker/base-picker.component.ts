import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime } from 'rxjs/operators';
import { PickerConfig } from './models/picker-config';

/**
 * Generic base picker component for item selection
 * Works with any item type through configuration
 *
 * Features:
 * - Single and multiple selection modes
 * - Search/filter support
 * - Lazy loading
 * - API or static data
 * - Custom display templates
 * - Cascading/hierarchical support
 *
 * @template TItem - The type of items in the picker
 *
 * @example
 * ```typescript
 * interface Country {
 *   code: string;
 *   name: string;
 * }
 *
 * config: PickerConfig<Country> = {
 *   id: 'country-picker',
 *   label: 'Select Country',
 *   displayField: 'name',
 *   valueField: 'code',
 *   searchFields: ['name', 'code'],
 *   multiSelect: false
 * };
 *
 * <app-base-picker
 *   [config]="config"
 *   [items]="countries"
 *   (selectionChange)="onCountrySelect($event)">
 * </app-base-picker>
 * ```
 */
@Component({
  selector: 'app-base-picker',
  templateUrl: './base-picker.component.html',
  styleUrls: ['./base-picker.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BasePickerComponent<TItem> implements OnInit, OnDestroy {
  /**
   * Picker configuration
   */
  @Input() config!: PickerConfig<TItem>;

  /**
   * Available items (can be provided directly or loaded via API)
   */
  @Input() items: TItem[] = [];

  /**
   * Currently selected item(s)
   */
  @Input() selectedItems?: TItem | TItem[];

  /**
   * Loading state
   */
  @Input() loading = false;

  /**
   * Emitted when selection changes
   */
  @Output() selectionChange = new EventEmitter<TItem | TItem[]>();

  /**
   * Emitted when search query changes
   */
  @Output() searchChange = new EventEmitter<string>();

  /**
   * Filtered items for display
   */
  filteredItems: TItem[] = [];

  /**
   * Current search query
   */
  searchQuery = '';

  /**
   * Internal loading state
   */
  isLoading = false;

  /**
   * Subject for component destruction
   */
  private destroy$ = new Subject<void>();

  /**
   * Subject for search debouncing
   */
  private searchSubject$ = new Subject<string>();

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    // Initialize filtered items
    this.filteredItems = this.items;

    // Set up search debouncing
    this.searchSubject$
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe((query) => {
        this.performSearch(query);
      });

    // Load items if using API and config provides loadItems function
    if (this.config.loadItems && !this.items.length) {
      this.loadItemsFromApi();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Handle selection change from PrimeNG component
   */
  onSelectionChange(event: any): void {
    this.selectionChange.emit(event.value);
  }

  /**
   * Handle search input change
   */
  onSearch(event: any): void {
    const query = event.filter || '';
    this.searchQuery = query;
    this.searchSubject$.next(query);
    this.searchChange.emit(query);
  }

  /**
   * Perform search/filter on items
   */
  private performSearch(query: string): void {
    if (!query || query.trim() === '') {
      this.filteredItems = this.items;
      this.cdr.markForCheck();
      return;
    }

    const lowerQuery = query.toLowerCase();
    const searchFields = this.config.searchFields || [];

    this.filteredItems = this.items.filter((item) => {
      // If no search fields specified, convert item to string and search
      if (searchFields.length === 0) {
        return JSON.stringify(item).toLowerCase().includes(lowerQuery);
      }

      // Search in specified fields
      return searchFields.some((field) => {
        const value = (item as any)[field];
        if (value === null || value === undefined) {
          return false;
        }
        return String(value).toLowerCase().includes(lowerQuery);
      });
    });

    this.cdr.markForCheck();
  }

  /**
   * Load items from API
   */
  private loadItemsFromApi(query?: string, page?: number): void {
    if (!this.config.loadItems) {
      return;
    }

    this.isLoading = true;
    this.cdr.markForCheck();

    this.config
      .loadItems(query, page)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (items) => {
          this.items = items;
          this.filteredItems = items;
          this.isLoading = false;
          this.cdr.markForCheck();
        },
        error: (error) => {
          console.error('Error loading picker items:', error);
          this.isLoading = false;
          this.cdr.markForCheck();
        },
      });
  }

  /**
   * Get display label for an item
   */
  getItemLabel(item: TItem): string {
    if (!item) {
      return '';
    }

    const displayField = this.config.displayField;

    // If displayField is a function, call it
    if (typeof displayField === 'function') {
      return displayField(item);
    }

    // Otherwise, get the value from the field
    const value = (item as any)[displayField];
    return value !== null && value !== undefined ? String(value) : '';
  }

  /**
   * Get unique value for an item
   */
  getItemValue(item: TItem): any {
    if (!item) {
      return null;
    }
    return (item as any)[this.config.valueField];
  }

  /**
   * Check if picker should use dropdown or multiselect
   */
  isMultiSelect(): boolean {
    return this.config.multiSelect === true;
  }

  /**
   * Check if search is enabled
   */
  isSearchable(): boolean {
    return this.config.searchable !== false; // Default to true
  }

  /**
   * Check if clear button should be shown
   */
  showClearButton(): boolean {
    return this.config.showClear !== false; // Default to true
  }

  /**
   * Get placeholder text
   */
  getPlaceholder(): string {
    return this.config.placeholder || `Select ${this.config.label}`;
  }

  /**
   * Check if picker is disabled
   */
  isDisabled(): boolean {
    return this.config.disabled === true;
  }

  /**
   * Check if picker is required
   */
  isRequired(): boolean {
    return this.config.required === true;
  }

  /**
   * Get style class
   */
  getStyleClass(): string {
    return this.config.styleClass || '';
  }

  /**
   * Get dropdown width
   */
  getDropdownWidth(): string {
    return this.config.dropdownWidth || '100%';
  }

  /**
   * Track by function for ngFor performance
   */
  trackByValue(index: number, item: TItem): any {
    return this.getItemValue(item);
  }
}
