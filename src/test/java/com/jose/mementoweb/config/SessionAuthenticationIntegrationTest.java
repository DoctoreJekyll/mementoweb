package com.jose.mementoweb.config;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

import jakarta.servlet.http.Cookie;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Import(TestcontainersConfiguration.class)
class SessionAuthenticationIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void shouldChangeSessionIdAfterLogin()
            throws Exception {

        MockHttpSession anonymousSession = new MockHttpSession();

        Cookie csrfCookie = requestCsrfCookie(anonymousSession);

        String anonymousSessionId = anonymousSession.getId();

        MvcResult loginResult = mockMvc.perform(
                post("/api/admin/login")
                        .session(anonymousSession)
                        .cookie(csrfCookie)
                        .header(
                                "X-XSRF-TOKEN",
                                csrfCookie.getValue())
                        .contentType(
                                MediaType.APPLICATION_FORM_URLENCODED)
                        .param(
                                "username",
                                "test-admin")
                        .param(
                                "password",
                                "test-password"))
                .andExpect(status().isNoContent())
                .andReturn();

        MockHttpSession authenticatedSession = (MockHttpSession) loginResult
                .getRequest()
                .getSession(false);

        assertThat(authenticatedSession)
                .isNotNull();

        assertThat(authenticatedSession.getId())
                .isNotEqualTo(anonymousSessionId);
    }

    @Test
    void shouldProvideCsrfTokenForTheSpa()
            throws Exception {

        MvcResult result = mockMvc.perform(
                get("/api/auth/csrf"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.headerName")
                        .value("X-XSRF-TOKEN"))
                .andExpect(jsonPath("$.parameterName")
                        .value("_csrf"))
                .andExpect(jsonPath("$.token")
                        .isString())
                .andReturn();

        Cookie csrfCookie = result.getResponse()
                .getCookie("XSRF-TOKEN");

        assertThat(csrfCookie).isNotNull();
        assertThat(csrfCookie.getValue())
                .isNotBlank();
    }

    @Test
    void shouldCreateAnAuthenticatedSession()
            throws Exception {

        Cookie csrfCookie = requestCsrfCookie(null);

        MvcResult loginResult = mockMvc.perform(
                post("/api/admin/login")
                        .cookie(csrfCookie)
                        .header(
                                "X-XSRF-TOKEN",
                                csrfCookie.getValue())
                        .contentType(
                                MediaType.APPLICATION_FORM_URLENCODED)
                        .param(
                                "username",
                                "test-admin")
                        .param(
                                "password",
                                "test-password"))
                .andExpect(status().isNoContent())
                .andReturn();

        MockHttpSession session = (MockHttpSession) loginResult
                .getRequest()
                .getSession(false);

        assertThat(session).isNotNull();
        assertThat(session.isInvalid()).isFalse();

        mockMvc.perform(
                get("/api/admin/session")
                        .session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username")
                        .value("test-admin"));
    }

    @Test
    void shouldRejectInvalidFormCredentials()
            throws Exception {

        Cookie csrfCookie = requestCsrfCookie(null);

        mockMvc.perform(
                post("/api/admin/login")
                        .cookie(csrfCookie)
                        .header(
                                "X-XSRF-TOKEN",
                                csrfCookie.getValue())
                        .contentType(
                                MediaType.APPLICATION_FORM_URLENCODED)
                        .param(
                                "username",
                                "test-admin")
                        .param(
                                "password",
                                "wrong-password"))
                .andExpect(status().isUnauthorized())
                .andExpect(
                        header().doesNotExist(
                                "WWW-Authenticate"));
    }

    @Test
    void shouldInvalidateTheSessionOnLogout()
            throws Exception {

        MockHttpSession session = loginAsAdmin();

        Cookie csrfCookie = requestCsrfCookie(session);

        mockMvc.perform(
                post("/api/admin/logout")
                        .session(session)
                        .cookie(csrfCookie)
                        .header(
                                "X-XSRF-TOKEN",
                                csrfCookie.getValue()))
                .andExpect(status().isNoContent());

        assertThat(session.isInvalid()).isTrue();
    }

    private MockHttpSession loginAsAdmin()
            throws Exception {

        Cookie csrfCookie = requestCsrfCookie(null);

        MvcResult loginResult = mockMvc.perform(
                post("/api/admin/login")
                        .cookie(csrfCookie)
                        .header(
                                "X-XSRF-TOKEN",
                                csrfCookie.getValue())
                        .contentType(
                                MediaType.APPLICATION_FORM_URLENCODED)
                        .param(
                                "username",
                                "test-admin")
                        .param(
                                "password",
                                "test-password"))
                .andExpect(status().isNoContent())
                .andReturn();

        MockHttpSession session = (MockHttpSession) loginResult
                .getRequest()
                .getSession(false);

        assertThat(session).isNotNull();

        return session;
    }

    private Cookie requestCsrfCookie(
            MockHttpSession session)
            throws Exception {

        MockHttpServletRequestBuilder request = get("/api/auth/csrf");

        if (session != null) {
            request.session(session);
        }

        MvcResult result = mockMvc.perform(request)
                .andExpect(status().isOk())
                .andReturn();

        Cookie csrfCookie = result.getResponse()
                .getCookie("XSRF-TOKEN");

        assertThat(csrfCookie).isNotNull();
        assertThat(csrfCookie.getValue())
                .isNotBlank();

        return csrfCookie;
    }
}