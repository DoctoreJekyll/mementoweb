import {
  ComponentFixture,
  TestBed
} from '@angular/core/testing';
import {
  ActivatedRoute,
  convertToParamMap,
  provideRouter
} from '@angular/router';
import { of } from 'rxjs';

import { ArticleApiService } from '../../articles/article-api.service';
import { ArticleDetail } from '../../articles/article-detail';
import { ArticlePage } from './article-page.component';

describe('ArticlePage', () => {
  let fixture: ComponentFixture<ArticlePage>;
  let component: ArticlePage;
  let requestedSlug: string | undefined;

  const expectedArticle: ArticleDetail = {
    slug: 'primer-articulo-109',
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

  const articleApiServiceStub = {
    getPublishedArticleBySlug(slug: string) {
      requestedSlug = slug;

      return of(expectedArticle);
    }
  };

  beforeEach(async () => {
    requestedSlug = undefined;

    await TestBed.configureTestingModule({
      imports: [ArticlePage],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap({
                slug: expectedArticle.slug
              })
            }
          }
        },
        {
          provide: ArticleApiService,
          useValue: articleApiServiceStub
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ArticlePage);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should request and render the article from the route slug', () => {
    expect(requestedSlug)
      .toBe(expectedArticle.slug);

    const compiled =
      fixture.nativeElement as HTMLElement;

    const title = compiled.querySelector('h1');

    const body = compiled.querySelector(
      '.article-page__body'
    );

    expect(title?.textContent?.trim())
      .toBe(expectedArticle.title);

    expect(body?.textContent)
      .toContain(expectedArticle.body);
  });
});