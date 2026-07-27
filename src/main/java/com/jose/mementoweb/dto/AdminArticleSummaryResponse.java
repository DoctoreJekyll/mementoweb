package com.jose.mementoweb.dto;

import java.time.OffsetDateTime;

import com.jose.mementoweb.domain.article.Article;

public record AdminArticleSummaryResponse(
    Long id,
    String title,
    String pretitle,
    String status,
    boolean canBePublished,
    String slug,
    OffsetDateTime publishedAt
){
    public static AdminArticleSummaryResponse from(
            Article article) {
    
        return new AdminArticleSummaryResponse(
            article.getId(),
            article.getTitle(),
            article.getPretitle(),
            article.getStatus().name(),
            article.canBePublished(),
            article.getSlug(),
            article.getPublishedAt()
        );
    }
}
