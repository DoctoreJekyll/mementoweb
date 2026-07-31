package com.jose.mementoweb.repository;

import static org.assertj.core.api.Assertions.assertThat;

import jakarta.persistence.EntityManager;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase;

import com.jose.mementoweb.domain.article.Article;
import com.jose.mementoweb.domain.article.ArticleStatus;

import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;

import com.jose.mementoweb.config.TestcontainersConfiguration;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@ActiveProfiles("test")
@Import(TestcontainersConfiguration.class)
class ArticleRepositoryTest {

    @Autowired
    private ArticleRepository articleRepository;

    @Autowired
    private EntityManager entityManager;

    @Test
    void shouldSaveAndRetrieveDraftArticle() {
        Article article = new Article("Mi primer artículo");

        Article savedArticle = articleRepository.saveAndFlush(article);
        Long articleId = savedArticle.getId();

        entityManager.clear();

        Article retrievedArticle = articleRepository.findById(articleId)
                .orElseThrow();

        assertThat(articleId).isNotNull();
        assertThat(retrievedArticle.getTitle())
                .isEqualTo("Mi primer artículo");
        assertThat(retrievedArticle.getStatus())
                .isEqualTo(ArticleStatus.DRAFT);
    }
}