CREATE TABLE articles (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    pretitle VARCHAR(255) NULL,
    excerpt TEXT NULL,
    body TEXT NULL,
    status VARCHAR(50) NOT NULL
);