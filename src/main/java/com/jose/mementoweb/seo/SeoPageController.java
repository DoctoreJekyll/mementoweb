package com.jose.mementoweb.seo;

import java.net.URI;
import java.nio.charset.StandardCharsets;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.util.UriComponentsBuilder;

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

    private final String publicBaseUrl;

    public SeoPageController(
            PublicArticleService publicArticleService,
            SeoHtmlRenderer seoHtmlRenderer,
            @Value("${app.public-base-url}") String publicBaseUrl) {

        this.publicArticleService = publicArticleService;

        this.seoHtmlRenderer = seoHtmlRenderer;

        this.publicBaseUrl = normalizePublicBaseUrl(
                publicBaseUrl);
    }

    @GetMapping(value = "/", produces = MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<String> homePage() {

        SeoMetadata metadata = new SeoMetadata(
                "Memento vivere — "
                        + "Videojuegos, cultura y memoria",
                DEFAULT_DESCRIPTION,
                publicBaseUrl + "/",
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

        String canonicalUrl = buildArticleUrl(slug);

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
                publicBaseUrl + "/admin",
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

    private String buildArticleUrl(
            String slug) {

        return UriComponentsBuilder
                .fromUriString(publicBaseUrl)
                .pathSegment(
                        "articulos",
                        slug)
                .build()
                .encode()
                .toUriString();
    }

    private static String normalizePublicBaseUrl(
            String value) {

        if (value == null
                || value.isBlank()) {

            throw new IllegalStateException(
                    "Public base URL must be configured");
        }

        String normalized = value.trim();

        while (normalized.endsWith("/")) {
            normalized = normalized.substring(
                    0,
                    normalized.length() - 1);
        }

        URI uri;

        try {
            uri = URI.create(normalized);
        } catch (IllegalArgumentException exception) {
            throw new IllegalStateException(
                    "Public base URL is invalid",
                    exception);
        }

        boolean hasAllowedScheme = "http".equalsIgnoreCase(
                uri.getScheme())
                || "https".equalsIgnoreCase(
                        uri.getScheme());

        if (!hasAllowedScheme
                || uri.getHost() == null) {

            throw new IllegalStateException(
                    "Public base URL must be an "
                            + "absolute HTTP or HTTPS URL");
        }

        return normalized;
    }
}