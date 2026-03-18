
run:
	./mvnw clean spring-boot:run

migrations:
	./mvnw flyway:info -Dflyway.configFiles=flyway.conf
	# ./mvnw clean flyway:migrate -Dflyway.configFiles=flyway.conf

usql:
	usql postgresql://payroll_root:123123123@localhost:5432/payroll

