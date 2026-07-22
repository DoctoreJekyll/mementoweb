package com.jose.mementoweb.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.jose.mementoweb.domain.article.Article;

public interface ArticleRepository extends JpaRepository<Article, Long> {

}
