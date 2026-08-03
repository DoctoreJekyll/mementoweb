import { inject } from '@angular/core';

import {
  CanActivateFn,
  Router
} from '@angular/router';

import {
  catchError,
  map,
  of
} from 'rxjs';

import { AdminAuthService } from './admin-auth.service';

export const adminAuthGuard:
  CanActivateFn = (route, state) => {

  const adminAuthService =
    inject(AdminAuthService);

  const router = inject(Router);

  if (adminAuthService.isAuthenticated()) {
    return true;
  }

  return adminAuthService
    .restoreSession()
    .pipe(
      map(authenticated => {
        if (authenticated) {
          return true;
        }

        return router.createUrlTree(
          ['/admin/login'],
          {
            queryParams: {
              returnUrl: state.url
            }
          }
        );
      }),

      catchError(error => {
        console.error(
          'Could not restore admin session',
          error
        );

        return of(
          router.createUrlTree(
            ['/admin/login'],
            {
              queryParams: {
                returnUrl: state.url
              }
            }
          )
        );
      })
    );
};