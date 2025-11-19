import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// PrimeNG modules
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

// Framework components
import { BaseDataTableComponent } from './components/base-data-table/base-data-table.component';

/**
 * Framework Module
 *
 * Exports all generic framework components for use in feature modules.
 * This module contains domain-agnostic, reusable components.
 *
 * Components:
 * - BaseDataTableComponent: Generic table with sorting, pagination, selection
 *
 * Future components (when needed):
 * - BasePickerComponent
 * - BaseChartComponent
 * - Filter components
 * - etc.
 */
@NgModule({
  declarations: [
    BaseDataTableComponent
  ],
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    InputTextModule
  ],
  exports: [
    BaseDataTableComponent,
    // Export PrimeNG modules for convenience
    TableModule,
    ButtonModule,
    InputTextModule
  ]
})
export class FrameworkModule { }
