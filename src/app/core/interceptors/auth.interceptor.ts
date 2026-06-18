import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest
} from '@angular/common/http';

import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor
  implements HttpInterceptor {

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {

    const isAuthApi =

      req.url.includes('/login') ||

      req.url.includes('/sign-up');

    if (isAuthApi) {

      return next.handle(req);
    }

    const token =
      sessionStorage.getItem('token');

    if (token) {

      req = req.clone({

        setHeaders: {

          Authorization:
            `Bearer ${token}`
        }
      });
    }

    return next.handle(req);
  }
}