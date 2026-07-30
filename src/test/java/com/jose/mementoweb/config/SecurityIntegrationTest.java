package com.jose.mementoweb.config;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.httpBasic;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;

import org.springframework.http.HttpHeaders;

@SpringBootTest(properties = {
                "app.security.admin.username=test-admin",
                "app.security.admin.password=test-password"
})
@AutoConfigureMockMvc
class SecurityIntegrationTest {

        private static final String ADMIN_USERNAME = "test-admin";

        private static final String ADMIN_PASSWORD = "test-password";

        @Autowired
        private MockMvc mockMvc;

        @Test
        void shouldReturnAuthenticatedAdminSession()
                        throws Exception {

                mockMvc.perform(get("/api/admin/session")
                                .with(httpBasic(
                                                ADMIN_USERNAME,
                                                ADMIN_PASSWORD)))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.username")
                                                .value(ADMIN_USERNAME));
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
                                .andExpect(status().isUnauthorized());
        }

        @Test
        void shouldRejectInvalidAdminCredentials()
                        throws Exception {

                mockMvc.perform(get("/api/admin/articles")
                                .with(httpBasic(
                                                ADMIN_USERNAME,
                                                "incorrect-password")))
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
        void shouldAllowValidAdminCredentials()
                        throws Exception {

                mockMvc.perform(get("/api/admin/articles")
                                .with(httpBasic(
                                                ADMIN_USERNAME,
                                                ADMIN_PASSWORD)))
                                .andExpect(status().isOk());
        }
}