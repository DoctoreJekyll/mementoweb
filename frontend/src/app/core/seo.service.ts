import { DOCUMENT } from '@angular/common';
import { inject, Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

interface ArticleSeoData {
  slug: string;
  title: string;
  excerpt: string | null;
  coverImageUrl: string | null;
  publishedAt: string | null;
}

interface SeoPageData {
  title: string;
  description: string;
  canonicalUrl: string;
  robots: string;
  openGraphType: 'website' | 'article';
  imageUrl?: string | null;
  publishedAt?: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class SeoService {
  private readonly document = inject(DOCUMENT);

  private readonly titleService = inject(Title);

  private readonly metaService = inject(Meta);

  private readonly defaultDescription =
    'Ensayos y reflexiones sobre videojuegos, cultura y memoria.';

  setHomePage(): void {
    this.apply({
      title: 'Memento vivere — Videojuegos, cultura y memoria',
      description: this.defaultDescription,
      canonicalUrl: this.absoluteUrl('/'),
      robots: 'index, follow',
      openGraphType: 'website',
    });
  }

  setArticlePage(article: ArticleSeoData): void {
    const description = article.excerpt?.trim() || this.defaultDescription;

    this.apply({
      title: `${article.title} | Memento vivere`,
      description,
      canonicalUrl: this.absoluteUrl(`/articulos/${encodeURIComponent(article.slug)}`),
      robots: 'index, follow',
      openGraphType: 'article',
      imageUrl: article.coverImageUrl,
      publishedAt: article.publishedAt,
    });
  }

  setNotFoundPage(): void {
    this.apply({
      title: 'Página no encontrada | Memento vivere',
      description: 'La página solicitada no existe o ya no está disponible.',
      canonicalUrl: this.currentUrl(),
      robots: 'noindex, nofollow',
      openGraphType: 'website',
    });
  }

  setErrorPage(): void {
    this.apply({
      title: 'Error al cargar la página | Memento vivere',
      description: 'No hemos podido cargar el contenido solicitado.',
      canonicalUrl: this.currentUrl(),
      robots: 'noindex, nofollow',
      openGraphType: 'website',
    });
  }

  setAdminPage(): void {
    this.apply({
      title: 'Área editorial | Memento vivere',
      description: 'Administración editorial de Memento vivere.',
      canonicalUrl: this.absoluteUrl('/admin'),
      robots: 'noindex, nofollow, noarchive',
      openGraphType: 'website',
    });
  }

  private apply(data: SeoPageData): void {
    this.titleService.setTitle(data.title);

    this.updateNameTag('description', data.description);

    this.updateNameTag('robots', data.robots);

    this.updatePropertyTag('og:title', data.title);

    this.updatePropertyTag('og:description', data.description);

    this.updatePropertyTag('og:url', data.canonicalUrl);

    this.updatePropertyTag('og:type', data.openGraphType);

    this.updateNameTag('twitter:title', data.title);

    this.updateNameTag('twitter:description', data.description);

    this.updateCanonicalUrl(data.canonicalUrl);

    this.updateOptionalImage(data.imageUrl, data.title);

    this.updatePublishedAt(data.publishedAt);
  }

  private updateOptionalImage(imageUrl: string | null | undefined, title: string): void {
    const normalizedImageUrl = imageUrl?.trim() ?? '';

    if (!normalizedImageUrl) {
      this.removePropertyTag('og:image');
      this.removePropertyTag('og:image:alt');
      this.removeNameTag('twitter:image');
      this.removeNameTag('twitter:image:alt');

      this.updateNameTag('twitter:card', 'summary');

      return;
    }

    this.updatePropertyTag('og:image', normalizedImageUrl);

    this.updatePropertyTag('og:image:alt', title);

    this.updateNameTag('twitter:image', normalizedImageUrl);

    this.updateNameTag('twitter:image:alt', title);

    this.updateNameTag('twitter:card', 'summary_large_image');
  }

  private updatePublishedAt(publishedAt: string | null | undefined): void {
    if (!publishedAt) {
      this.removePropertyTag('article:published_time');

      return;
    }

    this.updatePropertyTag('article:published_time', publishedAt);
  }

  private updateCanonicalUrl(canonicalUrl: string): void {
    let canonicalLink = this.document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');

    if (!canonicalLink) {
      canonicalLink = this.document.createElement('link');

      canonicalLink.setAttribute('rel', 'canonical');

      this.document.head.appendChild(canonicalLink);
    }

    canonicalLink.setAttribute('href', canonicalUrl);
  }

  private updateNameTag(name: string, content: string): void {
    this.metaService.updateTag(
      {
        name,
        content,
      },
      `name='${name}'`,
    );
  }

  private updatePropertyTag(property: string, content: string): void {
    this.metaService.updateTag(
      {
        property,
        content,
      },
      `property='${property}'`,
    );
  }

  private removeNameTag(name: string): void {
    this.metaService.removeTag(`name='${name}'`);
  }

  private removePropertyTag(property: string): void {
    this.metaService.removeTag(`property='${property}'`);
  }

  private absoluteUrl(path: string): string {
    return new URL(path, this.document.baseURI).toString();
  }

  private currentUrl(): string {
    return new URL(this.document.location.pathname, this.document.baseURI).toString();
  }
}
