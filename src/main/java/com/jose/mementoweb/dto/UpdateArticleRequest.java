package com.jose.mementoweb.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateArticleRequest(
    @NotBlank
    @Size(max = 255)
    String title,

    @Size(max = 255)
    String pretitle,

    String excerpt,
    String body
) {
}