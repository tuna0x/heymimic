# ADR 0024: Code-first OpenAPI contract and frontend type generation

- Status: Accepted
- Date: 2026-09-08

## Context

The frontend has started replacing demo adapters with real backend calls. Handwritten copies of
request and response DTOs can drift from controller contracts, while exporting a live application
contract would otherwise require PostgreSQL, provider credentials and scheduler infrastructure.

## Decision

- Spring MVC controllers and their request/response DTOs remain the source of truth.
- Pin springdoc-openapi-starter-webmvc-api at 3.0.3, verified by the backend test suite against
  the Spring Boot 4.1.1 baseline.
- OpenApiContractTest imports every HTTP controller and mocks only application ports. DataSource,
  JPA and Flyway auto-configuration are excluded, so contract generation does not depend on Docker,
  PostgreSQL or paid providers.
- The generated JSON is compared semantically with backend/openapi/openapi.json. Property order
  and formatting do not create false drift, while any structural contract change fails normal
  backend tests.
- backend/scripts/export-openapi.ps1 is the only supported update path for the committed artifact.
- Pin openapi-typescript at 7.13.0. Frontend service boundaries consume types generated into
  frontend/src/service/generated/api-schema.d.ts; that generated file is never edited manually.
- API docs are available at /v3/api-docs in development and test and disabled in production.

## Consequences

- Backend and frontend contract drift is detected before packaging.
- DTO generation remains deterministic and works without an integration environment.
- Runtime behavior and validation still require controller/service tests; a schema match alone is
  not an end-to-end compatibility guarantee.
- Intentional API changes require exporting the artifact and regenerating frontend types in the
  same change.
