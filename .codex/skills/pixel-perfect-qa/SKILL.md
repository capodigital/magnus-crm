---
name: pixel-perfect-qa
description: Use this when performing final visual QA for frontend UI, responsive pages, landing pages, design systems, animations, spacing, typography, and production polish.
category: frontend-design
version: 1.0.0
status: stable
owner: frontend
tags:
  - qa
  - visual-review
  - pixel-perfect
  - responsive
  - frontend
---

# Pixel Perfect QA

## Goal

Catch visual, responsive, spacing, typography, alignment, and interaction issues before declaring UI work complete.

## When to use

Use at the end of UI work, before handoff, before launch, after a redesign, or when the user asks if the page looks polished/professional.

## Workflow

1. Review layout alignment, spacing rhythm, type scale, hierarchy, color contrast, image crops, icon alignment, and responsive breakpoints.
2. Check that mobile, tablet, and desktop each have intentional density and no accidental overflow.
3. Inspect interactive states: hover, focus, active, disabled, loading, empty, error, and success when relevant.
4. Check animation timing, cleanup, reduced-motion behavior, and whether motion supports the experience.
5. Look for generic AI leftovers: placeholder copy, repeated cards, random gradients, oversized headings, or unused decorative elements.
6. Fix small issues directly when safe; report larger issues separately if they require design decisions.

## Quality bar

- Run build/lint/typecheck or the nearest project validation.
- Manually inspect critical breakpoints when possible.
- Confirm no console errors or layout overflow if browser validation is available.

## Validation

- The page looks intentional at common breakpoints.
- Visual details align consistently and no obvious generic patterns remain.
- Interactive and responsive states are not ignored.

## Final response

- Report QA findings fixed, remaining issues, and validation performed.
