# PLANS

## Active plan

1. Confirm the product shape from `deep-research-report.md` and lock the execution assumptions. Completed.
2. Map the real repo surface area that will host the CRM shell, tenant routing, and auth. Completed.
3. Implement the auth and multi-tenant persistence foundation as a verifiable goal, not as a broad rewrite. Completed.
4. Add the public launch surfaces required for access, legal review, and Meta publishing. Completed.
5. Expand into tenant onboarding, WhatsApp, billing, white-label, and hardening after the public/auth foundation is stable. Next.

### Maintenance fix: Next.js 16 settings render error
- Goal: keep Server/Client Component boundaries serializable in the shared CRM section surface.
- Root cause: `SectionPage` passed the `next/link` function as MUI Button's `component` prop while rendered from a Server Component.
- Resolution: use the existing action `href` directly on MUI Button.
- Validation: `npm run lint`, `npx tsc --noEmit --pretty false`, and `npm run build` passed on August 7, 2026.

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
  - Branding + optional explicit domain creation.
  - Default commercial pipeline and stages.
- Skills:
  - `backend-clean-architecture`
  - `codex-progress-journal`
- Goal output:
  - A repeatable way to create the first workspace and prepare the database for inbox and webhook work.
- Status:
  - A bootstrap service and `npm run bootstrap:workspace` command now exist and are typechecked.
  - The bootstrap path no longer generates a slug-based subdomain by default; domain creation is explicit via `BOOTSTRAP_DOMAIN_HOST`.

### Phase 4.7: Public launch surfaces
- Objective: ship the public web surfaces needed for launch, conversion, and Meta app review while the deeper CRM flows continue behind the scenes.
- Deliverables:
  - Marketing landing at `/`.
  - Public privacy policy page.
  - Public terms of service page.
  - Public data deletion instruction page.
  - Basic SEO metadata, robots, and sitemap.
  - Lightweight register/login adaptation for Magnus CRM.
  - Internal authenticated data deletion route for users.
- Skills:
  - `frontend-production-ui`
  - `website-seo-finalization`
  - `pixel-perfect-qa`
  - `codex-progress-journal`
- Goal output:
  - A production-facing public shell that can be shared for review and launch while backend onboarding continues.
- Status:
  - The root route now renders a public landing instead of redirecting to `/home`.
  - Privacy, terms, robots, and sitemap now exist and are wired for `crm.magnusecosystems.com`.
  - The public `/data-deletion` page now explains how users can delete their account and points to the authenticated `/settings/data-deletion` route.
  - Login and register now use Magnus CRM copy and legal links, with registration kept intentionally lightweight.
  - Users now have an authenticated self-service data deletion route at `/settings/data-deletion`.
  - Visual QA confirmed no console errors or horizontal overflow on the inspected public pages, including `/data-deletion`.
  - The public/auth/app shell brand now uses the Magnus CRM mark, favicon/app icons, manifest, and Open Graph image based on the logo palette.

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
  - Status events are stored for audit and now reconcile outbound messages by `wamid`, including `sent`, `delivered`, `read`, and `failed` states; unmatched status events remain pending for retry.
  - A dedicated CLI registration path now exists for mapping a Meta `phone_number_id` to a tenant after workspace bootstrap.

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
- Status:
  - The first read-only inbox slice now queries tenant-scoped WhatsApp conversations and latest messages.
  - The UI includes search, status filters, responsive conversation/thread panels, manual refresh, loading, empty, and recoverable error states.
  - A server-only text composer now sends through Meta, persists the returned `wamid`, and refreshes the active thread.
  - Outbound bubbles now show Meta delivery state, and the composer warns when free-form replies are outside the 24-hour customer-care window.
  - The server blocks free-form sends outside the 24-hour window and exposes a tenant-scoped approved-template send path.
  - Unread/read state, assignment, pagination, and realtime updates remain deferred; template management is tracked in the next workflow increment.

### Phase 6.5: WhatsApp reply window and templates
- Objective: make the WhatsApp policy understandable and operational for every tenant without exposing Meta complexity to agents.
- Deliverables:
  - Persist the latest inbound timestamp and calculate the 24-hour window on the server.
  - Show remaining time per conversation and clearly switch the composer from free text to template mode.
  - Create and synchronize tenant-owned text templates with Meta, including review examples and readable statuses.
  - Send only approved non-authentication templates outside the window and persist their outbound `wamid` for status reconciliation.
- Skills:
  - `backend-clean-architecture`
  - `frontend-production-ui`
  - `deep-code-review`
  - `refactor-large-file`
  - `codex-progress-journal`
- Goal output:
  - Agents can answer normally within the window and use an approved tenant template when it expires, with the reason and next action visible in the UI.
- Status:
  - Implemented in the inbox, settings, WhatsApp services, API routes, Prisma schema, and controlled migration.
  - The configured database was updated with `prisma db push`, backfilled through the idempotent Prisma script, and the migration was marked applied with `prisma migrate resolve`.
  - Live Meta approval/E2E testing and deployment of this validated build are still pending operator action.

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
4. Which tenant slug, tenant name, and owner email should we use to bootstrap the first real workspace in the current database?
5. Should post-registration create a starter workspace automatically, or should we keep account creation and tenant bootstrap separate for one more phase?

## Deferred for now
- Any destructive or broad refactors.
- Domain-specific data models until the architecture and tenancy assumptions are confirmed.
- White-label implementation work.
