package com.jose.mementoweb.controller;

import static org.springframework.test.web.servlet
    .request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet
    .result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet
    .result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import com.jose.mementoweb.domain.article.Article;
import com.jose.mementoweb.repository.ArticleRepository;

import org.springframework.test.context.ActiveProfiles;

import org.springframework.context.annotation.Import;

import com.jose.mementoweb.config.TestcontainersConfiguration;

@Import(TestcontainersConfiguration.class)
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
@ActiveProfiles("test")
class PublicArticleControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ArticleRepository articleRepository;


    @Test
    void shouldListOnlyPublishedArticlesInPublicationOrder()
            throws Exception {

        Article firstPublished = createPublishedArticle(
            "Primer artículo",
            "primer-articulo-1"
        );

        Article lastPublished = createPublishedArticle(
            "Último artículo",
            "ultimo-articulo-2"
        );

        Article draft = new Article("Borrador");
        articleRepository.saveAndFlush(draft);

        Article withdrawn = createPublishedArticle(
            "Artículo retirado",
            "articulo-retirado-3"
        );

        withdrawn.withdraw();
        articleRepository.flush();

        mockMvc.perform(get("/api/articles")
                .param("page", "0")
                .param("size", "10"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.content.length()")
                .value(2))
            .andExpect(jsonPath("$.content[0].slug")
                .value(lastPublished.getSlug()))
            .andExpect(jsonPath("$.content[1].slug")
                .value(firstPublished.getSlug()))
            .andExpect(jsonPath("$.content[0].body")
                .doesNotExist())
            .andExpect(jsonPath("$.page").value(0))
            .andExpect(jsonPath("$.size").value(10))
            .andExpect(jsonPath("$.totalElements")
                .value(2))
            .andExpect(jsonPath("$.totalPages")
                .value(1));
    }

    @Test
    void shouldReturnPaginationMetadata()
            throws Exception {

        createPublishedArticle("Artículo uno", "articulo-uno-1");
        createPublishedArticle("Artículo dos", "articulo-dos-2");
        createPublishedArticle("Artículo tres", "articulo-tres-3");

        mockMvc.perform(get("/api/articles")
                .param("page", "0")
                .param("size", "2"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.content.length()")
                .value(2))
            .andExpect(jsonPath("$.page").value(0))
            .andExpect(jsonPath("$.size").value(2))
            .andExpect(jsonPath("$.totalElements")
                .value(3))
            .andExpect(jsonPath("$.totalPages")
                .value(2));
    }

    @Test
    void shouldReturnPublishedArticleBySlug()
            throws Exception {

        Article article = createPublishedArticle(
            "Artículo público",
            "articulo-publico-1"
        );

        mockMvc.perform(get(
                    "/api/articles/{slug}",
                    article.getSlug()
                ))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.slug")
                .value("articulo-publico-1"))
            .andExpect(jsonPath("$.title")
                .value("Artículo público"))
            .andExpect(jsonPath("$.excerpt")
                .value("Entradilla de Artículo público"))
            .andExpect(jsonPath("$.body")
                .value("Contenido de Artículo público"))
            .andExpect(jsonPath("$.id")
                .doesNotExist())
            .andExpect(jsonPath("$.status")
                .doesNotExist());
    }

    @Test
    void shouldReturnNotFoundForWithdrawnArticle()
            throws Exception {

        Article article = createPublishedArticle(
            "Artículo retirado",
            "articulo-retirado-1"
        );

        article.withdraw();
        articleRepository.flush();

        mockMvc.perform(get(
                    "/api/articles/{slug}",
                    article.getSlug()
                ))
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.title")
                .value("Published article not found"))
            .andExpect(jsonPath("$.status")
                .value(404));
    }

    @Test
    void shouldRejectInvalidPagination()
            throws Exception {

        mockMvc.perform(get("/api/articles")
                .param("page", "-1")
                .param("size", "10"))
            .andExpect(status().isBadRequest());

        mockMvc.perform(get("/api/articles")
                .param("page", "0")
                .param("size", "21"))
            .andExpect(status().isBadRequest());
    }

    private Article createPublishedArticle(
            String title,
            String slug) {

        Article article = new Article(title);
        article.changeExcerpt("Entradilla de " + title);
        article.changeBody("Contenido de " + title);
        article.publish(slug);

        return articleRepository.saveAndFlush(article);
    }
}