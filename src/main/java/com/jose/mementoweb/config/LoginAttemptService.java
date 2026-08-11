package com.jose.mementoweb.config;

import java.time.Duration;

import org.springframework.stereotype.Service;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;

@Service
public class LoginAttemptService {

    private static final int MAX_FAILED_ATTEMPTS = 5;

    private static final Duration BLOCK_DURATION = Duration.ofMinutes(15);

    private final Cache<String, Integer> failedAttempts = Caffeine.newBuilder()
            .maximumSize(10_000)
            .expireAfterWrite(BLOCK_DURATION)
            .build();

    public boolean isBlocked(String clientAddress) {
        Integer attempts = failedAttempts.getIfPresent(clientAddress);

        return attempts != null
                && attempts >= MAX_FAILED_ATTEMPTS;
    }

    public void recordFailure(String clientAddress) {
        failedAttempts.asMap().compute(
                clientAddress,
                (key, attempts) -> attempts == null
                        ? 1
                        : attempts + 1);
    }

    public void reset(String clientAddress) {
        failedAttempts.invalidate(clientAddress);
    }
}