import { provideHttpClient } from '@angular/common/http';

import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { TestBed } from '@angular/core/testing';

import { AdminAuthService } from './admin-auth.service';

describe('AdminAuthService', () => {
  let service: AdminAuthService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AdminAuthService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(
      AdminAuthService,
    );

    httpTesting = TestBed.inject(
      HttpTestingController,
    );
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should authenticate valid credentials', () => {
    const username = 'test-admin';
    const password = 'test-password';

    service
      .login(username, password)
      .subscribe();

    const initialCsrfRequest =
      httpTesting.expectOne(
        '/api/auth/csrf',
      );

    expect(
      initialCsrfRequest.request.method,
    ).toBe('GET');

    initialCsrfRequest.flush({
      token: 'initial-csrf-token',
    });

    const loginRequest =
      httpTesting.expectOne(
        '/api/admin/login',
      );

    expect(
      loginRequest.request.method,
    ).toBe('POST');

    expect(
      loginRequest.request.body.get(
        'username',
      ),
    ).toBe(username);

    expect(
      loginRequest.request.body.get(
        'password',
      ),
    ).toBe(password);

    expect(
      loginRequest.request.headers.has(
        'Authorization',
      ),
    ).toBe(false);

    loginRequest.flush(
      null,
      {
        status: 204,
        statusText: 'No Content',
      },
    );

    const renewedCsrfRequest =
      httpTesting.expectOne(
        '/api/auth/csrf',
      );

    expect(
      renewedCsrfRequest.request.method,
    ).toBe('GET');

    renewedCsrfRequest.flush({
      token: 'renewed-csrf-token',
    });

    const sessionRequest =
      httpTesting.expectOne(
        '/api/admin/session',
      );

    expect(
      sessionRequest.request.method,
    ).toBe('GET');

    expect(
      sessionRequest.request.headers.has(
        'Authorization',
      ),
    ).toBe(false);

    sessionRequest.flush({
      username,
    });

    expect(
      service.isAuthenticated(),
    ).toBe(true);

    expect(
      service.username(),
    ).toBe(username);
  });

  it('should remain logged out when credentials are invalid', () => {
    let receivedStatus:
      number | undefined;

    service
      .login(
        'test-admin',
        'incorrect-password',
      )
      .subscribe({
        error: (error) => {
          receivedStatus = error.status;
        },
      });

    const csrfRequest =
      httpTesting.expectOne(
        '/api/auth/csrf',
      );

    csrfRequest.flush({
      token: 'csrf-token',
    });

    const loginRequest =
      httpTesting.expectOne(
        '/api/admin/login',
      );

    expect(
      loginRequest.request.method,
    ).toBe('POST');

    loginRequest.flush(
      {
        title: 'Unauthorized',
        status: 401,
      },
      {
        status: 401,
        statusText: 'Unauthorized',
      },
    );

    expect(receivedStatus).toBe(401);

    expect(
      service.isAuthenticated(),
    ).toBe(false);

    expect(
      service.username(),
    ).toBeNull();
  });

  it('should clear authentication on logout', () => {
    const username = 'test-admin';

    service
      .login(
        username,
        'test-password',
      )
      .subscribe();

    const initialCsrfRequest =
      httpTesting.expectOne(
        '/api/auth/csrf',
      );

    initialCsrfRequest.flush({
      token: 'initial-csrf-token',
    });

    const loginRequest =
      httpTesting.expectOne(
        '/api/admin/login',
      );

    loginRequest.flush(
      null,
      {
        status: 204,
        statusText: 'No Content',
      },
    );

    const renewedLoginCsrfRequest =
      httpTesting.expectOne(
        '/api/auth/csrf',
      );

    renewedLoginCsrfRequest.flush({
      token: 'login-csrf-token',
    });

    const sessionRequest =
      httpTesting.expectOne(
        '/api/admin/session',
      );

    sessionRequest.flush({
      username,
    });

    expect(
      service.isAuthenticated(),
    ).toBe(true);

    service
      .logout()
      .subscribe();

    const logoutRequest =
      httpTesting.expectOne(
        '/api/admin/logout',
      );

    expect(
      logoutRequest.request.method,
    ).toBe('POST');

    logoutRequest.flush(
      null,
      {
        status: 204,
        statusText: 'No Content',
      },
    );

    const logoutCsrfRequest =
      httpTesting.expectOne(
        '/api/auth/csrf',
      );

    logoutCsrfRequest.flush({
      token: 'logout-csrf-token',
    });

    expect(
      service.isAuthenticated(),
    ).toBe(false);

    expect(
      service.username(),
    ).toBeNull();
  });
});