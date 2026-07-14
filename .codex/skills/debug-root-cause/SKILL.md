---
name: debug-root-cause
description: Use this when a bug is reported but the root cause is unknown and code should not be changed until evidence is gathered.
category: debugging
version: 1.0.0
status: stable
---

# Debug Root Cause

## Goal

Find the smallest proven cause of a bug before editing code.

## When to use

Use when the user reports broken behavior, an error, regression, failing test, crash, incorrect output, or unexpected state.

## When not to use

Do not use when the fix is already known and the task is only implementation.

## Inputs

Collect the error message, reproduction steps, failing test, logs, relevant files, recent changes, and expected behavior.

## Workflow

1. Reproduce the failure or identify the exact failing path.
2. Read the smallest relevant files first.
3. Separate symptoms from possible causes.
4. Form one or more hypotheses.
5. Test each hypothesis using code, logs, tests, or runtime evidence.
6. Patch the root cause, not the visible symptom.
7. Add a regression test when the project has a test structure.
8. Re-run the failing scenario.

## Quality bar

A good debugging result explains why the bug happened, why the fix addresses the cause, and what validation proves it.

## Validation

Run the failing test or reproduction first, then run the smallest broader validation suite that makes sense.

## Final response

Report root cause, changed files, validation commands, and any remaining uncertainty.
