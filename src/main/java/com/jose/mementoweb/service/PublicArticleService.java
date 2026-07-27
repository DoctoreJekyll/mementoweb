package com.jose.mementoweb.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.jose.mementoweb.domain.article.Article;


import com.jose.mementoweb.repository.ArticleRepository;

@Service
public class PublicArticleService {

    private final ArticleRepository articleRepository;

    public PublicArticleService (ArticleRepository articleRepository)
    {
        this.articleRepository = articleRepository;
    }

    @Transactional(readOnly = true)
    public Page<Article> getPublishedArticles(Pageable pageable)
    {
        Page<Article> page = articleRepository.findByStatus(pageable);
        return page;
    }

    @Transactional(readOnly = true)
    public Article getPublishedArticleBySlug(String slug)
    {
        Article article = articleRepository.findPublishedArticleBySlug(slug).get();
        return article;
    }

}
