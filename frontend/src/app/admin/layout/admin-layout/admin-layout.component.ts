import { Component, inject, type OnInit } from '@angular/core';

import { Router, RouterLink, RouterOutlet } from '@angular/router';

import { AdminAuthService } from '../../auth/admin-auth.service';
import { SeoService } from '../../../core/seo.service';

@Component({
  selector: 'app-admin-layout',
  imports: [RouterLink, RouterOutlet],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.scss',
})
export class AdminLayout implements OnInit {
  private readonly adminAuthService = inject(AdminAuthService);

  private readonly router = inject(Router);

  private readonly seoService = inject(SeoService);

  protected readonly username = this.adminAuthService.username;

  ngOnInit(): void {
    this.seoService.setAdminPage();
  }

  protected logout(): void {
    this.adminAuthService.logout().subscribe({
      next: () => {
        void this.router.navigate(['/admin/login'], {
          replaceUrl: true,
        });
      },

      error: (error) => {
        console.error('Could not close admin session', error);
      },
    });
  }
}
