package com.jose.mementoweb.domain.article;

public class Article {
    private Long id;
    private String title;
    private String pretitle;
    private String excerpt;
    private String body;
    private ArticleStatus status;

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
            throw new IllegalStateException(
                "A published article must have an excerpt"
            );
        }

        this.excerpt = excerpt;
    }

    public void changeBody(String body) {
        if (this.status == ArticleStatus.PUBLISHED && valueIsNullOrBlank(body)) {
            throw new IllegalStateException(
                "A published article must have a body"
            );
        }

        this.body = body;
    }


    private boolean valueIsNullOrBlank(String value) {
        return value == null || value.isBlank();
    }

    public boolean isReadyToPublish() {
        return !valueIsNullOrBlank(this.title ) && !valueIsNullOrBlank(this.excerpt) && !valueIsNullOrBlank(this.body);
    }

    public void publish() {

        if (this.status == ArticleStatus.PUBLISHED) {
            throw new IllegalStateException("Only draft or withdrawn articles can be published");
        }

        if (!isReadyToPublish()) {
            throw new IllegalStateException("Article is not ready to be published");
        }

        this.status = ArticleStatus.PUBLISHED;
    }

    public void withdraw() {
        if (this.status != ArticleStatus.PUBLISHED) {
            throw new IllegalStateException("Only published articles can be withdrawn");
        }
        this.status = ArticleStatus.WITHDRAWN;
    }


}
