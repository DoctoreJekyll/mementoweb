package com.jose.mementoweb.service;

import java.util.Optional;

import org.springframework.stereotype.Service;

import com.jose.mementoweb.domain.article.Article;
import com.jose.mementoweb.exception.ArticleNotFoundException;
import com.jose.mementoweb.repository.ArticleRepository;

import org.springframework.transaction.annotation.Transactional;

@Service
public class ArticleService {

    private final ArticleRepository articleRepository;

    public ArticleService(ArticleRepository articleRepository) {
        this.articleRepository = articleRepository;
    }


    @Transactional
    public Article createArticle(String title) {
        Article article = new Article(title);

        return articleRepository.save(article);
    }

    private Article findArticleOrThrow(Long id) {
        Optional<Article> article =
            articleRepository.findById(id);

        if (article.isEmpty()) {
            throw new ArticleNotFoundException("Article not found", id);
        }

        return article.get();
    }

    @Transactional(readOnly = true)
    public Article getArticleById(Long id) {
        return findArticleOrThrow(id);
    }

    @Transactional
    public Article updateArticle(Long id, String title, String pretitle, String excerpt, String body) {
        Article article = findArticleOrThrow(id);

        article.changeTitle(title);
        article.changePretitle(pretitle);
        article.changeExcerpt(excerpt);
        article.changeBody(body);

        return article;
    }
    
    @Transactional
    public Article publishArticle(Long id) {
        Article article = findArticleOrThrow(id);
        article.publish();
        return article;
    }

    @Transactional
    public Article withdrawArticle(Long id){
        Article article = findArticleOrThrow(id);
        article.withdraw();
        return article;
    }
}
