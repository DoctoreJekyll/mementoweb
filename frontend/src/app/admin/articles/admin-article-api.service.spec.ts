import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { PageResponse } from '../../core/page-response';
import { AdminArticleDetail } from './admin-article-detail';
import { AdminArticleSummary } from './admin-article-summary';
import { AdminArticleApiService } from './admin-article-api.service';

describe('AdminArticleApiService', () => {
  let service: AdminArticleApiService;
  let httpTesting: HttpTestingController;

  it('should update an admin article', () => {
  const articleId = 110;

  const requestBody = {
    title: 'Un artículo actualizado',
    pretitle: 'Ensayo',
    excerpt: 'Una entradilla completa.',
    body: 'El cuerpo completo del artículo.'
  };

  const expectedArticle: AdminArticleDetail = {
    id: articleId,
    title: 'Un artículo actualizado',
    pretitle: 'Ensayo',
    excerpt: 'Una entradilla completa.',
    body: 'El cuerpo completo del artículo.',
    status: 'DRAFT',
    canBePublished: true,
    slug: null,
    publishedAt: null
  };

  let receivedArticle:
    AdminArticleDetail | undefined;

    service
      .updateArticle(
        articleId,
        requestBody
      )
      .subscribe(article => {
        receivedArticle = article;
      });

    const request = httpTesting.expectOne(
      `/api/admin/articles/${articleId}`
    );

    expect(request.request.method).toBe('PUT');

    expect(request.request.body).toEqual(
      requestBody
    );

    request.flush(expectedArticle);

    expect(receivedArticle).toEqual(
      expectedArticle
    );
  });


  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AdminArticleApiService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(
      AdminArticleApiService
    );

    httpTesting = TestBed.inject(
      HttpTestingController
    );
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should request the admin article list', () => {
    const expectedResponse:
      PageResponse<AdminArticleSummary> = {
        content: [
          {
            id: 109,
            title: 'El primer artículo',
            pretitle: 'Ensayo',
            status: 'PUBLISHED',
            canBePublished: false,
            slug: 'el-primer-articulo-109',
            publishedAt: '2026-07-29T10:00:00Z'
          }
        ],
        page: 0,
        size: 10,
        totalElements: 1,
        totalPages: 1
      };

    let receivedResponse:
      PageResponse<AdminArticleSummary> | undefined;

    service
      .getArticles()
      .subscribe(response => {
        receivedResponse = response;
      });

    const request = httpTesting.expectOne(request =>
      request.url === '/api/admin/articles'
      && request.params.get('page') === '0'
      && request.params.get('size') === '10'
      && !request.params.has('status')
    );

    expect(request.request.method).toBe('GET');

    request.flush(expectedResponse);

    expect(receivedResponse).toEqual(
      expectedResponse
    );
  });

  it('should request articles filtered by status', () => {
    const expectedResponse:
      PageResponse<AdminArticleSummary> = {
        content: [],
        page: 1,
        size: 5,
        totalElements: 0,
        totalPages: 0
      };

    let receivedResponse:
      PageResponse<AdminArticleSummary> | undefined;

    service
      .getArticles(1, 5, 'DRAFT')
      .subscribe(response => {
        receivedResponse = response;
      });

    const request = httpTesting.expectOne(request =>
      request.url === '/api/admin/articles'
      && request.params.get('page') === '1'
      && request.params.get('size') === '5'
      && request.params.get('status') === 'DRAFT'
    );

    expect(request.request.method).toBe('GET');

    request.flush(expectedResponse);

    expect(receivedResponse).toEqual(
      expectedResponse
    );
  });

  it('should request an admin article by id', () => {
    const expectedArticle: AdminArticleDetail = {
      id: 109,
      title: 'El primer artículo',
      pretitle: 'Ensayo',
      excerpt: 'Entradilla del artículo.',
      body: 'Cuerpo completo del artículo.',
      status: 'PUBLISHED',
      canBePublished: false,
      slug: 'el-primer-articulo-109',
      publishedAt: '2026-07-29T10:00:00Z'
    };

    let receivedArticle:
      AdminArticleDetail | undefined;

    service
      .getArticleById(109)
      .subscribe(article => {
        receivedArticle = article;
      });

    const request = httpTesting.expectOne(
      '/api/admin/articles/109'
    );

    expect(request.request.method).toBe('GET');

    request.flush(expectedArticle);

    expect(receivedArticle).toEqual(
      expectedArticle
    );
  });

  it('should create an article draft', () => {
    const requestBody = {
      title: 'Un nuevo artículo'
    };

    const expectedArticle: AdminArticleDetail = {
      id: 110,
      title: 'Un nuevo artículo',
      pretitle: null,
      excerpt: null,
      body: null,
      status: 'DRAFT',
      canBePublished: false,
      slug: null,
      publishedAt: null
    };

    let receivedArticle:
      AdminArticleDetail | undefined;

    service
      .createArticle(requestBody)
      .subscribe(article => {
        receivedArticle = article;
      });

    const request = httpTesting.expectOne(
      '/api/admin/articles'
    );

    expect(request.request.method).toBe('POST');

    expect(request.request.body).toEqual(
      requestBody
    );

    request.flush(expectedArticle);

    expect(receivedArticle).toEqual(
      expectedArticle
    );
  });
});