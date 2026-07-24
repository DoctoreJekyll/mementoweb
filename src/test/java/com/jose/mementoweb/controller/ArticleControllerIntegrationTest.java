package com.jose.mementoweb.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;

import jakarta.persistence.EntityManager;

import com.jose.mementoweb.domain.article.Article;
import com.jose.mementoweb.domain.article.ArticleStatus;
import com.jose.mementoweb.repository.ArticleRepository;


@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class ArticleControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ArticleRepository articleRepository;

    @Autowired
    private EntityManager entityManager;

    @Test
    void shouldPublishArticleThroughApi() throws Exception {
        Article article = new Article("Artículo publicable");
        article.changeExcerpt("Entradilla");
        article.changeBody("Contenido");

        Article savedArticle =
            articleRepository.saveAndFlush(article);

        Long articleId = savedArticle.getId();

        mockMvc.perform(post(
                    "/api/admin/articles/{id}/publish",
                    articleId
                ))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(articleId))
            .andExpect(jsonPath("$.status")
                .value("PUBLISHED"))
            .andExpect(jsonPath("$.canBePublished")
                .value(false));

        entityManager.flush();
        entityManager.clear();

        Article persistedArticle =
            articleRepository.findById(articleId)
                .orElseThrow();

        assertThat(persistedArticle.getStatus())
            .isEqualTo(ArticleStatus.PUBLISHED);
    }

    @Test
    void shouldWithdrawArticleThroughApi() throws Exception {
        Article article = new Article("Artículo publicado");
        article.changeExcerpt("Entradilla");
        article.changeBody("Contenido");
        article.publish(article.getSlug());

        Article savedArticle =
            articleRepository.saveAndFlush(article);

        Long articleId = savedArticle.getId();

        mockMvc.perform(post(
                    "/api/admin/articles/{id}/withdraw",
                    articleId
                ))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(articleId))
            .andExpect(jsonPath("$.status")
                .value("WITHDRAWN"))
            .andExpect(jsonPath("$.canBePublished")
                .value(true));

        entityManager.flush();
        entityManager.clear();

        Article persistedArticle =
            articleRepository.findById(articleId)
                .orElseThrow();

        assertThat(persistedArticle.getStatus())
            .isEqualTo(ArticleStatus.WITHDRAWN);
    }


    @Test
    void shouldReturnConflictWhenPublishingIncompleteArticle()
            throws Exception {

        Article article = new Article("Artículo incompleto");

        Article savedArticle =
            articleRepository.saveAndFlush(article);

        mockMvc.perform(post(
                    "/api/admin/articles/{id}/publish",
                    savedArticle.getId()
                ))
            .andExpect(status().isConflict())
            .andExpect(jsonPath("$.title")
                .value("Invalid article state"))
            .andExpect(jsonPath("$.status")
                .value(409))
            .andExpect(jsonPath("$.detail")
                .value(
                    "Article is not ready to be published"
                ));
    }

    @Test
    void shouldCreateDraftArticle() throws Exception {
        mockMvc.perform(post("/api/admin/articles")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                        "title": "Mi primer artículo"
                    }
                    """))
            .andExpect(status().isCreated())
            .andExpect(content()
                .contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
            .andExpect(jsonPath("$.id").isNumber())
            .andExpect(jsonPath("$.title")
                .value("Mi primer artículo"))
            .andExpect(jsonPath("$.status")
                .value("DRAFT"));
    }

    @Test
    void shouldRejectArticleWithBlankTitle() throws Exception {
        mockMvc.perform(post("/api/admin/articles")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                        "title": "   "
                    }
                    """))
            .andExpect(status().isBadRequest());
    }


    @Test
    void shouldRetrieveArticleById() throws Exception {
        Article article = new Article("Artículo guardado");
        article.changePretitle("ENSAYO");
        article.changeExcerpt("Una pequeña introducción");
        article.changeBody("Contenido del artículo");

        Article savedArticle = articleRepository.saveAndFlush(article);

        mockMvc.perform(get(
                    "/api/admin/articles/{id}",
                    savedArticle.getId()
                ))
            .andExpect(status().isOk())
            .andExpect(content()
                .contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
            .andExpect(jsonPath("$.id")
                .value(savedArticle.getId()))
            .andExpect(jsonPath("$.title")
                .value("Artículo guardado"))
            .andExpect(jsonPath("$.pretitle")
                .value("ENSAYO"))
            .andExpect(jsonPath("$.excerpt")
                .value("Una pequeña introducción"))
            .andExpect(jsonPath("$.body")
                .value("Contenido del artículo"))
            .andExpect(jsonPath("$.status")
                .value("DRAFT"));
    }

    @Test
    void shouldUpdateArticle() throws Exception {
        Article article = new Article("Título anterior");
        Article savedArticle = articleRepository.saveAndFlush(article);
        Long articleId = savedArticle.getId();

        mockMvc.perform(put(
                    "/api/admin/articles/{id}",
                    articleId
                )
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                        "title": "Título actualizado",
                        "pretitle": "REFLEXIÓN",
                        "excerpt": "Nueva entradilla",
                        "body": "Nuevo contenido"
                    }
                    """))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(articleId))
            .andExpect(jsonPath("$.title")
                .value("Título actualizado"))
            .andExpect(jsonPath("$.pretitle")
                .value("REFLEXIÓN"))
            .andExpect(jsonPath("$.excerpt")
                .value("Nueva entradilla"))
            .andExpect(jsonPath("$.body")
                .value("Nuevo contenido"))
            .andExpect(jsonPath("$.status")
                .value("DRAFT"));

        entityManager.flush();
        entityManager.clear();

        Article updatedArticle = articleRepository.findById(articleId)
            .orElseThrow();

        assertThat(updatedArticle.getTitle())
            .isEqualTo("Título actualizado");
        assertThat(updatedArticle.getPretitle())
            .isEqualTo("REFLEXIÓN");
        assertThat(updatedArticle.getExcerpt())
            .isEqualTo("Nueva entradilla");
        assertThat(updatedArticle.getBody())
            .isEqualTo("Nuevo contenido");
    }


    @Test
    void shouldReturnNotFoundWhenArticleDoesNotExist()
            throws Exception {

        long missingArticleId = Long.MAX_VALUE;

        mockMvc.perform(get(
                    "/api/admin/articles/{id}",
                    missingArticleId
                ))
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.title")
                .value("Article not found"))
            .andExpect(jsonPath("$.status")
                .value(404))
            .andExpect(jsonPath("$.detail")
                .value("Article not found" + " (Article ID: " + missingArticleId + ")"));
    }

}