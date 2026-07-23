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

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class ArticleControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

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
}