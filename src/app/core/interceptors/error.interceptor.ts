import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest
} from '@angular/common/http';
import { Injectable, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, Observable, throwError } from 'rxjs';
import { ToastService } from '../services/toast.service';
import { AuthService } from '../services/auth.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(
    private router: Router,
    private toastService: ToastService,
    private injector: Injector
  ) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        const isAuthApi =
          req.url.includes('/login') ||
          req.url.includes('/sign-up') ||
          req.url.includes('/logout');

        if (error.status === 401 && !isAuthApi) {
          const authService = this.injector.get(AuthService);
          authService.clearSession();
          this.toastService.error('Session expired. Please log in again.');
          this.router.navigateByUrl('/login');
        } else if (error.status === 0) {
          this.toastService.error('Unable to connect to the server. Please check if backend is running.');
        } else if (!isAuthApi) {
          const errMsg = error.error?.message || error.error || 'Authentication or request failed';
          this.toastService.error(errMsg);
        }

        return throwError(() => error);
      })
    );
  }
}