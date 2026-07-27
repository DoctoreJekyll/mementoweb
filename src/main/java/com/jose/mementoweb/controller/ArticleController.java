package com.jose.mementoweb.controller;

import java.util.ArrayList;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.jose.mementoweb.domain.article.Article;
import com.jose.mementoweb.domain.article.ArticleStatus;
import com.jose.mementoweb.dto.CreateArticleRequest;
import com.jose.mementoweb.dto.PageResponse;
import com.jose.mementoweb.dto.UpdateArticleRequest;
import com.jose.mementoweb.dto.AdminArticleResponse;
import com.jose.mementoweb.dto.AdminArticleSummaryResponse;
import com.jose.mementoweb.service.ArticleService;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

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
    
    public ResponseEntity<PageResponse<AdminArticleSummaryResponse>>
    getArticles(@RequestParam(defaultValue = "0") @Min(0) int page, @RequestParam(defaultValue = "10") @Min(1) @Max(20) int size,
                    @RequestParam(required = false) ArticleStatus status){
            PageRequest pageable = PageRequest.of(page, size);
            Page<Article> articlePage;

            if (status == null) {
                articlePage = articleService.getArticles(pageable);
            }else{
                articlePage = articleService.getArticlesByStatus(status, pageable);
            }


            List<AdminArticleSummaryResponse> summaries = new ArrayList<>();
            for(Article article : articlePage.getContent()){
                AdminArticleSummaryResponse summary = AdminArticleSummaryResponse.from(article);
                summaries.add(summary);
            }

            PageResponse<AdminArticleSummaryResponse> response = PageResponse.from(summaries, articlePage);

            return ResponseEntity.ok(response);
        }
    

}
