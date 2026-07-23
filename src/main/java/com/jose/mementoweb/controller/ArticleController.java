package com.jose.mementoweb.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.jose.mementoweb.domain.article.Article;
import com.jose.mementoweb.dto.CreateArticleRequest;
import com.jose.mementoweb.dto.UpdateArticleRequest;
import com.jose.mementoweb.dto.AdminArticleResponse;
import com.jose.mementoweb.service.ArticleService;

import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@RestController
@RequestMapping("/api/admin/articles")
public class ArticleController {

    private final ArticleService articleService;

    public ArticleController(ArticleService articleService) {
        this.articleService = articleService;
    }

    @PostMapping
    public ResponseEntity<AdminArticleResponse> createArticle(@Valid @RequestBody CreateArticleRequest request) {
        Article savedArticle = articleService.createArticle(request.title());
        AdminArticleResponse response = AdminArticleResponse.from(savedArticle);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AdminArticleResponse> getArticle(@PathVariable Long id) {
        Article article = articleService.getArticleById(id);
        AdminArticleResponse response = AdminArticleResponse.from(article);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<AdminArticleResponse> updateArticle(@PathVariable Long id, @Valid @RequestBody UpdateArticleRequest request) {
        Article updatedArticle = articleService.updateArticle(id, request.title(), request.pretitle(), request.excerpt(), request.body());
        AdminArticleResponse response = AdminArticleResponse.from(updatedArticle);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/publish")
    public ResponseEntity<AdminArticleResponse> publishArticle(@PathVariable Long id) {
        Article article = articleService.publishArticle(id);
        AdminArticleResponse response = AdminArticleResponse.from(article);
        return ResponseEntity.ok(response);
    }


    @PostMapping("/{id}/withdraw")
    public ResponseEntity<AdminArticleResponse> withdrawArticle(@PathVariable Long id) {
        Article article = articleService.withdrawArticle(id);
        AdminArticleResponse response = AdminArticleResponse.from(article);
        return ResponseEntity.ok(response);
    }
    
    

}
