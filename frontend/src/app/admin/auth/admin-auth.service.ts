import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

import { AdminSession } from './admin-session';

@Injectable({
  providedIn: 'root',
})
export class AdminAuthService {
  private readonly http = inject(HttpClient);

  private readonly authorizationHeaderValue = signal<string | null>(null);

  private readonly authenticatedUsername = signal<string | null>(null);

  readonly username = this.authenticatedUsername.asReadonly();

  readonly isAuthenticated = computed(() => this.authorizationHeaderValue() !== null);

  login(username: string, password: string): Observable<AdminSession> {
    const authorization = this.createBasicAuthorization(username, password);

    return this.http
      .get<AdminSession>('/api/admin/session', {
        headers: {
          Authorization: authorization,
        },
      })
      .pipe(
        tap((session) => {
          this.authorizationHeaderValue.set(authorization);

          this.authenticatedUsername.set(session.username);
        }),
      );
  }

  logout(): void {
    this.authorizationHeaderValue.set(null);
    this.authenticatedUsername.set(null);
  }

  getAuthorizationHeader(): string | null {
    return this.authorizationHeaderValue();
  }

  private createBasicAuthorization(username: string, password: string): string {
    const credentials = `${username}:${password}`;

    return `Basic ${btoa(credentials)}`;
  }
}
