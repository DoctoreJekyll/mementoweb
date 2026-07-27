package com.jose.mementoweb.dto;

import java.time.OffsetDateTime;

import com.jose.mementoweb.domain.article.Article;

public record PublicArticleSummaryResponse(
    String slug,
    String title,
    String pretitle,
    String excerpt,
    OffsetDateTime publishedAt
) {
    public static PublicArticleSummaryResponse from(Article article){
        return new PublicArticleSummaryResponse(article.getSlug(), article.getTitle(), article.getPretitle(), article.getExcerpt(), article.getPublishedAt());
    }

}
