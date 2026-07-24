package com.jose.mementoweb.domain.article;

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
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
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

    @Column(
        name = "published_at",
        columnDefinition = "TIMESTAMP WITH TIME ZONE"
    )
    private OffsetDateTime publishedAt;

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

    public String getSlug()
    {
        return slug;
    }
    
    public OffsetDateTime getPublishedAt()
    {
        return publishedAt;
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
                "A published article must have an excerpt"
            );
        }

        this.excerpt = excerpt;
    }

    public void changeBody(String body) {
        if (this.status == ArticleStatus.PUBLISHED && valueIsNullOrBlank(body)) {
            throw new ArticleStateException(
                "A published article must have a body"
            );
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
        boolean hasPublishableStatus =
            this.status == ArticleStatus.DRAFT
            || this.status == ArticleStatus.WITHDRAWN;

        return hasPublishableStatus
            && hasRequiredContent();
    }

    public void publish(String generatedSlug) {
        if (this.status != ArticleStatus.DRAFT
                && this.status != ArticleStatus.WITHDRAWN) {

            throw new ArticleStateException(
                "Only draft or withdrawn articles can be published"
            );
        }

        if (!hasRequiredContent()) {
            throw new ArticleStateException(
                "Article is not ready to be published"
            );
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
            this.publishedAt =
                OffsetDateTime.now(ZoneOffset.UTC);
        }
    }

    private void assignSlug(String slug) {
        if (valueIsNullOrBlank(slug)) {
            throw new IllegalArgumentException(
                "Slug cannot be null or blank"
            );
        }

        if (this.slug != null) {
            throw new ArticleStateException(
                "Article already has a slug"
            );
        }

        this.slug = slug;
    }


}
