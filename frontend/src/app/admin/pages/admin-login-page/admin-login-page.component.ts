import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { AdminAuthService } from '../../auth/admin-auth.service';

type LoginError = 'INVALID_CREDENTIALS' | 'SERVER_ERROR' | null;

@Component({
  selector: 'app-admin-login-page',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './admin-login-page.component.html',
  styleUrl: './admin-login-page.component.scss',
})
export class AdminLoginPage {
  private readonly adminAuthService = inject(AdminAuthService);

  private readonly router = inject(Router);

  protected readonly isSubmitting = signal(false);

  protected readonly loginError = signal<LoginError>(null);

  protected readonly form = new FormGroup({
    username: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),

    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  protected login(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { username, password } = this.form.getRawValue();

    this.isSubmitting.set(true);
    this.loginError.set(null);

    this.adminAuthService
      .login(username.trim(), password)
      .pipe(
        finalize(() => {
          this.isSubmitting.set(false);
        }),
      )
      .subscribe({
        next: () => {
          void this.router.navigate(['/admin/articulos']);
        },

        error: (error: HttpErrorResponse) => {
          if (error.status === 401) {
            this.loginError.set('INVALID_CREDENTIALS');

            return;
          }

          this.loginError.set('SERVER_ERROR');
        },
      });
  }
}
