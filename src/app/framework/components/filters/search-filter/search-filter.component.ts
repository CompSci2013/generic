import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FilterDefinition } from '../../../core/models/filter-definition';

/**
 * Search filter component allowing users to enter a text search term.
 *
 * Provides a simple text input for keyword searches.
 *
 * @example
 * ```typescript
 * const filterDef: FilterDefinition<string> = {
 *   id: 'search',
 *   label: 'Search',
 *   type: 'search',
 *   defaultValue: ''
 * };
 * ```
 */
@Component({
  selector: 'app-search-filter',
  templateUrl: './search-filter.component.html',
  styleUrls: ['./search-filter.component.scss']
})
export class SearchFilterComponent implements OnInit {
  /** Filter definition specifying the filter's configuration */
  @Input() definition!: FilterDefinition<string>;

  /** Current filter value */
  @Input() value: string | null = null;

  /** Emits when the filter value changes */
  @Output() valueChange = new EventEmitter<string>();

  /** Current search term */
  searchTerm: string = '';

  ngOnInit(): void {
    // Initialize search term from input
    if (this.value) {
      this.searchTerm = this.value;
    } else if (this.definition.defaultValue) {
      this.searchTerm = this.definition.defaultValue;
    }
  }

  /**
   * Called when the user changes the search term.
   * Emits the new search term to parent components.
   */
  onSearchChange(): void {
    // Validate if validation function is provided
    if (this.definition.validation && !this.definition.validation(this.searchTerm)) {
      console.warn(`Filter validation failed for ${this.definition.id}`, this.searchTerm);
      return;
    }

    this.valueChange.emit(this.searchTerm);
  }
}
