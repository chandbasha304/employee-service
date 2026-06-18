import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { routes } from './app/app.routes';


import {
  TranslateLoader,
  TranslateService,
  TranslateCompiler,
  TranslateParser,
  TranslateDefaultParser,
  MissingTranslationHandler,
  TranslateStore
} from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { TranslateMessageFormatCompiler } from 'ngx-translate-messageformat-compiler';
import { HttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';
import { MyMissingTranslationHandler } from './app/core/missing-translation.handler';
import { AuthInterceptor } from './app/core/interceptors/auth.interceptor';
import { ErrorInterceptor } from './app/core/interceptors/error.interceptor';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

let appRef: any;

export async function mount() {
  appRef = await bootstrapApplication(AppComponent, {
    providers: [
      provideRouter(routes),

      provideHttpClient(withInterceptorsFromDi()),
      { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
      { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
      { provide: TranslateLoader, useFactory: HttpLoaderFactory, deps: [HttpClient] },
      { provide: TranslateCompiler, useClass: TranslateMessageFormatCompiler },
      { provide: TranslateParser, useClass: TranslateDefaultParser },
      { provide: MissingTranslationHandler, useClass: MyMissingTranslationHandler },
      TranslateStore,
      TranslateService,
    ],


  });
}

export async function unmount() {
  if (appRef) {
    appRef.destroy();
    appRef = null;
  }
}

// ✅ Standalone mode: run normally if not loaded by host
if (!(window as any).__POWERED_BY_MODULE_FEDERATION__) {
  mount();
}
