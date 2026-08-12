import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import {
  ActivatedRouteSnapshot,
  provideRouter,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';

import { firstValueFrom, Observable, of } from 'rxjs';

import { AdminAuthService } from './admin-auth.service';
import { adminAuthGuard } from './admin-auth.guard';

describe('adminAuthGuard', () => {
  const authenticated = signal(false);

  let restoreSessionResult: boolean;

  let restoreSessionCalls: number;

  const adminAuthServiceStub = {
    isAuthenticated: authenticated.asReadonly(),

    restoreSession() {
      restoreSessionCalls++;

      return of(restoreSessionResult);
    },
  };

  beforeEach(() => {
    authenticated.set(false);

    restoreSessionResult = false;
    restoreSessionCalls = 0;

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {
          provide: AdminAuthService,
          useValue: adminAuthServiceStub,
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

    expect(restoreSessionCalls).toBe(0);
  });

  it('should allow an admin when the session is restored', async () => {
    restoreSessionResult = true;

    const result = TestBed.runInInjectionContext(() =>
      adminAuthGuard(
        {} as ActivatedRouteSnapshot,
        {
          url: '/admin/articulos',
        } as RouterStateSnapshot,
      ),
    );

    const resolvedResult = await firstValueFrom(result as Observable<boolean | UrlTree>);

    expect(resolvedResult).toBe(true);

    expect(restoreSessionCalls).toBe(1);
  });

  it('should redirect an anonymous user to login', async () => {
    restoreSessionResult = false;

    const result = TestBed.runInInjectionContext(() =>
      adminAuthGuard(
        {} as ActivatedRouteSnapshot,
        {
          url: '/admin/articulos/25/editar',
        } as RouterStateSnapshot,
      ),
    );

    const resolvedResult = await firstValueFrom(result as Observable<boolean | UrlTree>);

    const urlTree = resolvedResult as UrlTree;

    const router = TestBed.inject(Router);

    expect(router.serializeUrl(urlTree)).toContain('/admin/login');

    expect(urlTree.queryParams['returnUrl']).toBe('/admin/articulos/25/editar');

    expect(restoreSessionCalls).toBe(1);
  });
});
