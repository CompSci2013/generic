import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

// Framework module
import { FrameworkModule } from '../../framework/framework.module';

// Feature components
import { DiscoverComponent } from './discover.component';

// Domain adapters are provided in root (providedIn: 'root')
// No need to import them explicitly here

/**
 * Feature module routes
 */
const routes: Routes = [
  {
    path: '',
    component: DiscoverComponent
  }
];

/**
 * Discover Feature Module
 *
 * This module demonstrates the application layer wiring:
 * - Imports framework components (BaseDataTableComponent)
 * - Declares feature components (DiscoverComponent)
 * - Uses domain adapters (AutoApiAdapter, AutoFilterUrlMapper)
 * - Configures routing
 *
 * The adapters are provided at root level (providedIn: 'root'),
 * so no need to provide them here.
 */
@NgModule({
  declarations: [
    DiscoverComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FrameworkModule
  ],
  exports: [
    DiscoverComponent
  ]
})
export class DiscoverModule { }
