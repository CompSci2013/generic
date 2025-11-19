import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Angular CDK modules
import { DragDropModule } from '@angular/cdk/drag-drop';

// PrimeNG modules
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

// Framework components
import { BaseDataTableComponent } from './components/base-data-table/base-data-table.component';
import { PanelContainerComponent } from './components/panel-container/panel-container.component';

/**
 * Framework Module
 *
 * Exports all generic framework components for use in feature modules.
 * This module contains domain-agnostic, reusable components.
 *
 * Components:
 * - BaseDataTableComponent: Generic table with sorting, pagination, selection
 * - PanelContainerComponent: Generic panel container with drag-drop, collapse, persistence
 *
 * Future components (when needed):
 * - BasePickerComponent
 * - BaseChartComponent
 * - Filter components
 * - etc.
 */
@NgModule({
  declarations: [
    BaseDataTableComponent,
    PanelContainerComponent
  ],
  imports: [
    CommonModule,
    DragDropModule,
    TableModule,
    ButtonModule,
    InputTextModule
  ],
  exports: [
    BaseDataTableComponent,
    PanelContainerComponent,
    // Export CDK modules for convenience
    DragDropModule,
    // Export PrimeNG modules for convenience
    TableModule,
    ButtonModule,
    InputTextModule
  ]
})
export class FrameworkModule { }
