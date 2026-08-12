package com.jose.mementoweb.seo;

import java.time.OffsetDateTime;

public record SeoMetadata(
        String title,
        String description,
        String canonicalUrl,
        String robots,
        String openGraphType,
        String imageUrl,
        OffsetDateTime publishedAt) {
}