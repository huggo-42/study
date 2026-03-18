# AGENTS.md - Developer Guide for Payroll

## Project Snapshot

- Spring Boot 3.5.11, Java 17, Maven wrapper (`./mvnw`)
- Minimal app shell with `PayrollApplication` and a simple `Product` model
- Dependencies: Spring Web, Spring Data JPA, HATEOAS, H2 (runtime), PostgreSQL
- Flyway plugin present, but no migrations yet

## Build, Lint, Test

```bash
# Clean + build (runs tests)
./mvnw clean package

# Run the app
./mvnw spring-boot:run

# Run with profile
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev

# Run all tests
./mvnw test

# Run a single test class
./mvnw test -Dtest=PayrollApplicationTests

# Run a single test method
./mvnw test -Dtest=PayrollApplicationTests#contextLoads

# Skip tests
./mvnw clean package -DskipTests
```

Linting

- No lint or formatter plugins configured in `pom.xml`
- Prefer IDE format-on-save or add a formatter only if the team agrees

## Cursor/Copilot Rules

- No `.cursor/rules/`, `.cursorrules`, or `.github/copilot-instructions.md` found

## Code Style Guidelines

General

- Use Java 17 features conservatively; keep code straightforward
- Keep lines under 120 chars when practical
- Always use braces for `if`, `for`, `while`, and `try`
- Match existing indentation (current files use tabs rendered as 4 spaces)

Imports

- Group imports by origin and keep deterministic order
- Recommended order with blank lines between groups:
  1. `java.*` / `javax.*` / `jakarta.*`
  2. `org.springframework.*`
  3. Third-party libraries
  4. `com.vhuggo42.Payroll.*`
- Avoid wildcard imports unless required by a framework

Formatting

- One top-level class per file
- Place annotations directly above the element they describe
- Keep constructors and fields ordered: constants, fields, constructors, methods
- Prefer `final` where immutability makes intent clearer

Naming

- Packages: lower-case (`com.vhuggo42.Payroll` per current code)
- Classes: `PascalCase` (e.g., `Product`, `PayrollApplication`)
- Methods/fields: `camelCase`
- Constants: `UPPER_SNAKE_CASE`
- Database tables/columns: `snake_case` (if/when using JPA annotations)

Types and Nulls

- Use wrapper types (`Long`, `Double`) only when null is meaningful
- Prefer primitives (`long`, `double`) when values are required
- Avoid returning `null`; use `Optional` for absent values

Error Handling

- Use domain-specific exceptions for not-found cases (`XxxNotFoundException`)
- Map errors with `@ControllerAdvice` or `@ResponseStatus`
- Prefer clear messages over generic exceptions

Spring and JPA Conventions

- Controllers: `@RestController` + explicit `@RequestMapping` base path
- Use `@GetMapping`, `@PostMapping`, `@PutMapping`, `@DeleteMapping`
- Repositories: extend `JpaRepository<,>` when added
- Entities: add `@Entity` and `@Table`, prefer `GenerationType.IDENTITY`
- Keep DTOs separate if the API needs a stable contract

HATEOAS

- If using links, return `EntityModel<T>` and build links with `WebMvcLinkBuilder`
- Keep link-building in a dedicated assembler class

Configuration

- `src/main/resources/application.properties` is the source of truth
- Use Spring profiles for environment-specific settings
- Keep secrets out of properties; rely on env vars or vaults

Database and Migrations

- H2 is enabled for runtime convenience; PostgreSQL is configured but commented
- If enabling Flyway, place migrations in `src/main/resources/db/migration`
- Use naming like `V1_0__create_product.sql`
- Never edit applied migrations; add new ones

Testing

- Use JUnit 5 and Spring Boot Test
- `@SpringBootTest` for full-context tests (current tests)
- `@DataJpaTest` for repository slices
- `@WebMvcTest` for controller slices

## Project Structure

```
src/
├── main/
│   ├── java/com/vhuggo42/Payroll/
│   │   ├── PayrollApplication.java
│   │   └── Product.java
│   └── resources/
│       └── application.properties
└── test/
    └── java/com/vhuggo42/Payroll/
        └── PayrollApplicationTests.java
```

## Notes for Agents

- This repo is intentionally minimal; introduce new layers (controller/service)
  only when the feature demands it
- Keep public API surface small and explicit
- Update this file if you add new tooling (formatter, linter, CI checks)
