import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal, type OnInit } from '@angular/core';

import { ArticleApiService } from '../../articles/article-api.service';
import { ArticleSummary } from '../../articles/article-summary';
import { RouterLink } from '@angular/router';

import { SeoService } from '../../core/seo.service';

@Component({
  selector: 'app-home-page',
  imports: [DatePipe, RouterLink],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss',
})
export class HomePage implements OnInit {
  private readonly seoService = inject(SeoService);

  private readonly pageSize = 5;

  protected readonly currentPage = signal(0);

  protected readonly totalPages = signal(0);

  protected readonly isLoadingMore = signal(false);

  protected readonly loadMoreError = signal(false);

  protected readonly hasMoreArticles = computed(() => this.currentPage() + 1 < this.totalPages());
  private readonly articleApiService = inject(ArticleApiService);

  protected readonly featuredArticle = signal<ArticleSummary | null>(null);

  protected readonly articles = signal<ArticleSummary[]>([]);

  protected readonly isLoading = signal(true);
  protected readonly loadError = signal(false);

  ngOnInit(): void {
    this.seoService.setHomePage();

    this.articleApiService.getPublishedArticles(0, this.pageSize).subscribe({
      next: (response) => {
        const [featuredArticle, ...remainingArticles] = response.content;

        this.featuredArticle.set(featuredArticle ?? null);

        this.articles.set(remainingArticles);

        this.currentPage.set(response.page);

        this.totalPages.set(response.totalPages);

        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Could not load published articles', error);

        this.loadError.set(true);
        this.isLoading.set(false);
      },
    });
  }

  protected loadMoreArticles(): void {
    if (this.isLoadingMore() || !this.hasMoreArticles()) {
      return;
    }

    const nextPage = this.currentPage() + 1;

    this.isLoadingMore.set(true);
    this.loadMoreError.set(false);

    this.articleApiService.getPublishedArticles(nextPage, this.pageSize).subscribe({
      next: (response) => {
        this.articles.update((currentArticles) => [...currentArticles, ...response.content]);

        this.currentPage.set(response.page);

        this.totalPages.set(response.totalPages);

        this.isLoadingMore.set(false);
      },

      error: (error) => {
        console.error('Could not load more published articles', error);

        this.loadMoreError.set(true);
        this.isLoadingMore.set(false);
      },
    });
  }
}
