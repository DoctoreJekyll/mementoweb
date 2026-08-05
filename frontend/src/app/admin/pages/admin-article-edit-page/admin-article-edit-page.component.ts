import {
  Component,
  inject,
  signal,
  type OnInit,
} from '@angular/core';

import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';

import {
  ActivatedRoute,
  RouterLink,
} from '@angular/router';

import { AdminArticleApiService } from '../../articles/admin-article-api.service';
import { AdminArticleDetail } from '../../articles/admin-article-detail';
import { ArticleStatus } from '../../articles/article-status';
import { UpdateArticleRequest } from '../../articles/update-article-request';

const optionalHttpUrlValidator: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null => {
  const value = String(
    control.value ?? '',
  ).trim();

  if (!value) {
    return null;
  }

  try {
    const url = new URL(value);

    const allowedProtocol =
      url.protocol === 'http:'
      || url.protocol === 'https:';

    return allowedProtocol && url.hostname
      ? null
      : { absoluteHttpUrl: true };
  } catch {
    return { absoluteHttpUrl: true };
  }
};

const coverImagePairValidator: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null => {
  const imageUrl = String(
    control.get('coverImageUrl')?.value ?? '',
  ).trim();

  const imageAlt = String(
    control.get('coverImageAlt')?.value ?? '',
  ).trim();

  const hasImageUrl =
    imageUrl.length > 0;

  const hasImageAlt =
    imageAlt.length > 0;

  return hasImageUrl === hasImageAlt
    ? null
    : { coverImagePair: true };
};

const recommendedAudioValidator: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null => {
  const title = String(
    control.get('recommendedAudioTitle')?.value ?? '',
  ).trim();

  const author = String(
    control.get('recommendedAudioAuthor')?.value ?? '',
  ).trim();

  const url = String(
    control.get('recommendedAudioUrl')?.value ?? '',
  ).trim();

  const hasTitle =
    title.length > 0;

  const hasAuthor =
    author.length > 0;

  const hasUrl =
    url.length > 0;

  const isEmpty =
    !hasTitle
    && !hasAuthor
    && !hasUrl;

  const isComplete =
    hasTitle
    && hasUrl;

  return isEmpty || isComplete
    ? null
    : { recommendedAudio: true };
};

@Component({
  selector: 'app-admin-article-edit-page',
  imports: [
    ReactiveFormsModule,
    RouterLink,
  ],
  templateUrl:
    './admin-article-edit-page.component.html',
  styleUrl:
    './admin-article-edit-page.component.scss',
})
export class AdminArticleEditPage implements OnInit {
  private readonly route =
    inject(ActivatedRoute);

  private readonly adminArticleApiService =
    inject(AdminArticleApiService);

  private articleId: number | null = null;

  protected readonly article =
    signal<AdminArticleDetail | null>(null);

  protected readonly isLoading =
    signal(true);

  protected readonly notFound =
    signal(false);

  protected readonly loadError =
    signal(false);

  protected readonly isSaving =
    signal(false);

  protected readonly saveError =
    signal(false);

  protected readonly saveSuccess =
    signal(false);

  protected readonly statusAction =
    signal<'PUBLISH' | 'WITHDRAW' | null>(null);

  protected readonly statusChangeError =
    signal(false);

  protected readonly statusChangeMessage =
    signal<string | null>(null);

  protected readonly statusLabels:
    Record<ArticleStatus, string> = {
      DRAFT: 'Borrador',
      PUBLISHED: 'Publicado',
      WITHDRAWN: 'Retirado',
    };

