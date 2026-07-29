import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { PageResponse } from '../../core/page-response';
import { AdminArticleDetail } from './admin-article-detail';
import { AdminArticleSummary } from './admin-article-summary';
import { ArticleStatus } from './article-status';

@Injectable({
  providedIn: 'root'
})
export class AdminArticleApiService {
  private readonly http = inject(HttpClient);

  private readonly baseUrl =
    '/api/admin/articles';


    getArticles(page = 0,size = 10,status?: ArticleStatus): Observable<PageResponse<AdminArticleSummary>> {
      let params = new HttpParams()
        .set('page', page)
        .set('size', size);

      if (status) {
        params = params.set('status', status);
      }

      return this.http.get<
        PageResponse<AdminArticleSummary>
      >(
        this.baseUrl,
        { params }
      );
    }

    getArticleById(id: number): Observable<AdminArticleDetail> {
      return this.http.get<AdminArticleDetail>(
        `${this.baseUrl}/${id}`
      );
    }
}