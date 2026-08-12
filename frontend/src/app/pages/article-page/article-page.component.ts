import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';

import { Component, computed, inject, signal, type OnInit } from '@angular/core';

import { ActivatedRoute, RouterLink } from '@angular/router';

import { ArticleApiService } from '../../articles/article-api.service';
import { ArticleDetail } from '../../articles/article-detail';
import { ArticleMarkdownService } from '../../articles/article-markdown.service';
import { SeoService } from '../../core/seo.service';

@Component({
  selector: 'app-article-page',
  imports: [DatePipe, RouterLink],
  templateUrl: './article-page.component.html',
  styleUrl: './article-page.component.scss',
})
export class ArticlePage implements OnInit {
  private readonly route = inject(ActivatedRoute);

  private readonly articleApiService = inject(ArticleApiService);

  private readonly articleMarkdownService = inject(ArticleMarkdownService);

  private readonly seoService = inject(SeoService);

  protected readonly article = signal<ArticleDetail | null>(null);

  protected readonly isLoading = signal(true);

  protected readonly notFound = signal(false);

  protected readonly loadError = signal(false);

  protected readonly bodyHtml = computed(() =>
    this.articleMarkdownService.toSafeHtml(this.article()?.body),
  );

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug');

    if (slug === null) {
      this.loadError.set(true);
      this.isLoading.set(false);

      this.seoService.setErrorPage();

      return;
    }

    this.articleApiService.getPublishedArticleBySlug(slug).subscribe({
      next: (article) => {
        this.article.set(article);

        this.seoService.setArticlePage(article);

        this.isLoading.set(false);
      },

      error: (error: HttpErrorResponse) => {
        if (error.status === 404) {
          this.notFound.set(true);

          this.seoService.setNotFoundPage();
        } else {
          this.loadError.set(true);

          this.seoService.setErrorPage();
        }

        this.isLoading.set(false);
      },
    });
  }
}
