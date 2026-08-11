import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';

import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { adminAuthInterceptor } from './admin/auth/admin-auth.interceptor';

import { apiErrorReferenceInterceptor } from './core/http/api-error-reference.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([apiErrorReferenceInterceptor, adminAuthInterceptor])),
  ],
};
