package com.jose.mementoweb.repository;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.jose.mementoweb.domain.article.Article;
import com.jose.mementoweb.domain.article.ArticleStatus;

public interface ArticleRepository extends JpaRepository<Article, Long> {
    
    Page<Article> findByStatusOrderByPublishedAtDescIdDesc(ArticleStatus status,Pageable pageable);

    Optional<Article> findBySlugAndStatus(String slug,ArticleStatus status);

    Page<Article> findAllByOrderByIdDesc(Pageable pageable);

    Page<Article> findByStatusOrderByIdDesc(ArticleStatus status,Pageable pageable);

}
