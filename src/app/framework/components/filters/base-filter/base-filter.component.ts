import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FilterDefinition } from '../../../core/models/filter-definition';

/**
 * Base filter component providing a generic container for filter implementations.
 *
 * This component serves as a foundation for all filter types, managing:
 * - Filter definition and configuration
 * - Value change events
 * - Common filter UI structure
 *
 * @template TFilterValue - The type of value this filter produces
 *
 * @example
 * ```typescript
 * // In a parent component
 * <app-base-filter
 *   [definition]="myFilterDefinition"
 *   [value]="currentValue"
 *   (valueChange)="onFilterChange($event)">
 * </app-base-filter>
 * ```
 */
@Component({
  selector: 'app-base-filter',
  templateUrl: './base-filter.component.html',
  styleUrls: ['./base-filter.component.scss']
})
export class BaseFilterComponent<TFilterValue> {
  /**
   * Filter definition specifying the filter's configuration.
   * This includes id, label, type, options, validation, etc.
   */
  @Input() definition!: FilterDefinition<TFilterValue>;

  /**
   * Current filter value.
   * Null indicates no value is set (filter is cleared).
   */
  @Input() value: TFilterValue | null = null;

  /**
   * Emits when the filter value changes.
   * Parent components should listen to this event to update their filter state.
   */
  @Output() valueChange = new EventEmitter<TFilterValue>();

  /**
   * Called when the filter value changes.
   * Validates the new value (if validation function is provided) and emits the change.
   *
   * @param newValue - The new filter value
   */
  onValueChange(newValue: TFilterValue): void {
    // Validate if validation function is provided
    if (this.definition.validation && !this.definition.validation(newValue)) {
      console.warn(`Filter validation failed for ${this.definition.id}`, newValue);
      return;
    }

    this.valueChange.emit(newValue);
  }

  /**
   * Clears the filter value, resetting it to null or the default value.
   */
  clear(): void {
    const clearedValue = (this.definition.defaultValue ?? null) as TFilterValue;
    this.valueChange.emit(clearedValue);
  }
}
