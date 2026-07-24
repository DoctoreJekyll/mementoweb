package com.jose.mementoweb.dto;

import com.jose.mementoweb.domain.article.Article;


public record AdminArticleResponse(Long id, String title, String pretitle, String excerpt, String body, String status, boolean canBePublished) {
    public static AdminArticleResponse from(Article article) {
        return new AdminArticleResponse(article.getId(), 
        article.getTitle(), 
        article.getPretitle(), 
        article.getExcerpt(), 
        article.getBody(), 
        article.getStatus().name(),
        article.canBePublished());
    }
}
