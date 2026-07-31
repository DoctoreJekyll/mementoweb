package com.jose.mementoweb.controller;

import static org.springframework.security.test.web.servlet
    .request.SecurityMockMvcRequestPostProcessors.user;
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
import org.springframework.test.web.servlet.request.RequestPostProcessor;
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
class AdminArticleListIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ArticleRepository articleRepository;

    @Test
    void shouldListAllArticlesOrderedByIdDescending()
            throws Exception {

        Article draft = new Article("Borrador");
        articleRepository.saveAndFlush(draft);

        Article published = createPublishedArticle(
            "Artículo publicado",
            "articulo-publicado-1"
        );

        Article withdrawn = createPublishedArticle(
            "Artículo retirado",
            "articulo-retirado-2"
        );

        withdrawn.withdraw();
        articleRepository.flush();

        mockMvc.perform(get("/api/admin/articles")
                .with(adminUser()))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.content.length()")
                .value(3))
            .andExpect(jsonPath("$.content[0].id")
                .value(withdrawn.getId()))
            .andExpect(jsonPath("$.content[1].id")
                .value(published.getId()))
            .andExpect(jsonPath("$.content[2].id")
                .value(draft.getId()))
            .andExpect(jsonPath("$.content[0].body")
                .doesNotExist())
            .andExpect(jsonPath("$.content[0].excerpt")
                .doesNotExist())
            .andExpect(jsonPath("$.totalElements")
                .value(3));
    }

    @Test
    void shouldFilterArticlesByStatus()
            throws Exception {

        Article draft = new Article("Borrador");
        articleRepository.saveAndFlush(draft);

        createPublishedArticle(
            "Artículo publicado",
            "articulo-publicado-1"
        );

        mockMvc.perform(get("/api/admin/articles")
                .with(adminUser())
                .param("status", "DRAFT"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.content.length()")
                .value(1))
            .andExpect(jsonPath("$.content[0].id")
                .value(draft.getId()))
            .andExpect(jsonPath("$.content[0].status")
                .value("DRAFT"))
            .andExpect(jsonPath("$.totalElements")
                .value(1));
    }

    @Test
    void shouldReturnAdminPaginationMetadata()
            throws Exception {

        articleRepository.saveAndFlush(
            new Article("Artículo uno")
        );

        articleRepository.saveAndFlush(
            new Article("Artículo dos")
        );

        articleRepository.saveAndFlush(
            new Article("Artículo tres")
        );

        mockMvc.perform(get("/api/admin/articles")
                .with(adminUser())
                .param("page", "0")
                .param("size", "2"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.content.length()")
                .value(2))
            .andExpect(jsonPath("$.page")
                .value(0))
            .andExpect(jsonPath("$.size")
                .value(2))
            .andExpect(jsonPath("$.totalElements")
                .value(3))
            .andExpect(jsonPath("$.totalPages")
                .value(2));
    }

    @Test
    void shouldRejectInvalidAdminPagination()
            throws Exception {

        mockMvc.perform(get("/api/admin/articles")
                .with(adminUser())
                .param("page", "-1"))
            .andExpect(status().isBadRequest());

        mockMvc.perform(get("/api/admin/articles")
                .with(adminUser())
                .param("size", "21"))
            .andExpect(status().isBadRequest());
    }

    @Test
    void shouldRejectUnknownArticleStatus()
            throws Exception {

        mockMvc.perform(get("/api/admin/articles")
                .with(adminUser())
                .param("status", "UNKNOWN"))
            .andExpect(status().isBadRequest());
    }

    private RequestPostProcessor adminUser() {
        return user("test-admin")
            .roles("ADMIN");
    }

    private Article createPublishedArticle(
            String title,
            String slug) {

        Article article = new Article(title);

        article.changeExcerpt(
            "Entradilla de " + title
        );

        article.changeBody(
            "Contenido de " + title
        );

        article.publish(slug);

        return articleRepository
            .saveAndFlush(article);
    }
}