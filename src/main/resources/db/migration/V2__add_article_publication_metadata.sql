ALTER TABLE articles
    ADD COLUMN slug VARCHAR(300),
    ADD COLUMN published_at TIMESTAMP WITH TIME ZONE;

UPDATE articles
SET
    slug = 'article-' || id,
    published_at = CURRENT_TIMESTAMP
WHERE status = 'PUBLISHED';

ALTER TABLE articles
    ADD CONSTRAINT uk_articles_slug UNIQUE (slug);