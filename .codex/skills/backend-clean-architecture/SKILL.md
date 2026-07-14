---
name: backend-clean-architecture
description: Use this when modifying backend routes, services, repositories, validation, errors, auth, database logic, or API architecture.
category: development
version: 1.0.0
status: stable
---

# Backend Clean Architecture

## Goal

Produce backend code that is small, testable, reusable, and easy to reason about. Keep orchestration at the edges and business behavior in focused modules.

## When to use

Use for backend features, API routes, controllers, services, database logic, auth, validation, error handling, and backend refactors.

## When not to use

Do not use for frontend-only UI work, copywriting, visual design, or unrelated project management tasks.

## Read first

1. The affected route/controller/handler.
2. Direct service/use-case imports.
3. Existing validator/schema/error helpers.
4. Database model/repository only if persistence changes.
5. Related tests if behavior changes.

Do not scan the whole backend unless the task requires an architecture review.

## Workflow

1. Identify the real owner of the behavior.
2. Keep request parsing and response formatting in routes/controllers.
3. Put business logic in services or use-cases.
4. Put persistence in repositories or query modules.
5. Reuse validation, auth, mapping, and error helpers.
6. Preserve public behavior unless the user asked for a behavior change.
7. Add regression coverage at the smallest meaningful seam.
8. Delete obsolete paths when safe.

## Architecture rules

- Routes/controllers parse request, call service/use-case, return response.
- Services/use-cases own business logic.
- Repositories/query modules own data access.
- Validators/schemas own input validation.
- Error helpers own normalized error responses.
- Auth/session helpers own identity and permission checks.
- External API calls live behind clients/adapters.
- Do not introduce hidden global state.

## Validation

Run available relevant commands: typecheck, lint, unit tests for affected modules, integration tests for changed endpoints, and build when meaningful.

## Final response

Report changed files, architecture decisions, validation output, and any known risks.
