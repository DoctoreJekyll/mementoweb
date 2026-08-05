package com.jose.mementoweb.domain.article;

import java.net.URI;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;

import com.jose.mementoweb.exception.ArticleStateException;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "articles")
public class Article {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(length = 255)
    private String pretitle;

    @Column(columnDefinition = "TEXT")
    private String excerpt;

    @Column(columnDefinition = "TEXT")
    private String body;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private ArticleStatus status;

    @Column(length = 300, unique = true)
    private String slug;

    @Column(name = "published_at", columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private OffsetDateTime publishedAt;

    @Column(name = "cover_image_url", columnDefinition = "TEXT")
    private String coverImageUrl;

    @Column(name = "cover_image_alt", length = 500)
    private String coverImageAlt;

    @Column(name = "recommended_audio_title", length = 255)
    private String recommendedAudioTitle;

    @Column(name = "recommended_audio_author", length = 255)
    private String recommendedAudioAuthor;

    @Column(name = "recommended_audio_url", columnDefinition = "TEXT")
    private String recommendedAudioUrl;

    protected Article() {
        // JPA requires a default constructor
    }

    public Article(String title) {
        validateTitle(title);

        this.title = title;
        this.status = ArticleStatus.DRAFT;
    }

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public ArticleStatus getStatus() {
        return status;
    }

    public String getPretitle() {
        return pretitle;
    }

    public String getExcerpt() {
        return excerpt;
    }

    public String getBody() {
        return body;
    }

    public String getSlug() {
        return slug;
    }

    public OffsetDateTime getPublishedAt() {
        return publishedAt;
    }

    public String getCoverImageUrl() {
        return coverImageUrl;
    }

    public String getCoverImageAlt() {
        return coverImageAlt;
    }

    public String getRecommendedAudioTitle() {
        return recommendedAudioTitle;
    }

    public String getRecommendedAudioAuthor() {
        return recommendedAudioAuthor;
    }

    public String getRecommendedAudioUrl() {
        return recommendedAudioUrl;
    }

    private void validateTitle(String title) {
        if (title == null || title.isBlank()) {
            throw new IllegalArgumentException("Title cannot be null or blank");
        }
    }

    public void changeTitle(String title) {
        validateTitle(title);
        this.title = title;
    }

    public void changePretitle(String pretitle) {
        this.pretitle = pretitle;
    }

    public void changeExcerpt(String excerpt) {
        if (this.status == ArticleStatus.PUBLISHED && valueIsNullOrBlank(excerpt)) {
            throw new ArticleStateException(
                    "A published article must have an excerpt");
        }

        this.excerpt = excerpt;
    }

    public void changeBody(String body) {
        if (this.status == ArticleStatus.PUBLISHED && valueIsNullOrBlank(body)) {
            throw new ArticleStateException(
                    "A published article must have a body");
        }

        this.body = body;
    }

    private boolean valueIsNullOrBlank(String value) {
        return value == null || value.isBlank();
    }

    private boolean hasRequiredContent() {
        return !valueIsNullOrBlank(this.title)
                && !valueIsNullOrBlank(this.excerpt)
                && !valueIsNullOrBlank(this.body);
    }

    public boolean canBePublished() {
        boolean hasPublishableStatus = this.status == ArticleStatus.DRAFT
                || this.status == ArticleStatus.WITHDRAWN;

        return hasPublishableStatus
                && hasRequiredContent();
    }

    public void publish(String generatedSlug) {
        if (this.status != ArticleStatus.DRAFT
                && this.status != ArticleStatus.WITHDRAWN) {

            throw new ArticleStateException(
                    "Only draft or withdrawn articles can be published");
        }

        if (!hasRequiredContent()) {
            throw new ArticleStateException(
                    "Article is not ready to be published");
        }

        if (this.slug == null) {
            assignSlug(generatedSlug);
        }

        setPublishedAtIfAbsent();

        this.status = ArticleStatus.PUBLISHED;
    }

    public void withdraw() {
        if (this.status != ArticleStatus.PUBLISHED) {
            throw new ArticleStateException("Only published articles can be withdrawn");
        }
        this.status = ArticleStatus.WITHDRAWN;
    }

    private void setPublishedAtIfAbsent() {
        if (this.publishedAt == null) {
            this.publishedAt = OffsetDateTime.now(ZoneOffset.UTC);
        }
    }

    private void assignSlug(String slug) {
        if (valueIsNullOrBlank(slug)) {
            throw new IllegalArgumentException(
                    "Slug cannot be null or blank");
        }

        if (this.slug != null) {
            throw new ArticleStateException(
                    "Article already has a slug");
        }

        this.slug = slug;
    }

    public void changeCoverImage(
            String coverImageUrl,
            String coverImageAlt) {

        boolean hasImageUrl = !valueIsNullOrBlank(coverImageUrl);

        boolean hasImageAlt = !valueIsNullOrBlank(coverImageAlt);

        if (hasImageUrl != hasImageAlt) {
            throw new IllegalArgumentException(
                    "Cover image URL and alternative text must be provided together");
        }

        if (!hasImageUrl) {
            this.coverImageUrl = null;
            this.coverImageAlt = null;
            return;
        }

        validateExternalUrl(
                coverImageUrl,
                "Cover image URL must be an absolute HTTP or HTTPS URL");

        this.coverImageUrl = coverImageUrl.trim();
        this.coverImageAlt = coverImageAlt.trim();
    }

    public void changeRecommendedAudio(String audioTitle, String audioAuthor, String audioUrl) {

        boolean hasTitle = !valueIsNullOrBlank(audioTitle);

        boolean hasAuthor = !valueIsNullOrBlank(audioAuthor);

        boolean hasUrl = !valueIsNullOrBlank(audioUrl);

        if (!hasTitle && !hasAuthor && !hasUrl) {
            this.recommendedAudioTitle = null;
            this.recommendedAudioAuthor = null;
            this.recommendedAudioUrl = null;
            return;
        }

        if (!hasTitle || !hasUrl) {
            throw new IllegalArgumentException(
                    "Recommended audio title and URL must be provided together");
        }

        validateExternalUrl(
                audioUrl,
                "Recommended audio URL must be an absolute HTTP or HTTPS URL");

        this.recommendedAudioTitle = audioTitle.trim();

        this.recommendedAudioAuthor = hasAuthor
                ? audioAuthor.trim()
                : null;

        this.recommendedAudioUrl = audioUrl.trim();
    }

    private void validateExternalUrl(String url, String errorMessage) {
        URI uri;

        try {
            uri = URI.create(url.trim());
        } catch (IllegalArgumentException exception) {
            throw new IllegalArgumentException(
                    errorMessage,
                    exception);
        }

        boolean hasAllowedScheme = "http".equalsIgnoreCase(uri.getScheme())
                || "https".equalsIgnoreCase(uri.getScheme());

        if (!hasAllowedScheme || uri.getHost() == null) {
            throw new IllegalArgumentException(
                    errorMessage);
        }
    }

}
