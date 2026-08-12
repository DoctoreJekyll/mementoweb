import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { PageResponse } from '../core/page-response';
import { ArticleApiService } from './article-api.service';
import { ArticleDetail } from './article-detail';
import { ArticleSummary } from './article-summary';

describe('ArticleApiService', () => {
  let service: ArticleApiService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ArticleApiService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(ArticleApiService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should request published articles with pagination', () => {
    const expectedResponse: PageResponse<ArticleSummary> = {
      content: [
        {
          slug: 'primer-articulo-109',
          title: 'Primer artículo',
          pretitle: 'Ensayo',
          excerpt: 'Entradilla del artículo.',
          publishedAt: '2026-07-29T10:00:00Z',
          coverImageUrl: null,
          coverImageAlt: null
        }
      ],
      page: 2,
      size: 5,
      totalElements: 11,
      totalPages: 3
    };

    let receivedResponse:
      PageResponse<ArticleSummary> | undefined;

    service
      .getPublishedArticles(2, 5)
      .subscribe(response => {
        receivedResponse = response;
      });

    const request = httpTesting.expectOne(request =>
      request.url === '/api/articles'
      && request.params.get('page') === '2'
      && request.params.get('size') === '5'
    );

    expect(request.request.method).toBe('GET');

    request.flush(expectedResponse);

    expect(receivedResponse).toEqual(expectedResponse);
  });

  it('should request a published article by slug', () => {
    const slug = 'primer-articulo-109';

    const expectedArticle: ArticleDetail = {
      slug,
      title: 'Primer artículo',
      pretitle: 'Ensayo',
      excerpt: 'Entradilla del artículo.',
      body: 'Cuerpo completo del artículo.',
      publishedAt: '2026-07-29T10:00:00Z',
      coverImageUrl: null,
      coverImageAlt: null,
      recommendedAudioTitle: null,
      recommendedAudioAuthor: null,
      recommendedAudioUrl: null
    };

    let receivedArticle: ArticleDetail | undefined;

    service
      .getPublishedArticleBySlug(slug)
      .subscribe(article => {
        receivedArticle = article;
      });

    const request = httpTesting.expectOne(
      `/api/articles/${slug}`
    );

    expect(request.request.method).toBe('GET');

    request.flush(expectedArticle);

    expect(receivedArticle).toEqual(expectedArticle);
  });

  it('should propagate a 404 response', () => {
    const slug = 'articulo-inexistente';
    let receivedStatus: number | undefined;

    service
      .getPublishedArticleBySlug(slug)
      .subscribe({
        error: error => {
          receivedStatus = error.status;
        }
      });

    const request = httpTesting.expectOne(
      `/api/articles/${slug}`
    );

    request.flush(
      {
        title: 'Published article not found',
        status: 404
      },
      {
        status: 404,
        statusText: 'Not Found'
      }
    );

    expect(receivedStatus).toBe(404);
  });
});