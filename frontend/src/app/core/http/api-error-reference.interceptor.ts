import {
  HttpErrorResponse,
  HttpInterceptorFn,
} from '@angular/common/http';

import { inject } from '@angular/core';

import {
  catchError,
  throwError,
} from 'rxjs';

import { ApiErrorReferenceService } from './api-error-reference.service';
import { extractRequestId } from './api-problem-detail';

export const apiErrorReferenceInterceptor:
HttpInterceptorFn = (request, next) => {
  const errorReferenceService =
    inject(ApiErrorReferenceService);

  return next(request).pipe(
    catchError((error: unknown) => {
      if (
        error instanceof HttpErrorResponse
        && error.status >= 500
      ) {
        const requestId =
          extractRequestId(error);

        if (requestId) {
          errorReferenceService.show(
            requestId,
          );
        }
      }

      return throwError(() => error);
    }),
  );
};