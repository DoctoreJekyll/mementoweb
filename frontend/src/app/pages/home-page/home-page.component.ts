import { Component } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ArticleSummary } from '../../articles/article-summary';

@Component({
  selector: 'app-home-page',
  imports: [DatePipe],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss',
})
export class HomePage {
  protected readonly featuredArticle: ArticleSummary = {
    slug: 'el-titulo-de-nuestro-primer-articulo',
    pretitle: 'Ensayo',
    title: 'El título de nuestro primer artículo',
    excerpt: 'Una entradilla provisional para empezar a construir la portada.',
    publishedAt: '2026-07-28T10:00:00Z'
  };

  protected readonly articles: ArticleSummary[] = [
    {
      slug: 'el-valor-de-perderse-en-un-videojuego',
      pretitle: 'Reflexión',
      title: 'El valor de perderse en un videojuego',
      excerpt: 'Sobre los mundos que no tienen miedo de dejar al jugador sin respuestas.',
      publishedAt: '2026-07-20T10:00:00Z'
    }
  ];
}