import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FilterDefinition, DateRangeValue } from '../../../core/models/filter-definition';

/**
 * Date range filter component allowing users to select a start and end date.
 *
 * Uses PrimeNG's p-calendar for the UI with range selection mode.
 *
 * @example
 * ```typescript
 * const filterDef: FilterDefinition<DateRangeValue> = {
 *   id: 'dateRange',
 *   label: 'Date Range',
 *   type: 'date-range',
 *   defaultValue: { start: new Date('2024-01-01'), end: new Date('2024-12-31') }
 * };
 * ```
 */
@Component({
  selector: 'app-date-range-filter',
  templateUrl: './date-range-filter.component.html',
  styleUrls: ['./date-range-filter.component.scss']
})
export class DateRangeFilterComponent implements OnInit {
  /** Filter definition specifying the filter's configuration */
  @Input() definition!: FilterDefinition<DateRangeValue>;

  /** Current filter value */
  @Input() value: DateRangeValue | null = null;

  /** Emits when the filter value changes */
  @Output() valueChange = new EventEmitter<DateRangeValue>();

  /** Internal date range array for p-calendar (expects Date[]) */
  dateRange: Date[] = [];

  ngOnInit(): void {
    // Initialize date range from input
    if (this.value) {
      this.dateRange = [
        this.value.start || new Date(),
        this.value.end || new Date()
      ].filter(d => d !== null) as Date[];
    } else if (this.definition.defaultValue) {
      const defaultValue = this.definition.defaultValue;
      this.dateRange = [
        defaultValue.start || new Date(),
        defaultValue.end || new Date()
      ].filter(d => d !== null) as Date[];
    }
  }

  /**
   * Called when the user changes the date range in the calendar.
   * Emits the new date range to parent components.
   */
  onDateChange(): void {
    const dateRangeValue: DateRangeValue = {
      start: this.dateRange[0] || null,
      end: this.dateRange[1] || null
    };

    // Validate if validation function is provided
    if (this.definition.validation && !this.definition.validation(dateRangeValue)) {
      console.warn(`Filter validation failed for ${this.definition.id}`, dateRangeValue);
      return;
    }

    this.valueChange.emit(dateRangeValue);
  }
}
