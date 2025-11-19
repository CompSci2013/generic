import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

/**
 * Application routes
 *
 * Uses lazy loading for feature modules to optimize bundle size.
 */
const routes: Routes = [
  {
    path: '',
    redirectTo: '/discover',
    pathMatch: 'full'
  },
  {
    path: 'discover',
    loadChildren: () => import('./features/discover/discover.module').then(m => m.DiscoverModule)
  },
  {
    path: '**',
    redirectTo: '/discover'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
