import {
  HttpErrorResponse,
  HttpInterceptorFn
} from '@angular/common/http';

import { inject } from '@angular/core';
import { Router } from '@angular/router';

import {
  catchError,
  throwError
} from 'rxjs';

import { AdminAuthService } from './admin-auth.service';

export const adminAuthInterceptor:
  HttpInterceptorFn = (request, next) => {

  const adminAuthService =
    inject(AdminAuthService);

  const router = inject(Router);

  const isAdminRequest =
    request.url.startsWith('/api/admin/');

  const isLoginRequest =
    request.url === '/api/admin/login';

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      const sessionHasExpired =
        isAdminRequest
        && !isLoginRequest
        && error.status === 401
        && adminAuthService.isAuthenticated();

      if (sessionHasExpired) {
        const currentUrl = router.url;

        const returnUrl =
          currentUrl.startsWith('/admin')
          && !currentUrl.startsWith(
            '/admin/login'
          )
            ? currentUrl
            : '/admin/articulos';

        adminAuthService.clearSession();

        void router.navigate(
          ['/admin/login'],
          {
            queryParams: {
              returnUrl
            },
            replaceUrl: true
          }
        );
      }

      return throwError(() => error);
    })
  );
};