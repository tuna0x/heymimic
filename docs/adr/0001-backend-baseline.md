# ADR 0001: Backend modular monolith baseline

- Status: accepted
- Date: 2026-09-07

## Decision

Build one Spring Boot/Maven artifact under `com.dev.heymimic`, split by business module. Use Java
21, PostgreSQL, Flyway and package-boundary tests. Cross-module writes use public application APIs;
durable derived work uses PostgreSQL jobs and outbox records.

## Consequences

The application deploys and migrates as one unit. Modules cannot import another module's
persistence implementation. Docker is required for persistence integration tests. Provider
integrations remain behind module-owned ports.
