import { DatePipe } from '@angular/common';
import {
  Component,
  inject,
  signal,
  type OnInit
} from '@angular/core';
import { RouterLink } from '@angular/router';

import { AdminArticleApiService } from '../../articles/admin-article-api.service';
import { AdminArticleSummary } from '../../articles/admin-article-summary';
import { ArticleStatus } from '../../articles/article-status';

@Component({
  selector: 'app-admin-article-list-page',
  imports: [
    DatePipe,
    RouterLink
  ],
  templateUrl: './admin-article-list-page.component.html',
  styleUrl: './admin-article-list-page.component.scss'
})
export class AdminArticleListPage implements OnInit {
  private readonly adminArticleApiService =
    inject(AdminArticleApiService);

  protected readonly articles =
    signal<AdminArticleSummary[]>([]);

  protected readonly selectedStatus =
    signal<ArticleStatus | null>(null);

  protected readonly totalElements = signal(0);
  protected readonly isLoading = signal(true);
  protected readonly loadError = signal(false);

  protected readonly statusLabels:
    Record<ArticleStatus, string> = {
      DRAFT: 'Borrador',
      PUBLISHED: 'Publicado',
      WITHDRAWN: 'Retirado'
    };

  ngOnInit(): void {
    this.loadArticles();
  }

  private loadArticles(): void {
  this.isLoading.set(true);
  this.loadError.set(false);

  this.adminArticleApiService
    .getArticles(
      0,
      10,
      this.selectedStatus() ?? undefined
    )
    .subscribe({
      next: response => {
        this.articles.set(response.content);
        this.totalElements.set(
          response.totalElements
        );

        this.isLoading.set(false);
      },
      error: error => {
        console.error(
          'Could not load admin articles',
          error
        );

        this.articles.set([]);
        this.totalElements.set(0);
        this.loadError.set(true);
        this.isLoading.set(false);
      }
    });
  }

  protected filterByStatus(status: ArticleStatus | null): void {
    if (this.selectedStatus() === status) {
      return;
    }

    this.selectedStatus.set(status);
    this.loadArticles();
  }

  protected reloadArticles(): void {
    this.loadArticles();
  }
}