# ADR 0004: Identity persistence and password hashing

- Status: Accepted
- Date: 2026-09-07

## Context

Identity and learner data are aggregate-oriented and benefit from entity mapping, optimistic
locking and repository abstractions. Session-token rotation is different: it requires explicit row
locking and atomic consume-and-replace semantics under concurrent requests.

Passwords must use an adaptive password hash. Spring Security's Argon2 implementation requires a
Bouncy Castle provider at runtime.

Spring Boot 4 separates Flyway auto-configuration into the `spring-boot-flyway` module. Keeping only
`flyway-core` and the PostgreSQL database plugin leaves Hibernate schema validation able to run
before migrations.

## Decision

- Use Spring Data JPA for identity users, learner profiles and ordinary aggregate persistence.
- Keep explicit JDBC for refresh-token rotation and other concurrency-critical SQL that needs
  PostgreSQL row-lock behavior to be visible in code.
- Hash passwords with Spring Security's Argon2id defaults. Never persist or log plaintext passwords.
- Use Flyway as the only schema owner; Hibernate remains `ddl-auto=validate`.
- Include `spring-boot-flyway`, `flyway-core` and `flyway-database-postgresql` explicitly under
  Spring Boot 4.
- Store refresh, verification and reset tokens only as SHA-256 hashes. Raw tokens may only cross the
  API/provider boundary and must not be logged.

## Consequences

- Most business persistence stays concise and idiomatic, while locking behavior is not hidden behind
  ORM abstractions.
- Registration can create identity and learner records in one Spring transaction across module
  ports.
- Bouncy Castle is a deliberate runtime dependency and is pinned until dependency management is
  revisited.
- Integration tests must run migrations against PostgreSQL before validating JPA mappings.
