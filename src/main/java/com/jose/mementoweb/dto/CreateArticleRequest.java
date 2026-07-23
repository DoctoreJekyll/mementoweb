package com.jose.mementoweb.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateArticleRequest(@NotBlank @Size(max = 255) String title) {

}
