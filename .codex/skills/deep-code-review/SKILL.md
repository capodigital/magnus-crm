---
name: deep-code-review
description: Use this when reviewing code, pull requests, diffs, architecture changes, security risks, regressions, or maintainability problems.
category: review
version: 1.0.0
status: stable
---

# Deep Code Review

## Goal

Find meaningful issues before merge while avoiding noisy or subjective feedback.

## When to use

Use for PR reviews, diffs, architecture reviews, risk reviews, and pre-merge checks.

## When not to use

Do not use when the user asks for direct implementation rather than review.

## Inputs

Inspect the diff, changed files, tests, affected public interfaces, dependency changes, and related docs.

## Workflow

1. Understand the intent of the change.
2. Review correctness first.
3. Check edge cases, error handling, data validation, and auth boundaries.
4. Check security and privacy risks.
5. Check maintainability, duplication, and architecture fit.
6. Check tests and validation coverage.
7. Prioritize findings by impact.
8. Avoid comments that are only personal style preferences.

## Severity levels

- Blocker: likely production breakage, data loss, security issue, or failed build.
- Major: likely bug, missing validation, risky architecture, or poor test coverage.
- Minor: maintainability or clarity issue worth fixing.
- Nit: optional style improvement.

## Validation

Recommend or run relevant tests, lint, typecheck, build, and security checks.

## Final response

List findings by severity with file references when possible. Include positives only if helpful and brief.
