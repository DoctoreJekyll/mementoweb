package com.jose.mementoweb.repository;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.jose.mementoweb.domain.article.Article;

public interface ArticleRepository extends JpaRepository<Article, Long> {
    public Page<Article> findByStatus(Pageable pageable);
    public Optional<Article> findPublishedArticleBySlug(String slug);
}
