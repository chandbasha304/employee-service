import { ApplicationConfig } from '@angular/core';
import { provideRouter, withDebugTracing } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptorsFromDi, HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';

import { AuthInterceptor } from './core/interceptors/auth.interceptor';
import { ErrorInterceptor } from './core/interceptors/error.interceptor';

import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, 'assets/i18n/', '.json');
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes,withDebugTracing()),
    provideHttpClient(withInterceptorsFromDi()),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ErrorInterceptor,
      multi: true
    }
  ],
};
