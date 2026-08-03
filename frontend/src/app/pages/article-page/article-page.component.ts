import { DatePipe } from '@angular/common';

import { HttpErrorResponse } from '@angular/common/http';

import { Component, computed, inject, signal, type OnDestroy, type OnInit } from '@angular/core';

import { ActivatedRoute, RouterLink } from '@angular/router';

import { Meta, Title } from '@angular/platform-browser';

import { ArticleApiService } from '../../articles/article-api.service';
import { ArticleDetail } from '../../articles/article-detail';

@Component({
  selector: 'app-article-page',
  imports: [DatePipe, RouterLink],
  templateUrl: './article-page.component.html',
  styleUrl: './article-page.component.scss',
})
export class ArticlePage implements OnInit, OnDestroy {
  private readonly titleService = inject(Title);

  private readonly metaService = inject(Meta);

  private readonly route = inject(ActivatedRoute);

  private readonly articleApiService = inject(ArticleApiService);

  private readonly defaultDescription =
    'Ensayos y reflexiones sobre videojuegos, cultura y memoria.';

  protected readonly article = signal<ArticleDetail | null>(null);

  protected readonly isLoading = signal(true);

  protected readonly notFound = signal(false);

  protected readonly loadError = signal(false);

  protected readonly bodyParagraphs = computed(() => {
    const body = this.article()?.body;

    if (!body) {
      return [];
    }

    return body
      .split(/\r?\n\s*\r?\n/)
      .map((paragraph) => paragraph.trim())
      .filter((paragraph) => paragraph.length > 0);
  });

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug');

    if (slug === null) {
      this.loadError.set(true);
      this.isLoading.set(false);

      this.titleService.setTitle('Error al cargar el artículo | Memento vivere');

      return;
    }

    this.articleApiService.getPublishedArticleBySlug(slug).subscribe({
      next: (article) => {
        this.article.set(article);

        this.updateArticleMetadata(article);

        this.isLoading.set(false);
      },

      error: (error: HttpErrorResponse) => {
        if (error.status === 404) {
          this.notFound.set(true);

          this.titleService.setTitle('Artículo no encontrado | Memento vivere');
        } else {
          this.loadError.set(true);

          this.titleService.setTitle('Error al cargar el artículo | Memento vivere');
        }

        this.isLoading.set(false);
      },
    });
  }

  ngOnDestroy(): void {
    this.metaService.updateTag({
      name: 'description',
      content: this.defaultDescription,
    });
  }

  private updateArticleMetadata(article: ArticleDetail): void {
    const description = article.excerpt.trim() || this.defaultDescription;

    this.titleService.setTitle(`${article.title} | Memento vivere`);

    this.metaService.updateTag({
      name: 'description',
      content: description,
    });
  }
}
