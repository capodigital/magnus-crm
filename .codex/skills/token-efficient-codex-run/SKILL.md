---
name: token-efficient-codex-run
description: Use this when working in large repositories where Codex should minimize context usage and avoid unnecessary file scanning.
category: workflow
version: 1.0.0
status: stable
---

# Token Efficient Codex Run

## Goal

Complete tasks in large repositories while reading only the context needed for correctness.

## When to use

Use for large repos, vague tasks, unknown codebases, or when the user asks for efficient agent behavior.

## When not to use

Do not use when the task explicitly requires a full repository audit.

## Inputs

Start from user request, README, AGENTS.md, package manifests, and the smallest likely affected files.

## Workflow

1. Restate the target outcome internally.
2. Search by exact symbols, routes, filenames, or error text.
3. Open only the top relevant files.
4. Follow imports one hop at a time.
5. Prefer existing tests and scripts over broad scanning.
6. Stop reading once enough evidence exists to act safely.
7. Keep changes localized.
8. Expand scope only when evidence requires it.

## Quality bar

A good run is efficient, grounded, and does not miss obvious dependencies.

## Validation

Run targeted validation first, then broader checks only if the change touches shared infrastructure.

## Final response

Report the minimal context used, changed files, validation commands, and any areas intentionally not inspected.
