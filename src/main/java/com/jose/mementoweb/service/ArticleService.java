package com.jose.mementoweb.service;

import java.util.Optional;

import org.springframework.stereotype.Service;

import com.jose.mementoweb.domain.article.Article;
import com.jose.mementoweb.repository.ArticleRepository;

import jakarta.transaction.Transactional;

@Service
public class ArticleService {

    private final ArticleRepository articleRepository;

    public ArticleService(ArticleRepository articleRepository) {
        this.articleRepository = articleRepository;
    }


    @Transactional
    public Article createArticle(Article article) {
        return articleRepository.save(article);
    }

    public Optional<Article> getArticleById(Long id) {
        return articleRepository.findById(id);
    }

    public void deleteArticle(Long id) {
        articleRepository.deleteById(id);
    }
}
