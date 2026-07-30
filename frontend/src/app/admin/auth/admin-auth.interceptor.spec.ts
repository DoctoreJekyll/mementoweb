import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { AdminAuthService } from './admin-auth.service';
import { adminAuthInterceptor } from './admin-auth.interceptor';

describe('adminAuthInterceptor', () => {
  let http: HttpClient;
  let httpTesting: HttpTestingController;
  let authService: AdminAuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([adminAuthInterceptor])),
        provideHttpClientTesting(),
      ],
    });

    http = TestBed.inject(HttpClient);

    httpTesting = TestBed.inject(HttpTestingController);

    authService = TestBed.inject(AdminAuthService);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should add authorization to admin requests after login', () => {
    const username = 'test-admin';
    const password = 'test-password';

    const expectedAuthorization = `Basic ${btoa(`${username}:${password}`)}`;

    authService.login(username, password).subscribe();

    const loginRequest = httpTesting.expectOne('/api/admin/session');

    expect(loginRequest.request.headers.get('Authorization')).toBe(expectedAuthorization);

    loginRequest.flush({
      username,
    });

    http.get('/api/admin/articles').subscribe();

    const articlesRequest = httpTesting.expectOne('/api/admin/articles');

    expect(articlesRequest.request.headers.get('Authorization')).toBe(expectedAuthorization);

    articlesRequest.flush({
      content: [],
      page: 0,
      size: 10,
      totalElements: 0,
      totalPages: 0,
    });
  });

  it('should not add authorization before login', () => {
    http.get('/api/admin/articles').subscribe();

    const request = httpTesting.expectOne('/api/admin/articles');

    expect(request.request.headers.has('Authorization')).toBe(false);

    request.flush({
      content: [],
      page: 0,
      size: 10,
      totalElements: 0,
      totalPages: 0,
    });
  });

  it('should not send admin credentials to public endpoints', () => {
    authService.login('test-admin', 'test-password').subscribe();

    const loginRequest = httpTesting.expectOne('/api/admin/session');

    loginRequest.flush({
      username: 'test-admin',
    });

    http.get('/api/articles').subscribe();

    const publicRequest = httpTesting.expectOne('/api/articles');

    expect(publicRequest.request.headers.has('Authorization')).toBe(false);

    publicRequest.flush({
      content: [],
      page: 0,
      size: 10,
      totalElements: 0,
      totalPages: 0,
    });
  });
});
