import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { AdminAuthService } from './admin-auth.service';

describe('AdminAuthService', () => {
  let service: AdminAuthService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AdminAuthService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(AdminAuthService);

    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should authenticate valid credentials', () => {
    const username = 'test-admin';
    const password = 'test-password';

    const expectedAuthorization = `Basic ${btoa(`${username}:${password}`)}`;

    service.login(username, password).subscribe();

    const request = httpTesting.expectOne('/api/admin/session');

    expect(request.request.method).toBe('GET');

    expect(request.request.headers.get('Authorization')).toBe(expectedAuthorization);

    request.flush({
      username,
    });

    expect(service.isAuthenticated()).toBe(true);

    expect(service.username()).toBe(username);

    expect(service.getAuthorizationHeader()).toBe(expectedAuthorization);
  });

  it('should remain logged out when credentials are invalid', () => {
    let receivedStatus: number | undefined;

    service.login('test-admin', 'incorrect-password').subscribe({
      error: (error) => {
        receivedStatus = error.status;
      },
    });

    const request = httpTesting.expectOne('/api/admin/session');

    request.flush(
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

    expect(service.isAuthenticated()).toBe(false);

    expect(service.username()).toBeNull();

    expect(service.getAuthorizationHeader()).toBeNull();
  });

  it('should clear authentication on logout', () => {
    service.login('test-admin', 'test-password').subscribe();

    const request = httpTesting.expectOne('/api/admin/session');

    request.flush({
      username: 'test-admin',
    });

    expect(service.isAuthenticated()).toBe(true);

    service.logout();

    expect(service.isAuthenticated()).toBe(false);

    expect(service.username()).toBeNull();

    expect(service.getAuthorizationHeader()).toBeNull();
  });
});
