package com.jose.mementoweb.exception;

public class ArticleNotFoundException extends RuntimeException {
    public ArticleNotFoundException(String message, Long articleId) {
        super(message + " (Article ID: " + articleId + ")");
    }

}
