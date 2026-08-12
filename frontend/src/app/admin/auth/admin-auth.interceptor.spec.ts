import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';

import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { TestBed } from '@angular/core/testing';

import { NavigationExtras, Router } from '@angular/router';

import { AdminAuthService } from './admin-auth.service';
import { adminAuthInterceptor } from './admin-auth.interceptor';

describe('adminAuthInterceptor', () => {
  let httpClient: HttpClient;

  let httpTesting: HttpTestingController;

  let authenticated: boolean;

  let clearSessionCalls: number;

  let currentUrl: string;

  let navigatedCommands: unknown[] | undefined;

  let navigationExtras: NavigationExtras | undefined;

  const adminAuthServiceStub = {
    isAuthenticated() {
      return authenticated;
    },

    clearSession() {
      authenticated = false;
      clearSessionCalls++;
    },
  };

  const routerStub = {
    get url() {
      return currentUrl;
    },

    navigate(commands: unknown[], extras?: NavigationExtras) {
      navigatedCommands = commands;
      navigationExtras = extras;

      return Promise.resolve(true);
    },
  };

  beforeEach(() => {
    authenticated = false;
    clearSessionCalls = 0;

    currentUrl = '/';

    navigatedCommands = undefined;
    navigationExtras = undefined;

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([adminAuthInterceptor])),

        provideHttpClientTesting(),

        {
          provide: AdminAuthService,
          useValue: adminAuthServiceStub,
        },

        {
          provide: Router,
          useValue: routerStub,
        },
      ],
    });

    httpClient = TestBed.inject(HttpClient);

    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should leave public requests unchanged', () => {
    httpClient.get('/api/articles').subscribe();

    const request = httpTesting.expectOne('/api/articles');

    expect(request.request.headers.has('Authorization')).toBe(false);

    request.flush({
      content: [],
    });
  });

  it('should not replace an existing authorization header', () => {
    httpClient
      .get('/api/admin/session', {
        headers: {
          Authorization: 'Existing credentials',
        },
      })
      .subscribe();

    const request = httpTesting.expectOne('/api/admin/session');

    expect(request.request.headers.get('Authorization')).toBe('Existing credentials');

    request.flush({
      username: 'admin',
    });
  });

  it('should not add authorization headers to admin requests', () => {
    authenticated = true;

    httpClient.get('/api/admin/articles').subscribe();

    const request = httpTesting.expectOne('/api/admin/articles');

    expect(request.request.headers.has('Authorization')).toBe(false);

    request.flush({
      content: [],
    });
  });

  it('should leave anonymous admin requests unchanged', () => {
    httpClient.get('/api/admin/articles').subscribe();

    const request = httpTesting.expectOne('/api/admin/articles');

    expect(request.request.headers.has('Authorization')).toBe(false);

    request.flush({
      content: [],
    });

    expect(clearSessionCalls).toBe(0);

    expect(navigatedCommands).toBeUndefined();

    expect(navigationExtras).toBeUndefined();
  });

  it('should clear the session and redirect after an authenticated admin receives a 401', () => {
    authenticated = true;

    currentUrl = '/admin/articulos/109/editar';

    let receivedStatus: number | undefined;

    httpClient.get('/api/admin/articles/109').subscribe({
      error: (error) => {
        receivedStatus = error.status;
      },
    });

    const request = httpTesting.expectOne('/api/admin/articles/109');

    expect(request.request.headers.has('Authorization')).toBe(false);

    request.flush(
      {},
      {
        status: 401,
        statusText: 'Unauthorized',
      },
    );

    expect(clearSessionCalls).toBe(1);

    expect(authenticated).toBe(false);

    expect(navigatedCommands).toEqual(['/admin/login']);

    expect(navigationExtras).toEqual({
      queryParams: {
        returnUrl: '/admin/articulos/109/editar',
      },
      replaceUrl: true,
    });

    expect(receivedStatus).toBe(401);
  });

  it('should not redirect after an invalid login attempt', () => {
    let receivedStatus: number | undefined;

    httpClient.post('/api/admin/login', null).subscribe({
      error: (error) => {
        receivedStatus = error.status;
      },
    });

    const request = httpTesting.expectOne('/api/admin/login');

    request.flush(
      {},
      {
        status: 401,
        statusText: 'Unauthorized',
      },
    );

    expect(clearSessionCalls).toBe(0);

    expect(navigatedCommands).toBeUndefined();

    expect(navigationExtras).toBeUndefined();

    expect(receivedStatus).toBe(401);
  });
});
