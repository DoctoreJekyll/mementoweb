ALTER TABLE articles
    ADD COLUMN recommended_audio_title VARCHAR(255),
    ADD COLUMN recommended_audio_author VARCHAR(255),
    ADD COLUMN recommended_audio_url TEXT;

ALTER TABLE articles
    ADD CONSTRAINT chk_articles_recommended_audio
    CHECK (
        (
            recommended_audio_title IS NULL
            AND recommended_audio_author IS NULL
            AND recommended_audio_url IS NULL
        )
        OR
        (
            NULLIF(
                BTRIM(recommended_audio_title),
                ''
            ) IS NOT NULL
            AND NULLIF(
                BTRIM(recommended_audio_url),
                ''
            ) IS NOT NULL
            AND (
                recommended_audio_author IS NULL
                OR NULLIF(
                    BTRIM(recommended_audio_author),
                    ''
                ) IS NOT NULL
            )
        )
    );