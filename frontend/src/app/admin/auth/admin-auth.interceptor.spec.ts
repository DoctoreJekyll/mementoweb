import {
  HttpClient,
  provideHttpClient,
  withInterceptors
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import {
  NavigationExtras,
  Router
} from '@angular/router';

import { AdminAuthService } from './admin-auth.service';
import { adminAuthInterceptor } from './admin-auth.interceptor';

describe('adminAuthInterceptor', () => {
  let httpClient: HttpClient;
  let httpTesting: HttpTestingController;

  let authorizationHeader: string | null;
  let authenticated: boolean;
  let logoutCalls: number;

  let currentUrl: string;
  let navigatedCommands:
    unknown[] | undefined;
  let navigationExtras:
    NavigationExtras | undefined;

  const adminAuthServiceStub = {
    getAuthorizationHeader() {
      return authorizationHeader;
    },

    isAuthenticated() {
      return authenticated;
    },

    logout() {
      authorizationHeader = null;
      authenticated = false;
      logoutCalls++;
    }
  };

  const routerStub = {
    get url() {
      return currentUrl;
    },

    navigate(
      commands: unknown[],
      extras?: NavigationExtras
    ) {
      navigatedCommands = commands;
      navigationExtras = extras;

      return Promise.resolve(true);
    }
  };

  beforeEach(() => {
    authorizationHeader = null;
    authenticated = false;
    logoutCalls = 0;

    currentUrl = '/';
    navigatedCommands = undefined;
    navigationExtras = undefined;

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(
          withInterceptors([
            adminAuthInterceptor
          ])
        ),
        provideHttpClientTesting(),
        {
          provide: AdminAuthService,
          useValue: adminAuthServiceStub
        },
        {
          provide: Router,
          useValue: routerStub
        }
      ]
    });

    httpClient = TestBed.inject(HttpClient);

    httpTesting = TestBed.inject(
      HttpTestingController
    );
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should not add authorization to public requests', () => {
    authorizationHeader =
      'Basic stored-credentials';

    authenticated = true;

    httpClient
      .get('/api/articles')
      .subscribe();

    const request = httpTesting.expectOne(
      '/api/articles'
    );

    expect(
      request.request.headers.has(
        'Authorization'
      )
    ).toBe(false);

    request.flush({
      content: []
    });
  });

  it('should not replace an existing authorization header', () => {
    authorizationHeader =
      'Basic stored-credentials';

    authenticated = true;

    httpClient
      .get(
        '/api/admin/session',
        {
          headers: {
            Authorization:
              'Basic login-credentials'
          }
        }
      )
      .subscribe();

    const request = httpTesting.expectOne(
      '/api/admin/session'
    );

    expect(
      request.request.headers.get(
        'Authorization'
      )
    ).toBe('Basic login-credentials');

    request.flush({
      username: 'admin'
    });
  });

  it('should add stored authorization to admin requests', () => {
    authorizationHeader =
      'Basic stored-credentials';

    authenticated = true;

    httpClient
      .get('/api/admin/articles')
      .subscribe();

    const request = httpTesting.expectOne(
      '/api/admin/articles'
    );

    expect(
      request.request.headers.get(
        'Authorization'
      )
    ).toBe('Basic stored-credentials');

    request.flush({
      content: []
    });
  });

  it('should leave admin requests unchanged when there are no stored credentials', () => {
    httpClient
      .get('/api/admin/articles')
      .subscribe();

    const request = httpTesting.expectOne(
      '/api/admin/articles'
    );

    expect(
      request.request.headers.has(
        'Authorization'
      )
    ).toBe(false);

    request.flush({
      content: []
    });

    expect(logoutCalls).toBe(0);

    expect(
      navigatedCommands
    ).toBeUndefined();

    expect(
      navigationExtras
    ).toBeUndefined();
  });

  it('should logout and redirect when stored credentials receive a 401', () => {
    authorizationHeader =
      'Basic expired-credentials';

    authenticated = true;

    currentUrl =
      '/admin/articulos/109/editar';

    let receivedStatus:
      number | undefined;

    httpClient
      .get('/api/admin/articles/109')
      .subscribe({
        error: error => {
          receivedStatus = error.status;
        }
      });

    const request = httpTesting.expectOne(
      '/api/admin/articles/109'
    );

    expect(
      request.request.headers.get(
        'Authorization'
      )
    ).toBe('Basic expired-credentials');

    request.flush(
      {},
      {
        status: 401,
        statusText: 'Unauthorized'
      }
    );

    expect(logoutCalls).toBe(1);
    expect(authenticated).toBe(false);
    expect(authorizationHeader).toBeNull();

    expect(navigatedCommands).toEqual([
      '/admin/login'
    ]);

    expect(navigationExtras).toEqual({
      queryParams: {
        returnUrl:
          '/admin/articulos/109/editar'
      },
      replaceUrl: true
    });

    expect(receivedStatus).toBe(401);
  });

  it('should not logout or redirect after an invalid login attempt', () => {
    let receivedStatus:
      number | undefined;

    httpClient
      .get(
        '/api/admin/session',
        {
          headers: {
            Authorization:
              'Basic invalid-login'
          }
        }
      )
      .subscribe({
        error: error => {
          receivedStatus = error.status;
        }
      });

    const request = httpTesting.expectOne(
      '/api/admin/session'
    );

    expect(
      request.request.headers.get(
        'Authorization'
      )
    ).toBe('Basic invalid-login');

    request.flush(
      {},
      {
        status: 401,
        statusText: 'Unauthorized'
      }
    );

    expect(logoutCalls).toBe(0);

    expect(
      navigatedCommands
    ).toBeUndefined();

    expect(
      navigationExtras
    ).toBeUndefined();

    expect(receivedStatus).toBe(401);
  });
});