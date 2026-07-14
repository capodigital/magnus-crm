---
name: frontend-production-ui
description: Use this when implementing or refactoring frontend UI, React components, styling, responsive layouts, accessibility, or production UX polish.
category: development
version: 1.0.0
status: stable
---

# Frontend Production UI

## Goal

Ship frontend changes that look polished, work across screen sizes, and remain maintainable.

## When to use

Use for React components, app pages, design systems, responsive layouts, accessibility, animations, and production UI polish.

## When not to use

Do not use for backend-only logic, database design, server security, or non-UI documentation.

## Inputs

Inspect the affected component, nearby components, shared styles, design tokens, accessibility patterns, and tests or stories if they exist.

## Workflow

1. Find the existing UI pattern before creating a new one.
2. Keep components small and composable.
3. Separate state, data loading, and presentation when practical.
4. Prefer semantic HTML and accessible controls.
5. Preserve responsive behavior across mobile, tablet, and desktop.
6. Avoid hardcoded magic values when tokens or variables exist.
7. Check loading, empty, error, and success states.
8. Keep animations purposeful and non-blocking.

## Quality bar

Good UI code is readable, accessible, responsive, visually consistent, and does not duplicate existing component patterns.

## Validation

Run relevant lint, typecheck, tests, component previews, and build. Manually inspect responsive states when possible.

## Final response

Report files changed, UI behavior changed, validation commands, and any states that were not manually verified.
