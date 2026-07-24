package com.jose.mementoweb.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

import org.junit.jupiter.api.Test;

import com.jose.mementoweb.domain.article.Article;
import com.jose.mementoweb.domain.article.ArticleStatus;
import com.jose.mementoweb.exception.ArticleStateException;

class ArticleTest {

    @Test
    void shouldPublishCompleteDraft() {
        Article article = createCompleteDraft();

        article.publish();

        assertThat(article.getStatus())
            .isEqualTo(ArticleStatus.PUBLISHED);

        assertThat(article.canBePublished())
            .isFalse();
    }

    @Test
    void shouldRejectPublishingIncompleteDraft() {
        Article article = new Article("Artículo incompleto");

        ArticleStateException exception = assertThrows(
            ArticleStateException.class,
            () -> article.publish()
        );

        assertThat(exception.getMessage())
            .isEqualTo("Article is not ready to be published");

        assertThat(article.getStatus())
            .isEqualTo(ArticleStatus.DRAFT);
    }

    @Test
    void shouldWithdrawPublishedArticle() {
        Article article = createCompleteDraft();
        article.publish();

        article.withdraw();

        assertThat(article.getStatus())
            .isEqualTo(ArticleStatus.WITHDRAWN);

        assertThat(article.canBePublished())
            .isTrue();
    }

    @Test
    void shouldRepublishWithdrawnArticle() {
        Article article = createCompleteDraft();
        article.publish();
        article.withdraw();

        article.publish();

        assertThat(article.getStatus())
            .isEqualTo(ArticleStatus.PUBLISHED);

        assertThat(article.canBePublished())
            .isFalse();
    }

    @Test
    void shouldRejectWithdrawingDraftArticle() {
        Article article = createCompleteDraft();

        ArticleStateException exception = assertThrows(
            ArticleStateException.class,
            () -> article.withdraw()
        );

        assertThat(exception.getMessage())
            .isEqualTo(
                "Only published articles can be withdrawn"
            );

        assertThat(article.getStatus())
            .isEqualTo(ArticleStatus.DRAFT);
    }

    private Article createCompleteDraft() {
        Article article = new Article("Mi artículo");
        article.changeExcerpt("Entradilla del artículo");
        article.changeBody("Contenido del artículo");

        return article;
    }
}