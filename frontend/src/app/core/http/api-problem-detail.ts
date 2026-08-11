import { HttpErrorResponse } from '@angular/common/http';

export interface ApiProblemDetail {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
  requestId?: string;
}

export function extractRequestId(
  error: HttpErrorResponse,
): string | null {
  const body = error.error;

  if (isRecord(body)) {
    const bodyRequestId = body['requestId'];

    if (
      typeof bodyRequestId === 'string'
      && bodyRequestId.trim()
    ) {
      return bodyRequestId.trim();
    }
  }

  const headerRequestId =
    error.headers
      .get('X-Request-ID')
      ?.trim();

  return headerRequestId || null;
}

function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return typeof value === 'object'
    && value !== null;
}