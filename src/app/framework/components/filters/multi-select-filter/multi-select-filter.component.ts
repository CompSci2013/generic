import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FilterDefinition } from '../../../core/models/filter-definition';

/**
 * Multi-select filter component allowing users to select multiple options from a list.
 *
 * Uses PrimeNG's p-multiSelect for the UI.
 *
 * @example
 * ```typescript
 * const filterDef: FilterDefinition<string[]> = {
 *   id: 'categories',
 *   label: 'Select Categories',
 *   type: 'multi-select',
 *   options: [
 *     { label: 'Option A', value: 'a' },
 *     { label: 'Option B', value: 'b' }
 *   ]
 * };
 * ```
 */
@Component({
  selector: 'app-multi-select-filter',
  templateUrl: './multi-select-filter.component.html',
  styleUrls: ['./multi-select-filter.component.scss']
})
export class MultiSelectFilterComponent implements OnInit {
  /** Filter definition specifying the filter's configuration */
  @Input() definition!: FilterDefinition<any[]>;

  /** Current filter value */
  @Input() value: any[] | null = null;

  /** Emits when the filter value changes */
  @Output() valueChange = new EventEmitter<any[]>();

  /** Currently selected values */
  selectedValues: any[] = [];

  ngOnInit(): void {
    // Initialize selected values from input
    if (this.value) {
      this.selectedValues = [...this.value];
    } else if (this.definition.defaultValue) {
      this.selectedValues = [...this.definition.defaultValue];
    }
  }

  /**
   * Called when the user changes the selection in the multi-select dropdown.
   * Emits the new selection array to parent components.
   */
  onSelectionChange(): void {
    // Validate if validation function is provided
    if (this.definition.validation && !this.definition.validation(this.selectedValues)) {
      console.warn(`Filter validation failed for ${this.definition.id}`, this.selectedValues);
      return;
    }

    this.valueChange.emit(this.selectedValues);
  }
}
