import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';

import { AdminAuthService } from '../../auth/admin-auth.service';

@Component({
  selector: 'app-admin-layout',
  imports: [RouterLink, RouterOutlet],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.scss',
})
export class AdminLayout {
  private readonly adminAuthService = inject(AdminAuthService);

  private readonly router = inject(Router);

  protected readonly username = this.adminAuthService.username;

  protected logout(): void {
    this.adminAuthService.logout();

    void this.router.navigate(['/admin/login']);
  }
}
