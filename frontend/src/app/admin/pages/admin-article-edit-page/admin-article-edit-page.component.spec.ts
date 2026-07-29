import {
  ComponentFixture,
  TestBed
} from '@angular/core/testing';
import {
  ActivatedRoute,
  convertToParamMap,
  provideRouter
} from '@angular/router';
import {
  Observable,
  of,
  throwError
} from 'rxjs';

import { AdminArticleApiService } from '../../articles/admin-article-api.service';
import { AdminArticleDetail } from '../../articles/admin-article-detail';
import { UpdateArticleRequest } from '../../articles/update-article-request';
import { AdminArticleEditPage } from './admin-article-edit-page.component';

describe('AdminArticleEditPage', () => {
  let fixture:
    ComponentFixture<AdminArticleEditPage>;

  let getArticleResponse:
    Observable<AdminArticleDetail>;

  let updateArticleResponse:
    Observable<AdminArticleDetail>;

  let requestedArticleId: number | undefined;
  let updatedArticleId: number | undefined;

  let receivedUpdateRequest:
    UpdateArticleRequest | undefined;

  const originalArticle: AdminArticleDetail = {
    id: 110,
    title: 'Un nuevo artículo',
    pretitle: 'Ensayo',
    excerpt: 'Entradilla original.',
    body: 'Cuerpo original.',
    status: 'DRAFT',
    canBePublished: true,
    slug: null,
    publishedAt: null
  };

  const updatedArticle: AdminArticleDetail = {
    ...originalArticle,
    body: 'Cuerpo actualizado.'
  };

  const adminArticleApiServiceStub = {
    getArticleById(id: number) {
      requestedArticleId = id;

      return getArticleResponse;
    },

    updateArticle(
      id: number,
      request: UpdateArticleRequest
    ) {
      updatedArticleId = id;
      receivedUpdateRequest = request;

      return updateArticleResponse;
    }
  };

  beforeEach(async () => {
    requestedArticleId = undefined;
    updatedArticleId = undefined;
    receivedUpdateRequest = undefined;

    getArticleResponse = of(originalArticle);
    updateArticleResponse = of(updatedArticle);

    await TestBed.configureTestingModule({
      imports: [
        AdminArticleEditPage
      ],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap({
                id: '110'
              })
            }
          }
        },
        {
          provide: AdminArticleApiService,
          useValue: adminArticleApiServiceStub
        }
      ]
    }).compileComponents();
  });

  function createComponent(): void {
    fixture = TestBed.createComponent(
      AdminArticleEditPage
    );

    fixture.detectChanges();
  }

  it('should load and render the article', () => {
    createComponent();

    expect(requestedArticleId).toBe(110);

    const compiled =
      fixture.nativeElement as HTMLElement;

    const titleInput =
      compiled.querySelector<HTMLInputElement>(
        '#article-title'
      );

    const pretitleInput =
      compiled.querySelector<HTMLInputElement>(
        '#article-pretitle'
      );

    const excerptTextarea =
      compiled.querySelector<HTMLTextAreaElement>(
        '#article-excerpt'
      );

    const bodyTextarea =
      compiled.querySelector<HTMLTextAreaElement>(
        '#article-body'
      );

    expect(titleInput?.value)
      .toBe(originalArticle.title);

    expect(pretitleInput?.value)
      .toBe(originalArticle.pretitle);

    expect(excerptTextarea?.value)
      .toBe(originalArticle.excerpt);

    expect(bodyTextarea?.value)
      .toBe(originalArticle.body);

    expect(compiled.textContent)
      .toContain('Borrador');
  });

  it('should update the article when the form is submitted', () => {
    createComponent();

    const compiled =
      fixture.nativeElement as HTMLElement;

    const bodyTextarea =
      compiled.querySelector<HTMLTextAreaElement>(
        '#article-body'
      );

    expect(bodyTextarea).toBeTruthy();

    if (!bodyTextarea) {
      return;
    }

    bodyTextarea.value =
      ' Cuerpo actualizado. ';

    bodyTextarea.dispatchEvent(
      new Event('input')
    );

    fixture.detectChanges();

    const form =
      compiled.querySelector<HTMLFormElement>(
        '.article-form'
      );

    expect(form).toBeTruthy();

    if (!form) {
      return;
    }

    form.dispatchEvent(
      new Event(
        'submit',
        {
          bubbles: true,
          cancelable: true
        }
      )
    );

    fixture.detectChanges();

    expect(updatedArticleId).toBe(110);

    expect(receivedUpdateRequest).toEqual({
      title: 'Un nuevo artículo',
      pretitle: 'Ensayo',
      excerpt: 'Entradilla original.',
      body: 'Cuerpo actualizado.'
    });

    expect(compiled.textContent)
      .toContain(
        'Cambios guardados correctamente'
      );
  });

  it('should show a not found state when the article does not exist', () => {
    getArticleResponse = throwError(() => ({
      status: 404
    }));

    createComponent();

    const compiled =
      fixture.nativeElement as HTMLElement;

    expect(compiled.textContent)
      .toContain(
        'Este artículo no existe'
      );

    expect(
      compiled.querySelector('.article-form')
    ).toBeNull();
  });
});