package com.jose.mementoweb.exception;

public class PublishedArticleNotFoundException extends RuntimeException {
    public PublishedArticleNotFoundException(String slug) {
        super(
            "Published article not found (Slug: "
            + slug
            + ")"
        );
    }
}