  protected readonly form = new FormGroup(
    {
      title: new FormControl('', {
        nonNullable: true,
        validators: [
          Validators.required,
          Validators.pattern(/\S/),
          Validators.maxLength(255),
        ],
      }),

      pretitle: new FormControl('', {
        nonNullable: true,
        validators: [
          Validators.maxLength(255),
        ],
      }),

      excerpt: new FormControl('', {
        nonNullable: true,
      }),

      body: new FormControl('', {
        nonNullable: true,
      }),

      coverImageUrl: new FormControl('', {
        nonNullable: true,
        validators: [
          Validators.maxLength(2048),
          optionalHttpUrlValidator,
        ],
      }),

      coverImageAlt: new FormControl('', {
        nonNullable: true,
        validators: [
          Validators.maxLength(500),
        ],
      }),

      recommendedAudioTitle:
        new FormControl('', {
          nonNullable: true,
          validators: [
            Validators.maxLength(255),
          ],
        }),

      recommendedAudioAuthor:
        new FormControl('', {
          nonNullable: true,
          validators: [
            Validators.maxLength(255),
          ],
        }),

      recommendedAudioUrl:
        new FormControl('', {
          nonNullable: true,
          validators: [
            Validators.maxLength(2048),
            optionalHttpUrlValidator,
          ],
        }),
    },
    {
      validators: [
        coverImagePairValidator,
        recommendedAudioValidator,
      ],
    },
  );

  protected get titleControl() {
    return this.form.controls.title;
  }

  protected get pretitleControl() {
    return this.form.controls.pretitle;
  }

  protected get excerptControl() {
    return this.form.controls.excerpt;
  }

  protected get bodyControl() {
    return this.form.controls.body;
  }

  protected get coverImageUrlControl() {
    return this.form.controls.coverImageUrl;
  }

  protected get coverImageAltControl() {
    return this.form.controls.coverImageAlt;
  }

  protected get recommendedAudioTitleControl() {
    return this.form.controls
      .recommendedAudioTitle;
  }

  protected get recommendedAudioAuthorControl() {
    return this.form.controls
      .recommendedAudioAuthor;
  }

  protected get recommendedAudioUrlControl() {
    return this.form.controls
      .recommendedAudioUrl;
  }

  protected get coverImagePreviewUrl():
    string | null {

    const imageUrl =
      this.coverImageUrlControl.value.trim();

    const imageAlt =
      this.coverImageAltControl.value.trim();

    if (
      !imageUrl
      || !imageAlt
      || this.coverImageUrlControl.invalid
      || this.coverImageAltControl.invalid
    ) {
      return null;
    }

    return imageUrl;
  }

  ngOnInit(): void {
    const idParameter =
      this.route.snapshot.paramMap.get('id');

    const parsedId =
      Number(idParameter);

    if (
      idParameter === null
      || !Number.isInteger(parsedId)
      || parsedId <= 0
    ) {
      this.notFound.set(true);
      this.isLoading.set(false);
      return;
    }

    this.articleId = parsedId;

    this.loadArticle();
  }

  private loadArticle(): void {
    if (this.articleId === null) {
      return;
    }

    this.isLoading.set(true);
    this.notFound.set(false);
    this.loadError.set(false);

    this.adminArticleApiService
      .getArticleById(this.articleId)
      .subscribe({
        next: (article) => {
          this.article.set(article);

          this.fillForm(article);

          this.isLoading.set(false);
        },

        error: (error) => {
          if (error.status === 404) {
            this.notFound.set(true);
          } else {
            this.loadError.set(true);
          }

          this.isLoading.set(false);
        },
      });
  }

  private fillForm(
    article: AdminArticleDetail,
  ): void {
    this.form.setValue({
      title:
        article.title,

      pretitle:
        article.pretitle ?? '',

      excerpt:
        article.excerpt ?? '',

      body:
        article.body ?? '',

      coverImageUrl:
        article.coverImageUrl ?? '',

      coverImageAlt:
        article.coverImageAlt ?? '',

      recommendedAudioTitle:
        article.recommendedAudioTitle ?? '',

      recommendedAudioAuthor:
        article.recommendedAudioAuthor ?? '',

      recommendedAudioUrl:
        article.recommendedAudioUrl ?? '',
    });

    this.form.markAsPristine();
  }

