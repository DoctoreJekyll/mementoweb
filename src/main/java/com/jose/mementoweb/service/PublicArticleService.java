package com.jose.mementoweb.service;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.jose.mementoweb.domain.article.Article;
import com.jose.mementoweb.domain.article.ArticleStatus;
import com.jose.mementoweb.exception.PublishedArticleNotFoundException;
import com.jose.mementoweb.repository.ArticleRepository;

@Service
public class PublicArticleService {

    private final ArticleRepository articleRepository;

    public PublicArticleService(ArticleRepository articleRepository) {
        this.articleRepository = articleRepository;
    }

    @Transactional(readOnly = true)
    public Page<Article> getPublishedArticles(Pageable pageable) {
        return articleRepository
                .findByStatusOrderByPublishedAtDescIdDesc(
                        ArticleStatus.PUBLISHED,
                        pageable);
    }

    @Transactional(readOnly = true)
    public Article getPublishedArticleBySlug(String slug) {
        Optional<Article> article = articleRepository.findBySlugAndStatus(
                slug,
                ArticleStatus.PUBLISHED);

        if (article.isEmpty()) {
            throw new PublishedArticleNotFoundException(slug);
        }

        return article.get();
    }

    @Transactional(readOnly = true)
    public List<Article> getAllPublishedArticles() {
        return articleRepository
                .findByStatusOrderByPublishedAtDescIdDesc(
                        ArticleStatus.PUBLISHED);
    }

}
