import { DatePipe } from '@angular/common';
import {
  Component,
  inject,
  signal,
  type OnInit
} from '@angular/core';

import { ArticleApiService } from '../../articles/article-api.service';
import { ArticleSummary } from '../../articles/article-summary';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home-page',
  imports: [DatePipe, RouterLink],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss',
})
export class HomePage implements OnInit {
  private readonly articleApiService = inject(ArticleApiService);

  protected readonly featuredArticle =
    signal<ArticleSummary | null>(null);

  protected readonly articles =
    signal<ArticleSummary[]>([]);

  protected readonly isLoading = signal(true);
  protected readonly loadError = signal(false);

  ngOnInit(): void {
    this.articleApiService
      .getPublishedArticles(0, 10)
      .subscribe({
        next: response => {
          const [
            featuredArticle,
            ...remainingArticles
          ] = response.content;

          this.featuredArticle.set(
            featuredArticle ?? null
          );

          this.articles.set(remainingArticles);
          this.isLoading.set(false);
        },
        error: error => {
          console.error(
            'Could not load published articles',
            error
          );

          this.loadError.set(true);
          this.isLoading.set(false);
        }
      });
  }
}