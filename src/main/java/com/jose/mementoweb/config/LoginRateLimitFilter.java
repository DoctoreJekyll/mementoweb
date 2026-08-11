package com.jose.mementoweb.config;

import java.io.IOException;

import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

public class LoginRateLimitFilter
        extends OncePerRequestFilter {

    private static final String LOGIN_PATH = "/api/admin/login";

    private final LoginAttemptService loginAttemptService;

    public LoginRateLimitFilter(
            LoginAttemptService loginAttemptService) {

        this.loginAttemptService = loginAttemptService;
    }

    @Override
    protected boolean shouldNotFilter(
            HttpServletRequest request) {

        boolean isLoginRequest = HttpMethod.POST.matches(
                request.getMethod())
                && LOGIN_PATH.equals(
                        request.getServletPath());

        return !isLoginRequest;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        String clientAddress = request.getRemoteAddr();

        if (loginAttemptService.isBlocked(
                clientAddress)) {

            response.setStatus(
                    HttpStatus.TOO_MANY_REQUESTS
                            .value());

            return;
        }

        filterChain.doFilter(request, response);

        if (response.getStatus() == HttpStatus.UNAUTHORIZED.value()) {

            loginAttemptService.recordFailure(
                    clientAddress);

        } else if (response.getStatus() == HttpStatus.NO_CONTENT.value()) {

            loginAttemptService.reset(
                    clientAddress);
        }
    }
}