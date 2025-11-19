import { Component, Input, Output, EventEmitter, Inject, OnInit } from '@angular/core';
import { DOMAIN_CONFIG } from '../../../framework/core/services/config-loader.service';
import { DomainConfig } from '../../../framework/core/models/domain-config';
import { TableColumn } from '../../../framework/components/base-data-table/models/table-column';
import { SortEvent, PageEvent } from '../../../framework/components/base-data-table/models/table-event';

/**
 * Generic Results Table Component
 *
 * **DOMAIN-AGNOSTIC** - Works with any domain configuration.
 * This component demonstrates A2 milestone: generic components that inject DOMAIN_CONFIG.
 *
 * Features:
 * - Gets table columns from injected domain configuration
 * - Works with any TData type (AutoData, FarmData, ProductData, etc.)
 * - Delegates sorting/pagination events to parent
 * - No automobile-specific code
 *
 * @template TFilters - Domain filter type
 * @template TData - Domain data entity type
 * @template TStatistics - Domain statistics type
 */
@Component({
  selector: 'app-results-table',
  template: `
    <div class="results-table-container">
      <app-base-data-table
        [data]="data"
        [columns]="columns"
        [totalRecords]="totalRecords"
        [loading]="loading"
        [rows]="pageSize"
        [first]="first"
        [paginator]="true"
        [rowsPerPageOptions]="pageSizeOptions"
        [showGridlines]="true"
        [stripedRows]="true"
        [rowHover]="true"
        [dataKey]="dataKey"
        (sortChange)="onSortChange($event)"
        (pageChange)="onPageChange($event)"
      ></app-base-data-table>
    </div>
  `,
  styles: [`
    .results-table-container {
      width: 100%;
    }
  `]
})
export class ResultsTableComponent<TFilters = any, TData = any, TStatistics = any> implements OnInit {
  /** Data to display */
  @Input() data: TData[] = [];

  /** Total record count for pagination */
  @Input() totalRecords = 0;

  /** Loading state */
  @Input() loading = false;

  /** Current page size */
  @Input() pageSize = 20;

  /** First record index (for pagination) */
  @Input() first = 0;

  /** Data key field for row tracking */
  @Input() dataKey = 'id';

  /** Sort change event */
  @Output() sortChange = new EventEmitter<SortEvent>();

  /** Page change event */
  @Output() pageChange = new EventEmitter<PageEvent>();

  /** Table columns from domain configuration */
  columns: TableColumn<TData>[] = [];

  /** Page size options from domain configuration */
  pageSizeOptions: number[] = [10, 20, 50, 100];

  constructor(
    @Inject(DOMAIN_CONFIG) private domainConfig: DomainConfig<TFilters, TData, TStatistics>
  ) {}

  ngOnInit(): void {
    // Get table columns from domain configuration
    this.columns = this.domainConfig.ui.tableColumns as TableColumn<TData>[];

    // Get page size options from domain configuration
    if (this.domainConfig.ui.pageSizeOptions) {
      this.pageSizeOptions = this.domainConfig.ui.pageSizeOptions;
    }

    // Use default page size from config if not provided
    if (!this.pageSize && this.domainConfig.ui.defaultPageSize) {
      this.pageSize = this.domainConfig.ui.defaultPageSize;
    }
  }

  /**
   * Handle sort change from table
   */
  onSortChange(event: SortEvent): void {
    this.sortChange.emit(event);
  }

  /**
   * Handle page change from table
   */
  onPageChange(event: PageEvent): void {
    this.pageChange.emit(event);
  }
}
