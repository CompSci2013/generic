import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FilterDefinition, RangeValue } from '../../../core/models/filter-definition';

/**
 * Range filter component allowing users to specify a min/max numeric range.
 *
 * Provides two input fields for minimum and maximum values.
 *
 * @example
 * ```typescript
 * const filterDef: FilterDefinition<RangeValue> = {
 *   id: 'price',
 *   label: 'Price Range',
 *   type: 'range',
 *   defaultValue: { min: 0, max: 1000 }
 * };
 * ```
 */
@Component({
  selector: 'app-range-filter',
  templateUrl: './range-filter.component.html',
  styleUrls: ['./range-filter.component.scss']
})
export class RangeFilterComponent implements OnInit {
  /** Filter definition specifying the filter's configuration */
  @Input() definition!: FilterDefinition<RangeValue>;

  /** Current filter value */
  @Input() value: RangeValue | null = null;

  /** Emits when the filter value changes */
  @Output() valueChange = new EventEmitter<RangeValue>();

  /** Current range value */
  rangeValue: RangeValue = { min: null, max: null };

  ngOnInit(): void {
    // Initialize range value from input
    if (this.value) {
      this.rangeValue = { ...this.value };
    } else if (this.definition.defaultValue) {
      this.rangeValue = { ...this.definition.defaultValue };
    }
  }

  /**
   * Called when the user changes either the min or max value.
   * Emits the new range to parent components.
   */
  onRangeChange(): void {
    // Validate if validation function is provided
    if (this.definition.validation && !this.definition.validation(this.rangeValue)) {
      console.warn(`Filter validation failed for ${this.definition.id}`, this.rangeValue);
      return;
    }

    this.valueChange.emit(this.rangeValue);
  }
}
