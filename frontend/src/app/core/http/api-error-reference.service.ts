import {
  Injectable,
  signal,
} from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ApiErrorReferenceService {
  private readonly requestIdState =
    signal<string | null>(null);

  readonly requestId =
    this.requestIdState.asReadonly();

  show(requestId: string): void {
    const normalizedRequestId =
      requestId.trim();

    if (normalizedRequestId) {
      this.requestIdState.set(
        normalizedRequestId,
      );
    }
  }

  clear(): void {
    this.requestIdState.set(null);
  }
}