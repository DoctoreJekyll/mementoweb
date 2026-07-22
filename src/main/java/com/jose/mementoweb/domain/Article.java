package com.jose.mementoweb.domain;

public class Article {
    private Long id;
    private String title;
    private String content;
    private ArticleStatus status;

    public Article(Long id, String title) {

        checkIfValueIsNull(id);
        checkIfValueIsNull(title);

        this.id = id;
        this.title = title;
        this.status = ArticleStatus.DRAFT;
    }

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public String getContent() {
        return content;
    }

    public ArticleStatus getStatus() {
        return status;
    }


    private void checkIfValueIsNull(Object value) {
        if (value == null) {
            throw new IllegalArgumentException("Value cannot be null");
        }
    }

    public void setStatus(ArticleStatus status) {
        checkIfValueIsNull(status);
        this.status = status;
    }

    public void changeTitle(String title) {
        checkIfValueIsNull(title);
        this.title = title;
    }

    public void setContent(String content) {
        checkIfValueIsNull(content);
        this.content = content;
    }

}
