import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { PageResponse } from '../core/page-response';
import { ArticleSummary } from './article-summary';

@Injectable({
  providedIn: 'root'
})
export class ArticleApiService {

    private readonly http = inject(HttpClient);

    getPublishedArticles(page: number = 0, size: number = 10): Observable<PageResponse<ArticleSummary>> {
        return this.http.get<PageResponse<ArticleSummary>>(
            '/api/articles',
            {
            params: {
                page,
                size
            }
            }
        );
    }

}