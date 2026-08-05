import { Injectable } from '@angular/core';

import DOMPurify from 'dompurify';
import { marked } from 'marked';

@Injectable({
  providedIn: 'root',
})
export class ArticleMarkdownService {
  toSafeHtml(markdown: string | null | undefined): string {
    const normalizedMarkdown = markdown?.trim() ?? '';

    if (!normalizedMarkdown) {
      return '';
    }

    const parsedMarkdown = marked.parse(normalizedMarkdown, {
      async: false,
      gfm: true,
      breaks: false,
    });

    if (typeof parsedMarkdown !== 'string') {
      return '';
    }

    const sanitizedHtml = DOMPurify.sanitize(parsedMarkdown, {
      ALLOWED_TAGS: [
        'p',
        'a',
        'strong',
        'em',
        'ul',
        'ol',
        'li',
        'blockquote',
        'h2',
        'h3',
        'br',
        'hr',
      ],

      ALLOWED_ATTR: ['href', 'title', 'target', 'rel'],

      ALLOW_DATA_ATTR: false,
    });

    return this.prepareLinks(String(sanitizedHtml));
  }

  private prepareLinks(html: string): string {
    const document = new DOMParser().parseFromString(html, 'text/html');

    const links = document.querySelectorAll('a');

    for (const link of links) {
      const href = link.getAttribute('href');

      if (!href) {
        this.removeLink(link);
        continue;
      }

      /*
       * Los enlaces internos que empiezan por "/"
       * permanecen en la pestaña actual.
       */
      if (href.startsWith('/')) {
        link.removeAttribute('target');
        link.removeAttribute('rel');
        continue;
      }

      try {
        const url = new URL(href);

        const hasAllowedProtocol = url.protocol === 'http:' || url.protocol === 'https:';

        if (!hasAllowedProtocol) {
          this.removeLink(link);
          continue;
        }

        /*
         * Los enlaces externos se abren en una
         * pestaña independiente sin dar acceso
         * a la ventana original.
         */
        link.setAttribute('target', '_blank');

        link.setAttribute('rel', 'noopener noreferrer');
      } catch {
        this.removeLink(link);
      }
    }

    return document.body.innerHTML;
  }

  private removeLink(link: HTMLAnchorElement): void {
    const text = link.ownerDocument.createTextNode(link.textContent ?? '');

    link.replaceWith(text);
  }
}
