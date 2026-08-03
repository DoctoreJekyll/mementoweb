import {
  computed,
  inject,
  Injectable,
  signal
} from '@angular/core';

import {
  HttpClient,
  HttpErrorResponse,
  HttpParams
} from '@angular/common/http';

import {
  catchError,
  map,
  Observable,
  of,
  switchMap,
  tap,
  throwError
} from 'rxjs';

import { AdminSession } from './admin-session';

@Injectable({
  providedIn: 'root',
})
export class AdminAuthService {
  private readonly http = inject(HttpClient);

  private readonly authenticatedUsername =
    signal<string | null>(null);

  readonly username =
    this.authenticatedUsername.asReadonly();

  readonly isAuthenticated = computed(
    () => this.authenticatedUsername() !== null
  );

  login(
    username: string,
    password: string
  ): Observable<AdminSession> {

    const requestBody = new HttpParams()
      .set('username', username)
      .set('password', password);

    return this.prepareCsrf().pipe(
      switchMap(() =>
        this.http.post<void>(
          '/api/admin/login',
          requestBody
        )
      ),

      switchMap(() => this.prepareCsrf()),

      switchMap(() =>
        this.loadCurrentSession()
      )
    );
  }

  restoreSession(): Observable<boolean> {
    return this.prepareCsrf().pipe(
      switchMap(() =>
        this.loadCurrentSession()
      ),

      map(() => true),

      catchError(error => {
        this.clearSession();

        if (
          error instanceof HttpErrorResponse
          && error.status === 401
        ) {
          return of(false);
        }

        return throwError(() => error);
      })
    );
  }

  logout(): Observable<void> {
    return this.http
      .post<void>(
        '/api/admin/logout',
        null
      )
      .pipe(
        tap(() => {
          this.clearSession();
        }),

        switchMap(() =>
          this.prepareCsrf()
        )
      );
  }

  clearSession(): void {
    this.authenticatedUsername.set(null);
  }

  private loadCurrentSession():
    Observable<AdminSession> {

    return this.http
      .get<AdminSession>(
        '/api/admin/session'
      )
      .pipe(
        tap(session => {
          this.authenticatedUsername.set(
            session.username
          );
        })
      );
  }

  private prepareCsrf(): Observable<void> {
    return this.http
      .get('/api/auth/csrf')
      .pipe(
        map(() => undefined)
      );
  }
}