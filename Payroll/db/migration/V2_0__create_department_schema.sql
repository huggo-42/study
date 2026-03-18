CREATE TABLE IF NOT EXISTS department (
    id BIGSERIAL PRIMARY KEY,
    name varchar(20)
);

ALTER TABLE employee ADD COLUMN dept_id bigint;
