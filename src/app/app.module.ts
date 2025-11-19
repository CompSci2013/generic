import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// Framework
import { ApiErrorInterceptor, LoadingInterceptor } from './framework/core';
import { DOMAIN_CONFIG } from './framework/core/services/config-loader.service';
import { DomainConfig } from './framework/core/models/domain-config';

// Domain configuration
import { AUTOMOBILE_DOMAIN_CONFIG } from '../domain-config/automobile';
import { AutoApiAdapter } from '../domain-config/automobile/adapters/auto-api-adapter';
import { AutoSearchFilters, AutoData, AutoStatistics } from '../domain-config/automobile/models';

/**
 * Factory function to create domain configuration with injected API adapter
 */
export function createDomainConfigWithAdapter(apiAdapter: AutoApiAdapter): DomainConfig<AutoSearchFilters, AutoData, AutoStatistics> {
  return {
    ...AUTOMOBILE_DOMAIN_CONFIG,
    adapters: {
      ...AUTOMOBILE_DOMAIN_CONFIG.adapters,
      apiAdapter: apiAdapter as any // Type assertion - adapter implementation uses paginated response
    }
  };
}

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule, // Required for PrimeNG
    HttpClientModule,
    AppRoutingModule
  ],
  providers: [
    // Register HTTP interceptors
    {
      provide: HTTP_INTERCEPTORS,
      useClass: LoadingInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ApiErrorInterceptor,
      multi: true
    },
    // Provide domain configuration with injected adapters
    {
      provide: DOMAIN_CONFIG,
      useFactory: createDomainConfigWithAdapter,
      deps: [AutoApiAdapter]
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
