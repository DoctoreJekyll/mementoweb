package com.jose.mementoweb.config;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.HttpHeaders;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import org.springframework.context.annotation.Import;

@Import(TestcontainersConfiguration.class)
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class SecurityIntegrationTest {

        @Autowired
        private MockMvc mockMvc;

        @Test
        void shouldRejectAnonymousWritesToPublicArticles()
                        throws Exception {

                mockMvc.perform(post("/api/articles")
                                .with(csrf()))
                                .andExpect(status().isUnauthorized());
        }

        @Test
        void shouldRejectAdminAccessToUnknownApiEndpoint()
                        throws Exception {

                mockMvc.perform(get("/api/unknown")
                                .with(user("admin")
                                                .roles("ADMIN")))
                                .andExpect(status().isForbidden());
        }

        @Test
        void shouldRejectAnonymousAccessToUnknownApiEndpoint()
                        throws Exception {

                mockMvc.perform(get("/api/unknown"))
                                .andExpect(status().isUnauthorized());
        }

        @Test
        void shouldAllowAnonymousAccessToPublicArticles()
                        throws Exception {

                mockMvc.perform(get("/api/articles"))
                                .andExpect(status().isOk());
        }

        @Test
        void shouldRejectAnonymousAccessToAdminArticles()
                        throws Exception {

                mockMvc.perform(get("/api/admin/articles"))
                                .andExpect(status().isUnauthorized())
                                .andExpect(
                                                header().doesNotExist(
                                                                HttpHeaders.WWW_AUTHENTICATE));
        }

        @Test
        void shouldRejectAuthenticatedUserWithoutAdminRole()
                        throws Exception {

                mockMvc.perform(get("/api/admin/articles")
                                .with(user("reader")
                                                .roles("USER")))
                                .andExpect(status().isForbidden());
        }

        @Test
        void shouldAllowAdminAccessToAdminArticles()
                        throws Exception {

                mockMvc.perform(get("/api/admin/articles")
                                .with(user("admin")
                                                .roles("ADMIN")))
                                .andExpect(status().isOk());
        }
}