package com.jose.mementoweb.controller;

import java.util.ArrayList;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.jose.mementoweb.domain.article.Article;
import com.jose.mementoweb.dto.PageResponse;
import com.jose.mementoweb.dto.PublicArticleResponse;
import com.jose.mementoweb.dto.PublicArticleSummaryResponse;
import com.jose.mementoweb.service.PublicArticleService;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

@RestController
@RequestMapping("/api/articles")
public class PublicArticleController {

    private final PublicArticleService publicArticleService;

    public PublicArticleController(
            PublicArticleService publicArticleService) {

        this.publicArticleService = publicArticleService;
    }

    @GetMapping
    public ResponseEntity<
            PageResponse<PublicArticleSummaryResponse>>
            getPublishedArticles(
                @RequestParam(defaultValue = "0")
                @Min(0)
                int page,

                @RequestParam(defaultValue = "10")
                @Min(1)
                @Max(20)
                int size
            ) {

        Pageable pageable = PageRequest.of(page, size);

        Page<Article> articlePage =
            publicArticleService.getPublishedArticles(pageable);

        List<PublicArticleSummaryResponse> summaries =
            new ArrayList<>();

        for (Article article : articlePage.getContent()) {
            PublicArticleSummaryResponse summary =
                PublicArticleSummaryResponse.from(article);

            summaries.add(summary);
        }

        PageResponse<PublicArticleSummaryResponse> response =
            PageResponse.from(summaries, articlePage);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{slug}")
    public ResponseEntity<PublicArticleResponse>
            getPublishedArticleBySlug(
                @PathVariable String slug
            ) {

        Article article =
            publicArticleService
                .getPublishedArticleBySlug(slug);

        PublicArticleResponse response =
            PublicArticleResponse.from(article);

        return ResponseEntity.ok(response);
    }
}