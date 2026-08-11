import { Component, inject } from '@angular/core';

import { RouterLink, RouterOutlet } from '@angular/router';

import { ApiErrorReferenceService } from './core/http/api-error-reference.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class App {
  private readonly apiErrorReferenceService = inject(ApiErrorReferenceService);

  protected readonly errorRequestId = this.apiErrorReferenceService.requestId;

  protected dismissApiError(): void {
    this.apiErrorReferenceService.clear();
  }
}
