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

## Rationale

- Local notes travel with the project and stay relevant to the repo history.
- Keeping skills local avoids side effects on other projects and on the user-wide environment.
- The template already provides shared layout, theme, and navigation primitives that can be reused while the CRM is being introduced.
- The shell work should stay on the current template base instead of forcing a cleanup rewrite first.
- A dedicated tenant model keeps auth, membership, and branding concerns separated and makes white-label/domain control easier later.
- Exact-host-first resolution avoids accidentally treating arbitrary custom domains as trusted tenant slugs.
- Adding the CRM entities early gives the webhook and inbox work a stable contract to build against.
- A scriptable bootstrap path unblocks database provisioning, local testing, and early QA while the admin UI is still under construction.
