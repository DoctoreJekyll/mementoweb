import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { ArticleApiService } from '../../articles/article-api.service';
import { ArticleSummary } from '../../articles/article-summary';
import { PageResponse } from '../../core/page-response';
import { HomePage } from './home-page.component';

describe('HomePage', () => {
  let requestedPage: number | undefined;
  let requestedSize: number | undefined;

  const articles: ArticleSummary[] = [
    {
      slug: 'primer-articulo-109',
      title: 'Primer artículo',
      pretitle: 'Ensayo',
      excerpt: 'Entradilla del primer artículo.',
      publishedAt: '2026-07-29T10:00:00Z', 
      coverImageUrl: null,
      coverImageAlt: null
    },
    {
      slug: 'segundo-articulo-110',
      title: 'Segundo artículo',
      pretitle: 'Reflexión',
      excerpt: 'Entradilla del segundo artículo.',
      publishedAt: '2026-07-28T10:00:00Z',
      coverImageUrl: null,
      coverImageAlt: null
    }
  ];

  const response:
    PageResponse<ArticleSummary> = {
      content: articles,
      page: 0,
      size: 10,
      totalElements: 2,
      totalPages: 1
    };

  const articleApiServiceStub = {
    getPublishedArticles(
      page: number,
      size: number
    ) {
      requestedPage = page;
      requestedSize = size;

      return of(response);
    }
  };

  beforeEach(async () => {
    requestedPage = undefined;
    requestedSize = undefined;

    await TestBed.configureTestingModule({
      imports: [
        HomePage
      ],
      providers: [
        provideRouter([]),
        {
          provide: ArticleApiService,
          useValue: articleApiServiceStub
        }
      ]
    }).compileComponents();
  });

  it('should request and render published articles', () => {
    const fixture = TestBed.createComponent(
      HomePage
    );

    fixture.detectChanges();

    expect(requestedPage).toBe(0);
    expect(requestedSize).toBe(10);

    const compiled =
      fixture.nativeElement as HTMLElement;

    const featuredTitle =
      compiled.querySelector(
        '.featured-article h1'
      );

    const latestTitle =
      compiled.querySelector(
        '.article-summary h3'
      );

    expect(featuredTitle?.textContent)
      .toContain('Primer artículo');

    expect(latestTitle?.textContent)
      .toContain('Segundo artículo');
  });
});