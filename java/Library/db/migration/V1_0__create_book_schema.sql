CREATE TABLE IF NOT EXISTS book (
    id BIGSERIAL PRIMARY KEY,
    author_name varchar(255) NOT NULL,
    title varchar(255) NOT NULL
);
