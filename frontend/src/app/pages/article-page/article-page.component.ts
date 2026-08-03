import { DatePipe } from '@angular/common';

import {
  HttpErrorResponse
} from '@angular/common/http';

import {
  Component,
  computed,
  inject,
  signal,
  type OnInit
} from '@angular/core';

import {
  ActivatedRoute,
  RouterLink
} from '@angular/router';

import { ArticleApiService } from '../../articles/article-api.service';
import { ArticleDetail } from '../../articles/article-detail';

@Component({
  selector: 'app-article-page',
  imports: [
    DatePipe,
    RouterLink
  ],
  templateUrl: './article-page.component.html',
  styleUrl: './article-page.component.scss',
})
export class ArticlePage implements OnInit {
  private readonly route =
    inject(ActivatedRoute);

  private readonly articleApiService =
    inject(ArticleApiService);

  protected readonly article =
    signal<ArticleDetail | null>(null);

  protected readonly isLoading =
    signal(true);

  protected readonly notFound =
    signal(false);

  protected readonly loadError =
    signal(false);

  protected readonly bodyParagraphs =
    computed(() => {
      const body = this.article()?.body;

      if (!body) {
        return [];
      }

      return body
        .split(/\r?\n\s*\r?\n/)
        .map(paragraph => paragraph.trim())
        .filter(paragraph =>
          paragraph.length > 0
        );
    });

  ngOnInit(): void {
    const slug =
      this.route.snapshot.paramMap.get(
        'slug'
      );

    if (slug === null) {
      this.loadError.set(true);
      this.isLoading.set(false);
      return;
    }

    this.articleApiService
      .getPublishedArticleBySlug(slug)
      .subscribe({
        next: article => {
          this.article.set(article);
          this.isLoading.set(false);
        },

        error: (
          error: HttpErrorResponse
        ) => {
          if (error.status === 404) {
            this.notFound.set(true);
          } else {
            this.loadError.set(true);
          }

          this.isLoading.set(false);
        },
      });
  }
}