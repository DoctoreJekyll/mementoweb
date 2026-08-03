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

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http.authorizeHttpRequests(authorize -> authorize
                .requestMatchers("/api/articles/**")
                .permitAll()

                .requestMatchers(
                        "/api/auth/csrf",
                        "/api/admin/login")
                .permitAll()

                .requestMatchers("/api/admin/**")
                .hasRole("ADMIN")

                .anyRequest()
                .permitAll());

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

        return http.build();
    }

    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    UserDetailsService userDetailsService(PasswordEncoder passwordEncoder,
            @Value("${app.security.admin.username}") String username,
            @Value("${app.security.admin.password}") String password) {

        UserDetails admin = User.withUsername(username)
                .password(passwordEncoder.encode(password))
                .roles("ADMIN")
                .build();

        return new InMemoryUserDetailsManager(admin);
    }
}
