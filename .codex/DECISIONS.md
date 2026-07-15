# DECISIONS

## Durable decisions

1. Keep Codex progress notes local to this repository under `.codex/`.
2. Keep installed project skills in `.codex/skills`, not in the global Codex skills directory.
3. Treat the current app as a Next.js admin template baseline and evolve it toward CRM functionality incrementally.
4. Prefer small, inspectable changes before any broad refactor.
5. Build the product as a multi-tenant SaaS from day one.
6. Use a combined NextAuth strategy for the first auth cut.
7. Plan WhatsApp Embedded Signup from the start.
8. Defer white-label implementation until the core CRM workflow is stable.
9. Model tenancy in Prisma with `Tenant`, `TenantDomain`, `TenantBranding`, and `Membership` instead of baking tenant data into the auth user row.
10. Keep Google OAuth and Meta WhatsApp credentials out of the repo until the user provides the final values.
11. Resolve tenant access by exact host first, and only fall back to slug matching for platform-managed wildcard subdomains.
12. Add the first CRM workflow entities directly to Prisma before implementing WhatsApp ingestion routes.
13. Bootstrap the first real workspace through a reusable CLI-backed service instead of waiting for a settings UI.
14. Persist WhatsApp webhook data as one raw event row per message or status item, keyed by a derived tenant-scoped `eventKey`, instead of one row per HTTP delivery.
15. Resolve WhatsApp webhook tenancy through a trusted `phone_number_id -> WhatsappPhoneNumber -> tenantId` mapping and ignore unmapped numbers until onboarding exists.
16. Use `externalThreadKey = phone_number_id:wa_id` so each tenant can keep a stable WhatsApp conversation thread per business number and contact pair.

## Rationale

- Local notes travel with the project and stay relevant to the repo history.
- Keeping skills local avoids side effects on other projects and on the user-wide environment.
- The template already provides shared layout, theme, and navigation primitives that can be reused while the CRM is being introduced.
- The shell work should stay on the current template base instead of forcing a cleanup rewrite first.
- A dedicated tenant model keeps auth, membership, and branding concerns separated and makes white-label/domain control easier later.
- Exact-host-first resolution avoids accidentally treating arbitrary custom domains as trusted tenant slugs.
- Adding the CRM entities early gives the webhook and inbox work a stable contract to build against.
- A scriptable bootstrap path unblocks database provisioning, local testing, and early QA while the admin UI is still under construction.
- Item-level raw event storage gives us better idempotency, better retries, and cleaner auditability than storing only the outer webhook POST.
- Tenant resolution through Meta `phone_number_id` is the safest first contract because webhook hosts do not identify the tenant.
- A stable external thread key lets inbound retries and future outbound/status reconciliation converge on the same conversation record.
