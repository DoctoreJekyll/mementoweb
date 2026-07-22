package com.jose.mementoweb.dto;

import jakarta.validation.constraints.NotBlank;

public record CreateArticleRequest(@NotBlank String title) {

}
