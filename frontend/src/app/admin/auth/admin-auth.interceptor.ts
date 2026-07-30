import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { AdminAuthService } from './admin-auth.service';

export const adminAuthInterceptor: HttpInterceptorFn = (request, next) => {
  const isAdminRequest = request.url.startsWith('/api/admin/');

  if (!isAdminRequest) {
    return next(request);
  }

  if (request.headers.has('Authorization')) {
    return next(request);
  }

  const adminAuthService = inject(AdminAuthService);

  const authorization = adminAuthService.getAuthorizationHeader();

  if (!authorization) {
    return next(request);
  }

  const authenticatedRequest = request.clone({
    setHeaders: {
      Authorization: authorization,
    },
  });

  return next(authenticatedRequest);
};
