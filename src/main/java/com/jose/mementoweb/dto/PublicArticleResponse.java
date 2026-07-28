package com.jose.mementoweb.dto;

import java.time.OffsetDateTime;

import com.jose.mementoweb.domain.article.Article;

//Articulo completo
public record PublicArticleResponse(String slug, String title, String pretitle, String excerpt, String body, OffsetDateTime publishedAt) {
    public static PublicArticleResponse from(Article article){
        return new PublicArticleResponse(article.getSlug(), article.getTitle(), article.getPretitle(), article.getExcerpt(), article.getBody(), article.getPublishedAt());
    }
}
