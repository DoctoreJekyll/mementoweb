import {
  ComponentFixture,
  TestBed
} from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';

import { PageResponse } from '../../../core/page-response';
import { AdminArticleApiService } from '../../articles/admin-article-api.service';
import { AdminArticleSummary } from '../../articles/admin-article-summary';
import { ArticleStatus } from '../../articles/article-status';
import { AdminArticleListPage } from './admin-article-list-page.component';

describe('AdminArticleListPage', () => {
  let fixture:
    ComponentFixture<AdminArticleListPage>;

  let serviceResponse:
    Observable<PageResponse<AdminArticleSummary>>;

  let requestedPage: number | undefined;
  let requestedSize: number | undefined;
  let requestedStatus:
    ArticleStatus | undefined;

  const article: AdminArticleSummary = {
    id: 109,
    title: 'El primer artículo',
    pretitle: 'Ensayo',
    status: 'PUBLISHED',
    canBePublished: false,
    slug: 'el-primer-articulo-109',
    publishedAt: '2026-07-29T10:00:00Z'
  };

  const successfulResponse:
    PageResponse<AdminArticleSummary> = {
      content: [article],
      page: 0,
      size: 5,
      totalElements: 1,
      totalPages: 1
    };

  const adminArticleApiServiceStub = {
    getArticles(
      page: number,
      size: number,
      status?: ArticleStatus
    ) {
      requestedPage = page;
      requestedSize = size;
      requestedStatus = status;

      return serviceResponse;
    }
  };

  beforeEach(async () => {
    requestedPage = undefined;
    requestedSize = undefined;
    requestedStatus = undefined;

    serviceResponse = of(successfulResponse);

    await TestBed.configureTestingModule({
      imports: [AdminArticleListPage],
      providers: [
        provideRouter([]),
        {
          provide: AdminArticleApiService,
          useValue: adminArticleApiServiceStub
        }
      ]
    }).compileComponents();
  });

  function createComponent(): void {
    fixture = TestBed.createComponent(
      AdminArticleListPage
    );

    fixture.detectChanges();
  }

  it('should request and render the article list', () => {
    createComponent();

    expect(requestedPage).toBe(0);
    expect(requestedSize).toBe(5);
    expect(requestedStatus).toBeUndefined();

    const compiled =
      fixture.nativeElement as HTMLElement;

    const title = compiled.querySelector(
      '.admin-article h2'
    );

    const status = compiled.querySelector(
      '.article-status'
    );

    expect(title?.textContent?.trim())
      .toBe(article.title);

    expect(status?.textContent?.trim())
      .toBe('Publicado');

    expect(compiled.textContent)
      .toContain('Artículos encontrados: 1');
  });

  it('should request draft articles when the draft filter is selected', () => {
    createComponent();

    const compiled =
      fixture.nativeElement as HTMLElement;

    const buttons = Array.from(
      compiled.querySelectorAll<HTMLButtonElement>(
        '.article-filters button'
      )
    );

    const draftButton = buttons.find(
      button =>
        button.textContent?.trim() === 'Borradores'
    );

    expect(draftButton).toBeTruthy();

    draftButton?.click();
    fixture.detectChanges();

    expect(requestedPage).toBe(0);
    expect(requestedSize).toBe(5);
    expect(requestedStatus).toBe('DRAFT');

    expect(
      draftButton?.classList.contains('is-active')
    ).toBe(true);
  });

  it('should show an empty state when there are no articles', () => {
    serviceResponse = of({
      content: [],
      page: 0,
      size: 10,
      totalElements: 0,
      totalPages: 0
    });

    createComponent();

    const compiled =
      fixture.nativeElement as HTMLElement;

    expect(compiled.textContent)
      .toContain(
        'No hay artículos en este estado'
      );

    expect(
      compiled.querySelector('.admin-article')
    ).toBeNull();
  });

  it('should show an error state when loading fails', () => {
    serviceResponse = throwError(() => ({
      status: 500
    }));

    createComponent();

    const compiled =
      fixture.nativeElement as HTMLElement;

    const errorState = compiled.querySelector(
      '.admin-state--error'
    );

    expect(errorState).toBeTruthy();

    expect(errorState?.textContent)
      .toContain(
        'No hemos podido cargar los artículos'
      );
  });
});