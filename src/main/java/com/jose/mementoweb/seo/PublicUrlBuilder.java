package com.jose.mementoweb.seo;

import java.net.URI;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

@Component
public class PublicUrlBuilder {

    private final String publicBaseUrl;

    public PublicUrlBuilder(
            @Value("${app.public-base-url}") String publicBaseUrl) {

        this.publicBaseUrl = normalizePublicBaseUrl(
                publicBaseUrl);
    }

    public String homeUrl() {
        return publicBaseUrl + "/";
    }

    public String adminUrl() {
        return publicBaseUrl + "/admin";
    }

    public String sitemapUrl() {
        return publicBaseUrl + "/sitemap.xml";
    }

    public String articleUrl(
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