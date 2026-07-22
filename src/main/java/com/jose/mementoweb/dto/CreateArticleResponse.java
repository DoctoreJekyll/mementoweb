package com.jose.mementoweb.dto;

import com.jose.mementoweb.domain.article.Article;


public record CreateArticleResponse(Long id, String title, String status) {
    public static CreateArticleResponse from(Article article) {
        return new CreateArticleResponse(article.getId(), article.getTitle(), article.getStatus().name());
    }
}
