# PLANS

## Active plan

1. Confirm the product shape from `deep-research-report.md` and lock the execution assumptions. Completed.
2. Map the real repo surface area that will host the CRM shell, tenant routing, and auth. Completed.
3. Implement the auth and multi-tenant persistence foundation as a verifiable goal, not as a broad rewrite. Completed.
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
  - Prisma schema and generated client for the tenant core.
  - Security model draft.
  - Skills:
  - `backend-clean-architecture`
  - `refactor-large-file`
  - `deep-code-review`
- Goal output:
  - An architecture spec that developers can implement without guessing.
- Status:
  - The first multi-tenant persistence slice now exists in Prisma with tenants, tenant domains, tenant branding, and memberships.

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
- Status:
  - Request host parsing now distinguishes platform host, platform subdomain, and custom domain safely.
  - A server-only app context helper resolves tenant + membership for authenticated dashboard requests.

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
- Status:
  - Login, session helpers, proxy guards, and NextAuth type augmentation are in place.
  - Tenant membership enforcement now runs in the dashboard layout for tenant-scoped hosts.

### Phase 4.5: CRM data foundation
- Objective: create the first tenant-scoped CRM entities the WhatsApp and inbox flows will depend on.
- Deliverables:
  - Contact model.
  - Lead model.
  - Conversation model.
  - Message model.
  - Pipeline and stage models.
  - Generated Prisma client aligned with those entities.
- Skills:
  - `backend-clean-architecture`
  - `codex-progress-journal`
  - `deep-code-review`
- Goal output:
  - A domain model that can support inbound lead capture, inbox replies, and pipeline state changes.
- Status:
  - The initial CRM data slice now exists in Prisma and the generated client has been refreshed.

### Phase 4.6: Workspace bootstrap
- Objective: provision the first real tenant workspace against the new schema without depending on unfinished UI.
- Deliverables:
  - Reusable bootstrap service.
  - CLI command for local provisioning.
  - Owner membership creation.
  - Branding + primary domain creation.
  - Default commercial pipeline and stages.
- Skills:
  - `backend-clean-architecture`
  - `codex-progress-journal`
- Goal output:
  - A repeatable way to create the first workspace and prepare the database for inbox and webhook work.
- Status:
  - A bootstrap service and `npm run bootstrap:workspace` command now exist and are typechecked.

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
- Status:
  - A node-runtime webhook route now handles `hub.challenge`, validates `X-Hub-Signature-256`, and ignores non-WhatsApp objects safely.
  - Raw webhook items are now persisted one row per message/status with tenant-scoped idempotency via `eventKey`.
  - Inbound message events now upsert contact, lead, conversation, and message records through a dedicated inbox repository.
  - Status events are stored for audit and marked ignored until the status reconciliation slice is implemented.

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

1. Which Google OAuth client ID and secret should we use to enable the Google provider?
2. Which Meta app / WABA identifiers will be used when we start wiring WhatsApp Embedded Signup?
3. Which concrete tenant slug, tenant name, owner email, and optional owner password should we use when we run the first workspace bootstrap?
4. Once you share the Meta identifiers, do you want the next slice to be tenant integration registration/admin or status reconciliation plus outbound replies first?

## Deferred for now
- Any destructive or broad refactors.
- Domain-specific data models until the architecture and tenancy assumptions are confirmed.
- White-label implementation work.
