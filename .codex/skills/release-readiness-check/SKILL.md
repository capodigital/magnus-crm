---
name: release-readiness-check
description: Use this when preparing a project, feature, website, or package for release with final validation and risk checks.
category: workflow
version: 0.5.0
status: beta
---

# Release Readiness Check

## Goal

Catch release blockers before a project is shipped.

## When to use

Use before deploying a website, merging a major feature, publishing a package, or handing a project to a client.

## When not to use

Do not use for early prototypes where speed matters more than launch quality.

## Inputs

Inspect release notes, changed files, package scripts, env requirements, tests, docs, deployment config, and user-facing flows.

## Workflow

1. Identify what is being released.
2. Check build, tests, lint, and typecheck.
3. Check environment variables and deployment configuration.
4. Check user-facing flows and error states.
5. Check security and secret exposure.
6. Check docs and handoff instructions.
7. Separate blockers from nice-to-have improvements.
8. Produce a concise go/no-go summary.

## Quality bar

A good readiness check is practical, prioritized, and honest about uncertainty.

## Validation

Run the release's required validation commands and any targeted smoke checks.

## Final response

Report go/no-go status, blockers, non-blocking improvements, validation output, and deployment notes.
