import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { AdminAuthService } from './admin-auth.service';

export const adminAuthInterceptor: HttpInterceptorFn = (request, next) => {
  const isAdminRequest = request.url.startsWith('/api/admin/');

  if (!isAdminRequest) {
    return next(request);
  }

  const alreadyHasAuthorization = request.headers.has('Authorization');

  if (alreadyHasAuthorization) {
    return next(request);
  }

  const adminAuthService = inject(AdminAuthService);
  const router = inject(Router);

  const authorizationHeader = adminAuthService.getAuthorizationHeader();

  if (!authorizationHeader) {
    return next(request);
  }

  const authenticatedRequest = request.clone({
    setHeaders: {
      Authorization: authorizationHeader,
    },
  });

  return next(authenticatedRequest).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && adminAuthService.isAuthenticated()) {
        const currentUrl = router.url;

        const returnUrl =
          currentUrl.startsWith('/admin') && !currentUrl.startsWith('/admin/login')
            ? currentUrl
            : '/admin/articulos';

        adminAuthService.logout();

        void router.navigate(['/admin/login'], {
          queryParams: { returnUrl },
          replaceUrl: true,
        });
      }

      return throwError(() => error);
    }),
  );
};
