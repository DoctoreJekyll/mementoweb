package com.jose.mementoweb.dto;

public record UpdateArticleRequest(
    String title, 
    String pretitle, 
    String excerpt, 
    String body) {

}
