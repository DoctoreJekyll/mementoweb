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

  let publishArticleResponse:
    Observable<AdminArticleDetail>;

  let withdrawArticleResponse:
    Observable<AdminArticleDetail>;

  let requestedArticleId: number | undefined;
  let updatedArticleId: number | undefined;
  let publishedArticleId: number | undefined;
  let withdrawnArticleId: number | undefined;

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
    publishedAt: null,
    coverImageUrl: null,
    coverImageAlt: null,
    recommendedAudioTitle: null,
    recommendedAudioAuthor: null,
    recommendedAudioUrl: null
  };

  const updatedArticle: AdminArticleDetail = {
    ...originalArticle,
    body: 'Cuerpo actualizado.'
  };

  const publishedArticle: AdminArticleDetail = {
    ...originalArticle,
    status: 'PUBLISHED',
    canBePublished: false,
    slug: 'un-nuevo-articulo-110',
    publishedAt: '2026-07-29T16:00:00Z'
  };

  const withdrawnArticle: AdminArticleDetail = {
    ...publishedArticle,
    status: 'WITHDRAWN',
    canBePublished: true
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
    },

    publishArticle(id: number) {
      publishedArticleId = id;

      return publishArticleResponse;
    },

    withdrawArticle(id: number) {
      withdrawnArticleId = id;

      return withdrawArticleResponse;
    }
  };

  beforeEach(async () => {
    requestedArticleId = undefined;
    updatedArticleId = undefined;
    publishedArticleId = undefined;
    withdrawnArticleId = undefined;
    receivedUpdateRequest = undefined;

    getArticleResponse = of(originalArticle);
    updateArticleResponse = of(updatedArticle);
    publishArticleResponse = of(publishedArticle);
    withdrawArticleResponse = of(withdrawnArticle);

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

  function getCompiled(): HTMLElement {
    return fixture.nativeElement as HTMLElement;
  }

  it('should load and render the article', () => {
    createComponent();

    expect(requestedArticleId).toBe(110);

    const compiled = getCompiled();

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

    const compiled = getCompiled();

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

  it('should publish a complete saved article', () => {
    createComponent();

    const compiled = getCompiled();

    const publishButton =
      compiled.querySelector<HTMLButtonElement>(
        '.editorial-action--publish'
      );

    expect(publishButton).toBeTruthy();
    expect(publishButton?.disabled).toBe(false);

    publishButton?.click();
    fixture.detectChanges();

    expect(publishedArticleId).toBe(110);

    expect(compiled.textContent)
      .toContain(
        'Artículo publicado correctamente'
      );

    expect(
      compiled.querySelector(
        '.article-status'
      )?.textContent
    ).toContain('Publicado');

    expect(
      compiled.querySelector(
        '.editorial-action--view'
      )
    ).toBeTruthy();

    expect(
      compiled.querySelector(
        '.editorial-action--withdraw'
      )
    ).toBeTruthy();
  });

  it('should prevent publication when there are unsaved changes', () => {
    createComponent();

    const compiled = getCompiled();

    const titleInput =
      compiled.querySelector<HTMLInputElement>(
        '#article-title'
      );

    expect(titleInput).toBeTruthy();

    if (!titleInput) {
      return;
    }

    titleInput.value =
      'Título modificado sin guardar';

    titleInput.dispatchEvent(
      new Event('input')
    );

    fixture.detectChanges();

    const publishButton =
      compiled.querySelector<HTMLButtonElement>(
        '.editorial-action--publish'
      );

    expect(publishButton).toBeTruthy();
    expect(publishButton?.disabled).toBe(true);

    publishButton?.click();

    expect(publishedArticleId)
      .toBeUndefined();

    expect(compiled.textContent)
      .toContain(
        'Guarda los cambios antes de modificar'
      );
  });

  it('should withdraw a published article', () => {
    getArticleResponse = of(publishedArticle);

    createComponent();

    const compiled = getCompiled();

    const withdrawButton =
      compiled.querySelector<HTMLButtonElement>(
        '.editorial-action--withdraw'
      );

    expect(withdrawButton).toBeTruthy();
    expect(withdrawButton?.disabled).toBe(false);

    withdrawButton?.click();
    fixture.detectChanges();

    expect(withdrawnArticleId).toBe(110);

    expect(compiled.textContent)
      .toContain(
        'Artículo retirado correctamente'
      );

    expect(
      compiled.querySelector(
        '.article-status'
      )?.textContent
    ).toContain('Retirado');

    const publishButton =
      compiled.querySelector<HTMLButtonElement>(
        '.editorial-action--publish'
      );

    expect(publishButton?.textContent)
      .toContain('Volver a publicar');
  });

  it('should show a not found state when the article does not exist', () => {
    getArticleResponse = throwError(() => ({
      status: 404
    }));

    createComponent();

    const compiled = getCompiled();

    expect(compiled.textContent)
      .toContain(
        'Este artículo no existe'
      );

    expect(
      compiled.querySelector('.article-form')
    ).toBeNull();
  });
});