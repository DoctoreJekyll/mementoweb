package com.jose.mementoweb.seo;

import java.nio.charset.StandardCharsets;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import com.jose.mementoweb.domain.article.Article;
import com.jose.mementoweb.exception.PublishedArticleNotFoundException;
import com.jose.mementoweb.service.PublicArticleService;

@Controller
public class SeoPageController {

    private static final String DEFAULT_DESCRIPTION = "Ensayos y reflexiones sobre videojuegos, "
            + "cultura y memoria.";

    private static final MediaType HTML_UTF_8 = new MediaType(
            MediaType.TEXT_HTML,
            StandardCharsets.UTF_8);

    private final PublicArticleService publicArticleService;

    private final SeoHtmlRenderer seoHtmlRenderer;

    private final PublicUrlBuilder publicUrlBuilder;

    public SeoPageController(
            PublicArticleService publicArticleService,
            SeoHtmlRenderer seoHtmlRenderer,
            PublicUrlBuilder publicUrlBuilder) {

        this.publicArticleService = publicArticleService;

        this.seoHtmlRenderer = seoHtmlRenderer;

        this.publicUrlBuilder = publicUrlBuilder;
    }

    @GetMapping(value = "/", produces = MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<String> homePage() {

        SeoMetadata metadata = new SeoMetadata(
                "Memento vivere — "
                        + "Videojuegos, cultura y memoria",
                DEFAULT_DESCRIPTION,
                publicUrlBuilder.homeUrl(),
                "index, follow",
                "website",
                null,
                null);

        return htmlResponse(
                HttpStatus.OK,
                metadata);
    }

    @GetMapping(value = "/articulos/{slug}", produces = MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<String> articlePage(
            @PathVariable String slug) {

        String canonicalUrl = publicUrlBuilder.articleUrl(
                slug);

        try {
            Article article = publicArticleService
                    .getPublishedArticleBySlug(
                            slug);

            SeoMetadata metadata = new SeoMetadata(
                    article.getTitle()
                            + " | Memento vivere",
                    article.getExcerpt(),
                    canonicalUrl,
                    "index, follow",
                    "article",
                    article.getCoverImageUrl(),
                    article.getPublishedAt());

            return htmlResponse(
                    HttpStatus.OK,
                    metadata);

        } catch (PublishedArticleNotFoundException exception) {
            SeoMetadata metadata = new SeoMetadata(
                    "Artículo no encontrado "
                            + "| Memento vivere",
                    "El artículo solicitado no existe "
                            + "o ya no está publicado.",
                    canonicalUrl,
                    "noindex, nofollow",
                    "website",
                    null,
                    null);

            return htmlResponse(
                    HttpStatus.NOT_FOUND,
                    metadata);
        }
    }

    @GetMapping({
            "/admin",
            "/admin/**"
    })
    public ResponseEntity<String> adminPage() {

        SeoMetadata metadata = new SeoMetadata(
                "Área editorial | Memento vivere",
                "Administración editorial "
                        + "de Memento vivere.",
                publicUrlBuilder.adminUrl(),
                "noindex, nofollow, noarchive",
                "website",
                null,
                null);

        return htmlResponse(
                HttpStatus.OK,
                metadata);
    }

    private ResponseEntity<String> htmlResponse(
            HttpStatus status,
            SeoMetadata metadata) {

        return ResponseEntity
                .status(status)
                .contentType(HTML_UTF_8)
                .body(
                        seoHtmlRenderer.render(
                                metadata));
    }
}