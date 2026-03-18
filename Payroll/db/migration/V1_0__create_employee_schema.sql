CREATE TABLE IF NOT EXISTS employee (
    id BIGSERIAL PRIMARY KEY,
    name varchar(20) NOT NULL,
    email varchar(50),
    date_of_birth timestamp
);
