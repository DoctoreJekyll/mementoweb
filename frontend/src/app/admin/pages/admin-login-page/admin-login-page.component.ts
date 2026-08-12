import { HttpErrorResponse } from '@angular/common/http';

import { Component, inject, signal, type OnInit } from '@angular/core';

import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { finalize } from 'rxjs';

import { AdminAuthService } from '../../auth/admin-auth.service';
import { SeoService } from '../../../core/seo.service';

type LoginError = 'INVALID_CREDENTIALS' | 'TOO_MANY_ATTEMPTS' | 'SERVER_ERROR' | null;

@Component({
  selector: 'app-admin-login-page',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './admin-login-page.component.html',
  styleUrl: './admin-login-page.component.scss',
})
export class AdminLoginPage implements OnInit {
  private readonly adminAuthService = inject(AdminAuthService);

  private readonly router = inject(Router);

  private readonly route = inject(ActivatedRoute);

  private readonly seoService = inject(SeoService);

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

  ngOnInit(): void {
    this.seoService.setAdminPage();
  }

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
          void this.router.navigateByUrl(this.getReturnUrl());
        },

        error: (error: HttpErrorResponse) => {
          if (error.status === 401) {
            this.loginError.set('INVALID_CREDENTIALS');

            return;
          }

          if (error.status === 429) {
            this.loginError.set('TOO_MANY_ATTEMPTS');

            return;
          }

          this.loginError.set('SERVER_ERROR');
        },
      });
  }

  private getReturnUrl(): string {
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');

    const isAdminDestination = returnUrl?.startsWith('/admin/');

    const isLoginPage = returnUrl?.startsWith('/admin/login');

    if (returnUrl && isAdminDestination && !isLoginPage) {
      return returnUrl;
    }

    return '/admin/articulos';
  }
}
