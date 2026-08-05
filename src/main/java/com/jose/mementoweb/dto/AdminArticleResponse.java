package com.jose.mementoweb.dto;

import java.time.OffsetDateTime;

import com.jose.mementoweb.domain.article.Article;

//Detalle administrativo
public record AdminArticleResponse(Long id, String title, String pretitle, String excerpt, String body, String status,
        boolean canBePublished, String slug, OffsetDateTime publishedAt, String coverImageUrl,
        String coverImageAlt, String recommendedAudioTitle,
        String recommendedAudioAuthor,
        String recommendedAudioUrl) {
    public static AdminArticleResponse from(Article article) {
        return new AdminArticleResponse(article.getId(),
                article.getTitle(),
                article.getPretitle(),
                article.getExcerpt(),
                article.getBody(),
                article.getStatus().name(),
                article.canBePublished(),
                article.getSlug(),
                article.getPublishedAt(),
                article.getCoverImageUrl(),
                article.getCoverImageAlt(),
                article.getRecommendedAudioTitle(),
                article.getRecommendedAudioAuthor(),
                article.getRecommendedAudioUrl());
    }
}
