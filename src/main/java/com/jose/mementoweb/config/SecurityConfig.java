package com.jose.mementoweb.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.http.HttpStatus;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter.ReferrerPolicy;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

        private static final String CONTENT_SECURITY_POLICY = "default-src 'self'; "
                        + "script-src 'self'; "
                        + "style-src 'self' 'unsafe-inline'; "
                        + "img-src 'self' https: data:; "
                        + "font-src 'self'; "
                        + "connect-src 'self'; "
                        + "object-src 'none'; "
                        + "frame-src 'none'; "
                        + "frame-ancestors 'none'; "
                        + "base-uri 'self'; "
                        + "form-action 'self'; "
                        + "media-src 'none'";

        @Bean
        SecurityFilterChain securityFilterChain(HttpSecurity http, LoginAttemptService loginAttemptService)
                        throws Exception {
                http.authorizeHttpRequests(authorize -> authorize
                                .requestMatchers(
                                                HttpMethod.GET,
                                                "/api/articles/**",
                                                "/api/auth/csrf",
                                                "/actuator/health")
                                .permitAll()

                                .requestMatchers(
                                                HttpMethod.POST,
                                                "/api/admin/login")
                                .permitAll()

                                .requestMatchers("/api/admin/**")
                                .hasRole("ADMIN")

                                .requestMatchers("/api/**")
                                .denyAll()

                                .anyRequest()
                                .permitAll());

                http.sessionManagement(session -> session
                                .sessionCreationPolicy(
                                                SessionCreationPolicy.IF_REQUIRED)

                                .sessionFixation(fixation -> fixation.changeSessionId()));

                http.headers(headers -> headers
                                .contentSecurityPolicy(csp -> csp
                                                .policyDirectives(
                                                                CONTENT_SECURITY_POLICY)

                                                .reportOnly())

                                .referrerPolicy(referrer -> referrer
                                                .policy(
                                                                ReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN))

                                .permissionsPolicyHeader(permissions -> permissions
                                                .policy(
                                                                "camera=(), "
                                                                                + "microphone=(), "
                                                                                + "geolocation=()")));

                http.csrf(csrf -> csrf.spa());

                http.formLogin(form -> form
                                .loginProcessingUrl("/api/admin/login")

                                .successHandler((
                                                request,
                                                response,
                                                authentication) -> {

                                        response.setStatus(
                                                        HttpStatus.NO_CONTENT.value());
                                })

                                .failureHandler((
                                                request,
                                                response,
                                                exception) -> {

                                        response.setStatus(
                                                        HttpStatus.UNAUTHORIZED.value());
                                })

                                .permitAll());

                http.logout(logout -> logout
                                .logoutUrl("/api/admin/logout")

                                .logoutSuccessHandler((
                                                request,
                                                response,
                                                authentication) -> {

                                        response.setStatus(
                                                        HttpStatus.NO_CONTENT.value());
                                })

                                .invalidateHttpSession(true)
                                .deleteCookies("JSESSIONID"));

                http.exceptionHandling(exceptions -> exceptions
                                .authenticationEntryPoint(
                                                new HttpStatusEntryPoint(
                                                                HttpStatus.UNAUTHORIZED)));

                http.addFilterBefore(
                                new LoginRateLimitFilter(
                                                loginAttemptService),
                                UsernamePasswordAuthenticationFilter.class);

                return http.build();
        }

        @Bean
        PasswordEncoder passwordEncoder() {
                return new BCryptPasswordEncoder();
        }

        @Bean
        UserDetailsService userDetailsService(
                        PasswordEncoder passwordEncoder,
                        @Value("${app.security.admin.username}") String username,
                        @Value("${app.security.admin.password}") String password) {

                validateAdminCredentials(
                                username,
                                password);

                UserDetails admin = User.withUsername(username.trim())
                                .password(
                                                passwordEncoder.encode(
                                                                password))
                                .roles("ADMIN")
                                .build();

                return new InMemoryUserDetailsManager(
                                admin);
        }

        private static void validateAdminCredentials(
                        String username,
                        String password) {

                if (username == null
                                || username.isBlank()) {

                        throw new IllegalStateException(
                                        "Admin username must be configured");
                }

                if (password == null
                                || password.length() < 15) {

                        throw new IllegalStateException(
                                        "Admin password must contain "
                                                        + "at least 15 characters");
                }
        }
}
