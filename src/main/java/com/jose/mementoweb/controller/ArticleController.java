package com.jose.mementoweb.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.jose.mementoweb.domain.article.Article;
import com.jose.mementoweb.dto.CreateArticleRequest;
import com.jose.mementoweb.dto.CreateArticleResponse;
import com.jose.mementoweb.service.ArticleService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/admin/articles")
public class ArticleController {

    private final ArticleService articleService;

    public ArticleController(ArticleService articleService) {
        this.articleService = articleService;
    }

    @PostMapping
    public ResponseEntity<CreateArticleResponse> createArticle(@Valid @RequestBody CreateArticleRequest request) {
        Article savedArticle = articleService.createArticle(request.title());
        CreateArticleResponse response = CreateArticleResponse.from(savedArticle);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

}