  protected saveArticle(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (
      this.articleId === null
      || this.isSaving()
    ) {
      return;
    }

    this.isSaving.set(true);
    this.saveError.set(false);
    this.saveSuccess.set(false);

    this.statusChangeError.set(false);
    this.statusChangeMessage.set(null);

    const request: UpdateArticleRequest = {
      title:
        this.titleControl.value.trim(),

      pretitle:
        this.normalizeOptionalText(
          this.pretitleControl.value,
        ),

      excerpt:
        this.normalizeOptionalText(
          this.excerptControl.value,
        ),

      body:
        this.normalizeOptionalText(
          this.bodyControl.value,
        ),

      coverImageUrl:
        this.normalizeOptionalText(
          this.coverImageUrlControl.value,
        ),

      coverImageAlt:
        this.normalizeOptionalText(
          this.coverImageAltControl.value,
        ),

      recommendedAudioTitle:
        this.normalizeOptionalText(
          this.recommendedAudioTitleControl.value,
        ),

      recommendedAudioAuthor:
        this.normalizeOptionalText(
          this.recommendedAudioAuthorControl.value,
        ),

      recommendedAudioUrl:
        this.normalizeOptionalText(
          this.recommendedAudioUrlControl.value,
        ),
    };

    this.adminArticleApiService
      .updateArticle(
        this.articleId,
        request,
      )
      .subscribe({
        next: (updatedArticle) => {
          this.article.set(updatedArticle);

          this.fillForm(updatedArticle);

          this.isSaving.set(false);
          this.saveSuccess.set(true);
        },

        error: (error) => {
          console.error(
            'Could not update article',
            error,
          );

          this.isSaving.set(false);
          this.saveError.set(true);
        },
      });
  }

  protected publishArticle(): void {
    const currentArticle =
      this.article();

    if (
      this.articleId === null
      || currentArticle === null
      || this.form.dirty
      || this.isSaving()
      || this.statusAction() !== null
    ) {
      return;
    }

    if (
      currentArticle.status !== 'DRAFT'
      && currentArticle.status !== 'WITHDRAWN'
    ) {
      return;
    }

    if (!currentArticle.canBePublished) {
      return;
    }

    this.statusAction.set('PUBLISH');
    this.statusChangeError.set(false);
    this.statusChangeMessage.set(null);
    this.saveSuccess.set(false);

    this.adminArticleApiService
      .publishArticle(this.articleId)
      .subscribe({
        next: (publishedArticle) => {
          this.article.set(publishedArticle);

          this.fillForm(publishedArticle);

          this.statusAction.set(null);

          this.statusChangeMessage.set(
            'Artículo publicado correctamente.',
          );
        },

        error: (error) => {
          console.error(
            'Could not publish article',
            error,
          );

          this.statusAction.set(null);
          this.statusChangeError.set(true);
        },
      });
  }

  protected withdrawArticle(): void {
    const currentArticle =
      this.article();

    if (
      this.articleId === null
      || currentArticle === null
      || currentArticle.status !== 'PUBLISHED'
      || this.form.dirty
      || this.isSaving()
      || this.statusAction() !== null
    ) {
      return;
    }

    this.statusAction.set('WITHDRAW');
    this.statusChangeError.set(false);
    this.statusChangeMessage.set(null);
    this.saveSuccess.set(false);

    this.adminArticleApiService
      .withdrawArticle(this.articleId)
      .subscribe({
        next: (withdrawnArticle) => {
          this.article.set(withdrawnArticle);

          this.fillForm(withdrawnArticle);

          this.statusAction.set(null);

          this.statusChangeMessage.set(
            'Artículo retirado correctamente.',
          );
        },

        error: (error) => {
          console.error(
            'Could not withdraw article',
            error,
          );

          this.statusAction.set(null);
          this.statusChangeError.set(true);
        },
      });
  }

  protected reloadArticle(): void {
    this.loadArticle();
  }

  private normalizeOptionalText(
    value: string,
  ): string | null {
    const normalizedValue =
      value.trim();

    return normalizedValue.length === 0
      ? null
      : normalizedValue;
  }
}