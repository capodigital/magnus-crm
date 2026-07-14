---
name: refactor-large-file
description: Use this when a file or module is too large, mixes responsibilities, duplicates logic, or needs safe incremental refactoring.
category: architecture
version: 1.0.0
status: stable
---

# Refactor Large File

## Goal

Reduce complexity safely without changing public behavior.

## When to use

Use when a file is too large, mixes responsibilities, contains duplicated logic, or is difficult to test.

## When not to use

Do not use for greenfield features unless the feature requires extracting existing behavior first.

## Inputs

Inspect the large file, direct imports/exports, tests, public interfaces, and nearby modules with similar patterns.

## Workflow

1. Identify existing responsibilities inside the file.
2. Mark public API boundaries that must not change.
3. Extract cohesive units, not random line ranges.
4. Move related tests near the new owner when practical.
5. Preserve imports and behavior incrementally.
6. Run tests after each meaningful extraction.
7. Delete dead code once references are removed.
8. Document important ownership changes.

## Extraction targets

Prefer named modules such as `invoiceTotals`, `userPermissions`, `orderStatusPolicy`, or `useGalleryFilters` instead of generic `utils` files.

## Validation

Run tests for affected behavior, typecheck, lint, and build if exports changed.

## Final response

Report extracted responsibilities, changed files, validation commands, and compatibility risks.
