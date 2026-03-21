
run:
	./mvnw clean spring-boot:run

migrations:
	./mvnw flyway:migrate -Dflyway.configFiles=flyway.conf

migrations-info:
	./mvnw flyway:info -Dflyway.configFiles=flyway.conf

migrations-clear:
	./mvnw flyway:clean -Dflyway.configFiles=flyway.conf


usql:
	usql postgresql://library_root:123123@localhost:5432/library

