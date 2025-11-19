import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FilterDefinition } from '../../../core/models/filter-definition';

/**
 * Represents a single filter chip for display.
 */
interface FilterChip {
  /** The filter ID */
  filterId: string;
  /** Display label showing filter name and value */
  label: string;
}

/**
 * Filter chips component for displaying active filters as removable chips.
 *
 * This component renders the currently applied filters as visual chips
 * that users can click to remove individual filters.
 *
 * @template TFilters - The type representing all filter values in the application
 *
 * @example
 * ```typescript
 * <app-filter-chips
 *   [filters]="currentFilters"
 *   [definitions]="filterDefinitions"
 *   (filterRemove)="onRemoveFilter($event)">
 * </app-filter-chips>
 * ```
 */
@Component({
  selector: 'app-filter-chips',
  templateUrl: './filter-chips.component.html',
  styleUrls: ['./filter-chips.component.scss']
})
export class FilterChipsComponent<TFilters = any> {
  /**
   * Current filter values.
   * Only filters with non-null, non-empty values will be displayed as chips.
   */
  @Input() filters!: Partial<TFilters>;

  /**
   * Filter definitions providing metadata for formatting.
   */
  @Input() definitions!: FilterDefinition<any>[];

  /**
   * Emits when a user removes a filter chip.
   * The emitted value is the filter ID.
   */
  @Output() filterRemove = new EventEmitter<string>();

  /**
   * Computes the chips to display based on active filters.
   *
   * @returns Array of filter chips to render
   */
  get chips(): FilterChip[] {
    if (!this.filters || !this.definitions) {
      return [];
    }

    return this.definitions
      .filter(def => {
        const value = this.filters[def.id as keyof TFilters];
        // Only show chips for filters with non-null, non-empty values
        return value !== null && value !== undefined && value !== '';
      })
      .map(def => ({
        filterId: def.id,
        label: `${def.label}: ${this.formatValue(def, this.filters[def.id as keyof TFilters])}`
      }));
  }

  /**
   * Called when a user clicks the remove button on a chip.
   *
   * @param filterId - The ID of the filter to remove
   */
  onChipRemove(filterId: string): void {
    this.filterRemove.emit(filterId);
  }

  /**
   * Formats a filter value for display in a chip.
   *
   * @param def - The filter definition
   * @param value - The filter value
   * @returns Formatted string representation of the value
   */
  private formatValue(def: FilterDefinition<any>, value: any): string {
    // Use custom formatter if provided
    if (def.formatter) {
      return def.formatter(value);
    }

    // Handle arrays (multi-select)
    if (Array.isArray(value)) {
      if (value.length === 0) {
        return 'None';
      }
      if (value.length === 1) {
        return this.formatSingleValue(value[0], def);
      }
      return `${value.length} selected`;
    }

    // Handle range values
    if (value && typeof value === 'object' && ('min' in value || 'max' in value)) {
      const min = value.min !== null && value.min !== undefined ? value.min : '∞';
      const max = value.max !== null && value.max !== undefined ? value.max : '∞';
      return `${min} - ${max}`;
    }

    // Handle date range values
    if (value && typeof value === 'object' && ('start' in value || 'end' in value)) {
      const start = value.start ? this.formatDate(value.start) : '∞';
      const end = value.end ? this.formatDate(value.end) : '∞';
      return `${start} - ${end}`;
    }

    // Handle dates
    if (value instanceof Date) {
      return this.formatDate(value);
    }

    // Default: convert to string
    return String(value);
  }

  /**
   * Formats a single value (used for array elements).
   *
   * @param value - The value to format
   * @param def - The filter definition (for looking up option labels)
   * @returns Formatted string
   */
  private formatSingleValue(value: any, def: FilterDefinition<any>): string {
    // Try to find the label in options
    if (def.options) {
      const option = def.options.find(opt => opt.value === value);
      if (option) {
        return option.label;
      }
    }
    return String(value);
  }

  /**
   * Formats a Date object to a readable string.
   *
   * @param date - The date to format
   * @returns Formatted date string (YYYY-MM-DD)
   */
  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}
