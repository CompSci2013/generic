import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Angular CDK modules
import { DragDropModule } from '@angular/cdk/drag-drop';

// PrimeNG modules
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';

// Framework components
import { BaseDataTableComponent } from './components/base-data-table/base-data-table.component';
import { PanelContainerComponent } from './components/panel-container/panel-container.component';
import { HierarchicalPickerComponent } from './components/hierarchical-picker/hierarchical-picker.component';
import { ColumnManagerComponent } from './components/column-manager/column-manager.component';

/**
 * Framework Module
 *
 * Exports all generic framework components for use in feature modules.
 * This module contains domain-agnostic, reusable components.
 *
 * Components:
 * - BaseDataTableComponent: Generic table with sorting, pagination, selection
 * - PanelContainerComponent: Generic panel container with drag-drop, collapse, persistence
 * - HierarchicalPickerComponent: N-level cascading picker (country→state→city, etc.)
 * - ColumnManagerComponent: Generic column visibility, ordering, and sizing manager
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
    PanelContainerComponent,
    HierarchicalPickerComponent,
    ColumnManagerComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    DragDropModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    DropdownModule
  ],
  exports: [
    BaseDataTableComponent,
    PanelContainerComponent,
    HierarchicalPickerComponent,
    ColumnManagerComponent,
    // Export Angular modules for convenience
    FormsModule,
    // Export CDK modules for convenience
    DragDropModule,
    // Export PrimeNG modules for convenience
    TableModule,
    ButtonModule,
    InputTextModule,
    DropdownModule
  ]
})
export class FrameworkModule { }
