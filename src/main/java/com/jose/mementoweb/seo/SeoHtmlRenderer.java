package com.jose.mementoweb.seo;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Component;
import org.springframework.web.util.HtmlUtils;

@Component
public class SeoHtmlRenderer {

    private static final String TITLE_TOKEN = "__MEMENTO_SEO_TITLE__";

    private static final String DESCRIPTION_TOKEN = "__MEMENTO_SEO_DESCRIPTION__";

    private static final String ROBOTS_TOKEN = "__MEMENTO_SEO_ROBOTS__";

    private static final String CANONICAL_URL_TOKEN = "__MEMENTO_SEO_CANONICAL_URL__";

    private static final String OPEN_GRAPH_TYPE_TOKEN = "__MEMENTO_SEO_OPEN_GRAPH_TYPE__";

    private static final String HEAD_CLOSING_TAG = "</head>";

    private final Resource indexHtmlResource;

    public SeoHtmlRenderer(
            @Value("classpath:/static/index.html") Resource indexHtmlResource) {

        this.indexHtmlResource = indexHtmlResource;
    }

    public String render(
            SeoMetadata metadata) {

        String html = readIndexHtml();

        html = replaceRequiredToken(
                html,
                TITLE_TOKEN,
                metadata.title());

        html = replaceRequiredToken(
                html,
                DESCRIPTION_TOKEN,
                metadata.description());

        html = replaceRequiredToken(
                html,
                ROBOTS_TOKEN,
                metadata.robots());

        html = replaceRequiredToken(
                html,
                CANONICAL_URL_TOKEN,
                metadata.canonicalUrl());

        html = replaceRequiredToken(
                html,
                OPEN_GRAPH_TYPE_TOKEN,
                metadata.openGraphType());

        return insertOptionalMetadata(
                html,
                metadata);
    }

    private String readIndexHtml() {
        try (
                InputStream inputStream = indexHtmlResource.getInputStream()) {
            return new String(
                    inputStream.readAllBytes(),
                    StandardCharsets.UTF_8);
        } catch (IOException exception) {
            throw new IllegalStateException(
                    "Unable to read Angular index.html",
                    exception);
        }
    }

    private static String replaceRequiredToken(
            String html,
            String token,
            String value) {

        if (!html.contains(token)) {
            throw new IllegalStateException(
                    "Missing SEO token in index.html: "
                            + token);
        }

        return html.replace(
                token,
                escape(value));
    }

    private static String insertOptionalMetadata(
            String html,
            SeoMetadata metadata) {

        if (!html.contains(HEAD_CLOSING_TAG)) {
            throw new IllegalStateException(
                    "Angular index.html has no closing head tag");
        }

        StringBuilder optionalMetadata = new StringBuilder();

        if (metadata.imageUrl() != null
                && !metadata.imageUrl().isBlank()) {
            String escapedImageUrl = escape(metadata.imageUrl());

            String escapedTitle = escape(metadata.title());

            optionalMetadata.append(
                    """
                            <meta property="og:image" content="%s">
                            <meta property="og:image:alt" content="%s">
                            <meta name="twitter:image" content="%s">
                            <meta name="twitter:image:alt" content="%s">
                            """
                            .formatted(
                                    escapedImageUrl,
                                    escapedTitle,
                                    escapedImageUrl,
                                    escapedTitle));
        }

        if (metadata.publishedAt() != null) {
            optionalMetadata.append(
                    """
                            <meta property="article:published_time" content="%s">
                            """
                            .formatted(
                                    escape(
                                            metadata
                                                    .publishedAt()
                                                    .toString())));
        }

        return html.replace(
                HEAD_CLOSING_TAG,
                optionalMetadata
                        + HEAD_CLOSING_TAG);
    }

    private static String escape(
            String value) {

        if (value == null) {
            return "";
        }

        return HtmlUtils.htmlEscape(value);
    }
}