package com.jose.mementoweb.exception;

public class PublishedArticleNotFoundException extends RuntimeException {
        public PublishedArticleNotFoundException(String message){
        super(message);
    }
}
