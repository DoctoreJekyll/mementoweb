import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  provideRouter,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';

import { AdminAuthService } from './admin-auth.service';
import { adminAuthGuard } from './admin-auth.guard';

describe('adminAuthGuard', () => {
  const authenticated = signal(false);

  beforeEach(() => {
    authenticated.set(false);

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {
          provide: AdminAuthService,
          useValue: {
            isAuthenticated: authenticated.asReadonly(),
          },
        },
      ],
    });
  });

  it('should allow an authenticated admin', () => {
    authenticated.set(true);

    const result = TestBed.runInInjectionContext(() =>
      adminAuthGuard(
        {} as ActivatedRouteSnapshot,
        {
          url: '/admin/articulos',
        } as RouterStateSnapshot,
      ),
    );

    expect(result).toBe(true);
  });

  it('should redirect an anonymous user to login', () => {
    const result = TestBed.runInInjectionContext(() =>
      adminAuthGuard(
        {} as ActivatedRouteSnapshot,
        {
          url: '/admin/articulos/25/editar',
        } as RouterStateSnapshot,
      ),
    );

    const urlTree = result as UrlTree;

    const router = TestBed.inject(Router);

    expect(router.serializeUrl(urlTree)).toContain('/admin/login');

    expect(urlTree.queryParams['returnUrl']).toBe('/admin/articulos/25/editar');
  });
});
