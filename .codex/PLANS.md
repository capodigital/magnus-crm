# PLANS

## Active plan

1. Confirm the product shape from `deep-research-report.md` and lock the execution assumptions. Completed.
2. Map the real repo surface area that will host the CRM shell, tenant routing, and auth. Completed.
3. Implement the first CRM foundation slice as a verifiable goal, not as a broad rewrite. In progress.
4. Expand into WhatsApp, billing, white-label, and hardening only after the foundation is stable. Next.

## Assumed defaults until overridden

- Multi-tenant from day one.
- Combined auth for the first version via NextAuth.
- Embedded Signup planned from the start.
- Core CRM before white-label polish.
- Start from the current template shell and evolve it incrementally.
- White-label is deferred for now.

## Execution phases

### Phase 0: Discovery and scope lock
- Objective: turn the report into a concrete execution model with explicit assumptions.
- Deliverables:
  - Confirmed MVP boundary.
  - Known constraints and tradeoffs.
  - Open questions list with decision owners.
  - Default assumptions recorded when the user has not chosen yet.
  - User decisions captured for multi-tenant SaaS, NextAuth, Embedded Signup, and white-label deferral.
- Skills:
  - `codex-progress-journal`
  - `deep-code-review`
- Goal output:
  - A planning artifact that survives handoff and keeps scope honest.

### Phase 1: Repo baseline and app map
- Objective: understand the current Next.js template and the smallest safe entry points.
- Deliverables:
  - Repo map.
  - Route map.
  - Layout map.
  - Initial journal state.
  - App shell notes for the vertical/horizontal layout system and provider stack.
- Skills:
  - `codex-progress-journal`
  - `deep-code-review`
  - `debug-root-cause`
- Goal output:
  - A clear list of files and surfaces that will be touched first.
  - This phase is now complete and captured in the journal.

### Phase 2: Architecture and data design
- Objective: define the multi-tenant architecture, persistence model, and request flow.
- Deliverables:
  - Tenant resolution strategy.
  - Domain strategy.
  - Prisma schema draft.
  - Security model draft.
- Skills:
  - `backend-clean-architecture`
  - `refactor-large-file`
  - `deep-code-review`
- Goal output:
  - An architecture spec that developers can implement without guessing.

### Phase 3: App shell and tenant routing
- Objective: make the app resolve host, tenant, and branding cleanly.
- Deliverables:
  - Host-based routing.
  - Tenant-aware shell.
  - Branding injection points.
  - Public/private surface split.
  - CRM-oriented navigation and route placeholders now exist as the first shell slice.
- Skills:
  - `frontend-production-ui`
  - `refactor-large-file`
  - `backend-clean-architecture`
- Goal output:
  - A shell that can already render as SaaS or white-label without changing the core.

### Phase 4: Auth and RBAC
- Objective: protect the surfaces and model roles correctly.
- Deliverables:
  - Login flow.
  - Session handling.
  - Role checks.
  - Tenant membership rules.
- Skills:
  - `backend-clean-architecture`
  - `debug-root-cause`
  - `deep-code-review`
- Goal output:
  - A secure boundary around private CRM data.

### Phase 5: WhatsApp integration
- Objective: integrate the official Meta Cloud API with durable event handling.
- Deliverables:
  - Webhook verification.
  - Signature validation.
  - Raw event store.
  - Queue-based inbound/outbound processing.
  - Idempotent message handling.
- Skills:
  - `debug-root-cause`
  - `backend-clean-architecture`
  - `codex-progress-journal`
- Goal output:
  - Reliable message ingestion and reply delivery.

### Phase 6: CRM workflow
- Objective: turn inbound WhatsApp activity into contacts, leads, and conversations.
- Deliverables:
  - Inbox.
  - Contact creation/upsert rules.
  - Lead lifecycle.
  - Pipeline and assignment flow.
  - Reply composer.
- Skills:
  - `frontend-production-ui`
  - `pixel-perfect-qa`
  - `deep-code-review`
- Goal output:
  - A usable CRM loop from message to pipeline action.

### Phase 7: Billing and cost ledger
- Objective: make Meta cost transparent and reconcilable.
- Deliverables:
  - Rate card model.
  - Delivered-message ledger.
  - Invoice lines.
  - Cost dashboard.
  - Reconciliation flow.
- Skills:
  - `backend-clean-architecture`
  - `release-readiness-check`
  - `deep-code-review`
- Goal output:
  - A billing system the customer can audit.

### Phase 8: White-label and domain control
- Objective: make the product feel like the customer’s own CRM.
- Deliverables:
  - Custom domains.
  - Wildcard/subdomain strategy.
  - Branding system.
  - Email domain setup.
  - Redirect and canonical handling.
- Skills:
  - `frontend-production-ui`
  - `website-seo-finalization`
  - `pixel-perfect-qa`
- Goal output:
  - A credible white-label experience on both web and email surfaces.

### Phase 9: Hardening and release readiness
- Objective: prepare the product for real usage and handoff.
- Deliverables:
  - Security hardening.
  - Backups and restore posture.
  - Observability.
  - QA pass.
  - Release checklist.
- Skills:
  - `deep-code-review`
  - `release-readiness-check`
  - `token-efficient-codex-run`
  - `pixel-perfect-qa`
- Goal output:
  - A release candidate with a defensible operational posture.

## Open questions

1. Which environment keys and provider details are needed to turn on NextAuth in this repo?
2. Which Meta app / WABA identifiers will be used when we start wiring WhatsApp Embedded Signup?
3. Do you want a dedicated tenant resolver file or should we infer it from the existing layout and middleware surface first?
4. Should the first backend slice be auth/session storage or tenant tables and Prisma schema?

## Deferred for now
- Any destructive or broad refactors.
- Domain-specific data models until the architecture and tenancy assumptions are confirmed.
- White-label implementation work.
