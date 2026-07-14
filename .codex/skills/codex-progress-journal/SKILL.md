---
name: codex-progress-journal
description: Use this when maintaining progress notes, task state, plans, decisions, or handoff context for long-running Codex work.
category: workflow
version: 1.0.0
status: stable
---

# Codex Progress Journal

## Goal

Keep long-running agent work understandable and resumable.

## When to use

Use when work spans multiple sessions, multiple agents, large refactors, uncertain plans, or important decisions.

## When not to use

Do not use for tiny one-shot tasks where notes would add noise.

## Inputs

Inspect existing `CODEX_STATE.md`, `PLANS.md`, `DECISIONS.md`, issue notes, and recent changed files.

## Workflow

1. Capture the current objective.
2. Record assumptions and constraints.
3. Track files touched and why.
4. Record decisions that should survive the session.
5. Keep plans short and update them as reality changes.
6. Mark completed, blocked, and deferred work.
7. Remove stale notes when they become misleading.

## Journal files

- `CODEX_STATE.md`: current state and next action.
- `PLANS.md`: active and proposed implementation plans.
- `DECISIONS.md`: durable decisions and rationale.
- `PROJECT_INDEX.md`: repo map and commands.

## Validation

Verify notes match the actual repository state before finalizing.

## Final response

Summarize what changed in notes, current status, and next safe action.
