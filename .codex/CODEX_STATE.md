# CODEX_STATE

## Current objective
Plan and execute the CRM described in `deep-research-report.md` using explicit goals, phased implementation, and project-local Codex skills.

## Current state
- Local Codex skills were installed in `.codex/skills` inside this project only.
- The repository is currently a Next.js admin template (`vuexy-mui-nextjs-admin-template`), not a CRM product yet.
- Main app entry points now include CRM route shells for home, inbox, leads, pipeline, billing, settings, and login, all wired into the shared layout/theme code.
- The root route and dashboard layout now redirect unauthenticated users to `/login`, and the login page handles credentials plus optional Google sign-in.
- The current shell uses a shared provider stack, a vertical or horizontal layout wrapper, and theme settings driven partly by cookies.
- The auth layer now uses NextAuth with Prisma, a `proxy.ts` guard, session helpers, and local NextAuth type augmentation.
- A server-only app context helper now resolves request host, session, tenant, and membership in one place.
- Dashboard access is now tenant-aware: platform-host requests still work with session auth, while tenant-scoped hosts require both a resolved tenant and a matching membership.
- The Prisma schema and generated client now include the tenant core plus the first CRM domain slice: contacts, leads, conversations, messages, pipelines, and pipeline stages.
- The repo now includes a reusable workspace bootstrap service and a CLI script to provision the first tenant, owner membership, branding, primary domain, and default pipeline.
- The Prisma schema now also includes the first WhatsApp integration slice: `WhatsappPhoneNumber`, `WhatsappWebhookEvent`, and conversation fields for `externalThreadKey` plus `whatsappPhoneNumberId`.
- A new WhatsApp webhook route now verifies `hub.challenge`, validates `X-Hub-Signature-256`, stores raw message/status events idempotently, and processes inbound message events into CRM entities.
- The backend now has dedicated modules for WhatsApp payload extraction, signature validation, raw event persistence, and CRM inbox upserts.
- The repo now has an expanded `.env.example` that lists the initial App, Database, NextAuth, Google, and Meta placeholders we will need.
- Google OAuth and Meta WhatsApp values are still pending from the user, as requested.
- The WhatsApp inbound slice now typechecks and lints cleanly against the current generated Prisma client.

## Assumptions and constraints
- Keep this journal local to the repo.
- Do not modify the global Codex skills directory.
- Treat the current codebase as the starting template and evolve it incrementally.
- Preserve existing framework conventions unless the CRM rewrite specifically requires a change.
- If the user has not answered a product-shaping question yet, proceed with the recommended default and record it instead of waiting.
- White-label work is intentionally deferred until the core CRM loop is stable.
- Keep using project-local progress notes and explicit plan updates for the long-running CRM build.
- Keep unresolved Meta phone numbers out of tenant processing until onboarding or manual registration creates a trusted `WhatsappPhoneNumber` mapping.

## Files touched in this journal pass
- `.codex/CODEX_STATE.md`
- `.codex/PLANS.md`
- `.codex/DECISIONS.md`
- `.codex/PROJECT_INDEX.md`
- `.env.example`
- `package.json`
- `src/app/(dashboard)/layout.tsx`
- `src/lib/app-context.ts`
- `src/lib/tenant.ts`
- `src/lib/workspace-bootstrap.ts`
- `src/lib/crm/inbox-repository.ts`
- `src/lib/whatsapp/webhook-types.ts`
- `src/lib/whatsapp/webhook-signature.ts`
- `src/lib/whatsapp/webhook-event-store.ts`
- `src/lib/whatsapp/inbound-service.ts`
- `src/app/api/webhooks/whatsapp/route.ts`
- `scripts/bootstrap-workspace.ts`
- `prisma/schema.prisma`
- `prisma/generated/prisma/*`

## Next safe action
Register the first tenant WhatsApp phone mapping (`META_WABA_ID`, `META_PHONE_NUMBER_ID`) and then exercise `/api/webhooks/whatsapp` with a signed Meta payload to verify raw event storage, idempotency, and CRM upserts end to end.
