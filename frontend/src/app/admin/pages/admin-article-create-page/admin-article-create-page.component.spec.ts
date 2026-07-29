import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { AdminArticleApiService } from '../../articles/admin-article-api.service';
import { AdminArticleCreatePage } from './admin-article-create-page.component';

describe('AdminArticleCreatePage', () => {
  const adminArticleApiServiceStub = {
    createArticle() {
      return of({
        id: 110,
        title: 'Un nuevo artículo',
        pretitle: null,
        excerpt: null,
        body: null,
        status: 'DRAFT',
        canBePublished: false,
        slug: null,
        publishedAt: null
      });
    }
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        AdminArticleCreatePage
      ],
      providers: [
        provideRouter([]),
        {
          provide: AdminArticleApiService,
          useValue: adminArticleApiServiceStub
        }
      ]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(
      AdminArticleCreatePage
    );

    const component =
      fixture.componentInstance;

    expect(component).toBeTruthy();
  });
});