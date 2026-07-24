package com.jose.mementoweb.service;

import java.text.Normalizer;
import java.util.Locale;

import org.springframework.stereotype.Component;

@Component
public class SlugGenerator {

    public String generate(String title, Long id) {
        validateTitle(title);
        validateId(id);

        String normalizedTitle = Normalizer.normalize(
            title,
            Normalizer.Form.NFD
        );

        String withoutAccents = normalizedTitle
            .replaceAll("\\p{M}+", "");

        String slugBase = withoutAccents
            .toLowerCase(Locale.ROOT)
            .replaceAll("[^a-z0-9]+", "-")
            .replaceAll("^-+|-+$", "");

        if (slugBase.isBlank()) {
            slugBase = "article";
        }

        return slugBase + "-" + id;
    }

    private void validateTitle(String title) {
        if (title == null || title.isBlank()) {
            throw new IllegalArgumentException(
                "Title cannot be null or blank"
            );
        }
    }

    private void validateId(Long id) {
        if (id == null || id <= 0) {
            throw new IllegalArgumentException(
                "Id must be greater than zero"
            );
        }
    }
}