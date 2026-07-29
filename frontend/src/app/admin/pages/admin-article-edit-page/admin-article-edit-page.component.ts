import {
  Component,
  inject,
  signal,
  type OnInit
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import {
  ActivatedRoute,
  RouterLink
} from '@angular/router';

import { AdminArticleApiService } from '../../articles/admin-article-api.service';
import { AdminArticleDetail } from '../../articles/admin-article-detail';
import { ArticleStatus } from '../../articles/article-status';
import { UpdateArticleRequest } from '../../articles/update-article-request';

@Component({
  selector: 'app-admin-article-edit-page',
  imports: [
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './admin-article-edit-page.component.html',
  styleUrl: './admin-article-edit-page.component.scss'
})
export class AdminArticleEditPage implements OnInit {
  private readonly route =
    inject(ActivatedRoute);

  private readonly adminArticleApiService =
    inject(AdminArticleApiService);

  private articleId: number | null = null;

  protected readonly article =
    signal<AdminArticleDetail | null>(null);

  protected readonly isLoading = signal(true);
  protected readonly notFound = signal(false);
  protected readonly loadError = signal(false);

  protected readonly isSaving = signal(false);
  protected readonly saveError = signal(false);
  protected readonly saveSuccess = signal(false);

  protected readonly statusLabels:
    Record<ArticleStatus, string> = {
      DRAFT: 'Borrador',
      PUBLISHED: 'Publicado',
      WITHDRAWN: 'Retirado'
    };

  protected readonly form = new FormGroup({
    title: new FormControl(
      '',
      {
        nonNullable: true,
        validators: [
          Validators.required,
          Validators.pattern(/\S/),
          Validators.maxLength(255)
        ]
      }
    ),

    pretitle: new FormControl(
      '',
      {
        nonNullable: true,
        validators: [
          Validators.maxLength(255)
        ]
      }
    ),

    excerpt: new FormControl(
      '',
      {
        nonNullable: true
      }
    ),

    body: new FormControl(
      '',
      {
        nonNullable: true
      }
    )
  });

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

  ngOnInit(): void {
    const idParameter =
      this.route.snapshot.paramMap.get('id');

    const parsedId = Number(idParameter);

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
      next: article => {
        this.article.set(article);

        this.fillForm(article);

        this.isLoading.set(false);
      },
      error: error => {
        if (error.status === 404) {
          this.notFound.set(true);
        } else {
          this.loadError.set(true);
        }

        this.isLoading.set(false);
      }
    });
}

  private fillForm(
    article: AdminArticleDetail
  ): void {
    this.form.setValue({
      title: article.title,
      pretitle: article.pretitle ?? '',
      excerpt: article.excerpt ?? '',
      body: article.body ?? ''
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

  const request: UpdateArticleRequest = {
    title: this.titleControl.value.trim(),

    pretitle: this.normalizeOptionalText(
      this.pretitleControl.value
    ),

    excerpt: this.normalizeOptionalText(
      this.excerptControl.value
    ),

    body: this.normalizeOptionalText(
      this.bodyControl.value
    )
  };

  this.adminArticleApiService
    .updateArticle(
      this.articleId,
      request
    )
    .subscribe({
      next: updatedArticle => {
        this.article.set(updatedArticle);
        this.fillForm(updatedArticle);

        this.isSaving.set(false);
        this.saveSuccess.set(true);
      },
      error: error => {
        console.error(
          'Could not update article',
          error
        );

        this.isSaving.set(false);
        this.saveError.set(true);
      }
    });
}

protected reloadArticle(): void {
  this.loadArticle();
}

private normalizeOptionalText(
  value: string
): string | null {
  const normalizedValue = value.trim();

  return normalizedValue.length === 0
    ? null
    : normalizedValue;
}

}