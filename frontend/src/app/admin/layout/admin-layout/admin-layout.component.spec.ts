import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { vi } from 'vitest';

import { AdminAuthService } from '../../auth/admin-auth.service';
import { AdminLayout } from './admin-layout.component';

describe('AdminLayout', () => {
  let component: AdminLayout;
  let fixture: ComponentFixture<AdminLayout>;

  const username = signal<string | null>('test-admin');

  const logout = vi.fn(() => {
    username.set(null);
  });

  beforeEach(async () => {
    username.set('test-admin');
    logout.mockClear();

    await TestBed.configureTestingModule({
      imports: [AdminLayout],
      providers: [
        provideRouter([]),
        {
          provide: AdminAuthService,
          useValue: {
            username: username.asReadonly(),
            logout,
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminLayout);

    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the authenticated username', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    const usernameElement = compiled.querySelector('.admin-shell__username');

    expect(usernameElement?.textContent?.trim()).toBe('test-admin');
  });

  it('should logout and navigate to login', () => {
    const router = TestBed.inject(Router);

    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    const compiled = fixture.nativeElement as HTMLElement;

    const logoutButton = compiled.querySelector('.admin-shell__logout') as HTMLButtonElement;

    logoutButton.click();

    expect(logout).toHaveBeenCalledOnce();

    expect(navigateSpy).toHaveBeenCalledWith(['/admin/login'], {
      replaceUrl: true,
    });
  });
});
