ALTER TABLE articles
    ADD COLUMN cover_image_url TEXT,
    ADD COLUMN cover_image_alt VARCHAR(500);

ALTER TABLE articles
    ADD CONSTRAINT chk_articles_cover_image_pair
    CHECK (
        (
            cover_image_url IS NULL
            AND cover_image_alt IS NULL
        )
        OR
        (
            NULLIF(BTRIM(cover_image_url), '') IS NOT NULL
            AND NULLIF(BTRIM(cover_image_alt), '') IS NOT NULL
        )
    );