import { inject } from '@angular/core';
import { CanActivateChildFn, Router } from '@angular/router';

import { AdminAuthService } from './admin-auth.service';

export const adminAuthGuard: CanActivateChildFn = (_route, state) => {
  const adminAuthService = inject(AdminAuthService);

  if (adminAuthService.isAuthenticated()) {
    return true;
  }

  const router = inject(Router);

  return router.createUrlTree(['/admin/login'], {
    queryParams: {
      returnUrl: state.url,
    },
  });
};
